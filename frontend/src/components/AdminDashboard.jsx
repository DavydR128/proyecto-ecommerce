import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const API_BASE = "http://localhost:3000/api";

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async (selectedRange) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analytics/dashboard?range=${selectedRange}`);
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error cargando analíticas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(range);
  }, [range]);

  if (loading || !metrics) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8b949e', fontSize: '15px' }}>
        Cargando analíticas comerciales...
      </div>
    );
  }

  const hasTrendData = metrics.revenueTrend && metrics.revenueTrend.length > 0;
  const hasStatusData = metrics.statusDistribution && metrics.statusDistribution.length > 0;

  const barData = {
    labels: (metrics.revenueTrend || []).map((d) => d.dia),
    datasets: [
      {
        label: 'Ventas ($)',
        data: (metrics.revenueTrend || []).map((d) => Number(d.total_ventas)),
        backgroundColor: '#1f6feb',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#8b949e' } }
    },
    scales: {
      x: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } },
      y: { ticks: { color: '#8b949e' }, grid: { color: '#21262d' } }
    }
  };

  const pieData = {
    labels: (metrics.statusDistribution || []).map((s) => s.estado),
    datasets: [
      {
        data: (metrics.statusDistribution || []).map((s) => Number(s.cantidad)),
        backgroundColor: ['#238636', '#d29922', '#da3633', '#1f6feb', '#8957e5'],
        borderColor: '#161b22',
        borderWidth: 2
      }
    ]
  };

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0', color: '#f0f6fc' }}>
            Dashboard de Métricas Analíticas
          </h2>
          <p style={{ margin: 0, color: '#8b949e', fontSize: '14px' }}>
            Métricas de ventas, pedidos y tendencias en tiempo real.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#8b949e' }}>Filtrar por:</span>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#0d1117',
              color: '#e6edf3',
              border: '1px solid #30363d',
              fontSize: '13px',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>

      {/* Grid de 4 KPIs balanceados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={kpiCardStyle}>
          <div style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ingresos Totales</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#3fb950', marginTop: '6px' }}>
            ${Number(metrics.kpis?.total_ingresos || 0).toFixed(2)}
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total de Pedidos</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#f0f6fc', marginTop: '6px' }}>
            {metrics.kpis?.total_pedidos || 0}
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ticket Promedio</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#58a6ff', marginTop: '6px' }}>
            ${Number(metrics.kpis?.ticket_promedio || 0).toFixed(2)}
          </div>
        </div>

        <div style={kpiCardStyle}>
          <div style={{ fontSize: '12px', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clientes Activos</div>
          <div style={{ fontSize: '26px', fontWeight: '700', color: '#f0f6fc', marginTop: '6px' }}>
            {metrics.kpis?.clientes_activos || 0}
          </div>
        </div>
      </div>

      {/* Sección Gráficas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={boxStyle}>
          <h3 style={{ fontSize: '15px', color: '#f0f6fc', marginTop: 0, marginBottom: '16px' }}>Tendencia de Ingresos</h3>
          <div style={{ height: '240px' }}>
            {hasTrendData ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <div style={emptyStateStyle}>No hay registro de ventas en este período temporal</div>
            )}
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={{ fontSize: '15px', color: '#f0f6fc', marginTop: 0, marginBottom: '16px' }}>Estados de Pedidos</h3>
          <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasStatusData ? (
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#8b949e' } } } }} />
            ) : (
              <div style={emptyStateStyle}>Sin pedidos registrados</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla Top Productos */}
      <div style={{ ...boxStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #30363d', fontSize: '15px', fontWeight: '600', color: '#f0f6fc' }}>
          Top 5 Productos más Vendidos
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#21262d', borderBottom: '1px solid #30363d', color: '#8b949e' }}>
              <th style={{ padding: '12px 20px' }}>Producto</th>
              <th style={{ padding: '12px 20px', textAlign: 'center' }}>Unidades</th>
              <th style={{ padding: '12px 20px', textAlign: 'right' }}>Monto Recaudado</th>
            </tr>
          </thead>
          <tbody>
            {(metrics.topProducts || []).map((prod) => (
              <tr key={prod.id} style={{ borderBottom: '1px solid #21262d' }}>
                <td style={{ padding: '14px 20px', fontWeight: '600', color: '#f0f6fc' }}>{prod.nombre}</td>
                <td style={{ padding: '14px 20px', textAlign: 'center', color: '#58a6ff' }}>{prod.unidades_vendidas}</td>
                <td style={{ padding: '14px 20px', textAlign: 'right', color: '#3fb950', fontWeight: '700' }}>
                  ${Number(prod.monto_recaudado || 0).toFixed(2)}
                </td>
              </tr>
            ))}
            {(!metrics.topProducts || metrics.topProducts.length === 0) && (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '24px', color: '#8b949e' }}>
                  No se registraron ventas en el período seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const kpiCardStyle = {
  background: '#161b22',
  borderRadius: '12px',
  border: '1px solid #30363d',
  padding: '18px 20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const boxStyle = {
  background: '#161b22',
  borderRadius: '12px',
  border: '1px solid #30363d',
  padding: '20px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const emptyStateStyle = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b949e',
  fontSize: '13px'
};