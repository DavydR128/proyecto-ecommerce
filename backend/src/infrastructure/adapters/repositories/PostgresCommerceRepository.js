const pool = require('../../config/db');

class PostgresCommerceRepository {
  async listarProductos() {
    const res = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    return res.rows;
  }

  async crearProducto({ nombre, descripcion, precio, stock }) {
    const res = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, descripcion, precio, stock]
    );
    return res.rows[0];
  }

  async actualizarProducto(id, { nombre, descripcion, precio, stock }) {
    const res = await pool.query(
      'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4 WHERE id = $5 RETURNING *',
      [nombre, descripcion, precio, stock, id]
    );
    return res.rows[0];
  }

  async eliminarProducto(id) {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    return true;
  }

  async listarPedidos() {
    const res = await pool.query(`
      SELECT p.id, p.usuario_id, p.total, p.estado, p.creado_en, u.nombre AS cliente_nombre 
      FROM pedidos p 
      JOIN usuarios u ON p.usuario_id = u.id 
      ORDER BY p.id DESC
    `);
    return res.rows;
  }

  async crearPedidoTransaccional(usuarioId, items) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      let total = 0;
      for (const item of items) {
        const prod = await client.query('SELECT * FROM productos WHERE id = $1 FOR UPDATE', [item.producto_id]);
        if (prod.rows.length === 0) throw new Error('Producto no encontrado');
        if (prod.rows[0].stock < item.cantidad) throw new Error(`Stock insuficiente para ${prod.rows[0].nombre}`);

        total += parseFloat(prod.rows[0].precio) * item.cantidad;
        await client.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [item.cantidad, item.producto_id]);
      }

      const pedidoRes = await client.query(
        'INSERT INTO pedidos (usuario_id, total, estado) VALUES ($1, $2, $3) RETURNING *',
        [usuarioId, total, 'PAGADO']
      );

      const pedidoId = pedidoRes.rows[0].id;
      for (const item of items) {
        const prod = await client.query('SELECT precio FROM productos WHERE id = $1', [item.producto_id]);
        await client.query(
          'INSERT INTO pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
          [pedidoId, item.producto_id, item.cantidad, prod.rows[0].precio]
        );
      }

      await client.query('COMMIT');
      return pedidoRes.rows[0];
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = new PostgresCommerceRepository();
