class AnalyticsPostgresAdapter {
  constructor(dbPool) {
    this.pool = dbPool;
  }

  // 1. Resumen general de KPIs
  async getKpis(startDate, endDate) {
    const query = `
      SELECT 
        COALESCE(SUM(total), 0) AS total_ingresos,
        COUNT(id) AS total_pedidos,
        COALESCE(AVG(total), 0) AS ticket_promedio,
        COUNT(DISTINCT usuario_id) AS clientes_activos
      FROM pedidos
      WHERE creado_en >= $1 AND creado_en <= $2;
    `;
    const res = await this.pool.query(query, [startDate, endDate]);
    return res.rows[0];
  }

  // 2. Ranking de productos más vendidos
  async getTopProducts(limit = 5, startDate, endDate) {
    const query = `
      SELECT 
        pr.id,
        pr.nombre,
        SUM(pd.cantidad) AS unidades_vendidas,
        SUM(pd.cantidad * pd.precio_unitario) AS monto_recaudado
      FROM pedido_detalles pd
      JOIN pedidos pe ON pd.pedido_id = pe.id
      JOIN productos pr ON pd.producto_id = pr.id
      WHERE pe.creado_en >= $1 AND pe.creado_en <= $2
      GROUP BY pr.id, pr.nombre
      ORDER BY unidades_vendidas DESC
      LIMIT $3;
    `;
    const res = await this.pool.query(query, [startDate, endDate, limit]);
    return res.rows;
  }

  // 3. Tendencia de ingresos por día
  async getRevenueTrend(startDate, endDate) {
    const query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('day', creado_en), 'YYYY-MM-DD') AS dia,
        COALESCE(SUM(total), 0) AS total_ventas,
        COUNT(id) AS total_pedidos
      FROM pedidos
      WHERE creado_en >= $1 AND creado_en <= $2
      GROUP BY DATE_TRUNC('day', creado_en)
      ORDER BY dia ASC;
    `;
    const res = await this.pool.query(query, [startDate, endDate]);
    return res.rows;
  }

  // 4. Distribución por estados
  async getOrdersStatusDistribution(startDate, endDate) {
    const query = `
      SELECT 
        estado,
        COUNT(id) AS cantidad,
        ROUND(
          (COUNT(id)::numeric / NULLIF((SELECT COUNT(*) FROM pedidos WHERE creado_en >= $1 AND creado_en <= $2), 0) * 100), 
          2
        ) AS porcentaje
      FROM pedidos
      WHERE creado_en >= $1 AND creado_en <= $2
      GROUP BY estado;
    `;
    const res = await this.pool.query(query, [startDate, endDate]);
    return res.rows;
  }
}

module.exports = AnalyticsPostgresAdapter;