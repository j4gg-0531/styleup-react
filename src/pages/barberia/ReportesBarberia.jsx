// src/pages/barberia/ReportesBarberia.jsx
import { useState } from 'react';
import { Home, Scissors, ClipboardList, Clock, BarChart3, Building2 } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

export default function ReportesBarberia() {
  const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [mesFiltro, setMesFiltro]   = useState(new Date().getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  // FUTURO: estos datos vendrán de /api/barberias/:id/reportes?mes=X&anio=Y
  const datosSimulados = {
    gananciasTotal: 1250000,
    citasCompletadas: 42,
    citasCanceladas: 5,
    barberoTop: 'Juan Pérez',
    gananciasPorBarbero: [
      { nombre: 'Juan Pérez',    ganancias: 580000, citas: 18 },
      { nombre: 'Carlos López',  ganancias: 420000, citas: 14 },
      { nombre: 'Miguel Torres', ganancias: 250000, citas: 10 },
    ],
  };

  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard',  href: '/barberia' },
    { icon: <Scissors size={18} />, label: 'Barberos',   href: '/barberia/barberos' },
    { icon: <ClipboardList size={18} />, label: 'Ofertas',    href: '/barberia/ofertas' },
    { icon: <Clock size={18} />, label: 'Horarios',   href: '/barberia/horarios' },
    { icon: <Scissors size={18} />, label: 'Servicios',  href: '/barberia/servicios' },
    { icon: <BarChart3 size={18} />, label: 'Reportes',   href: '/barberia/reportes' },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar={<Building2 size={20} />} badge="Barbería" badgeClass="badge-cobre" navItems={navItems} />
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={22} /> Reportes</h2>
          <p className="page-subtitle">Ganancias consolidadas de tu barbería</p>
        </div>

        {/* Filtro */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
              Filtrar por período:
            </span>
            <select className="form-control" style={{ maxWidth: 160 }} value={mesFiltro}
              onChange={(e) => setMesFiltro(Number(e.target.value))}>
              {mesesNombres.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select className="form-control" style={{ maxWidth: 120 }} value={anioFiltro}
              onChange={(e) => setAnioFiltro(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats generales */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            [formatPrecio(datosSimulados.gananciasTotal), 'Ganancias totales', 'var(--gold)'],
            [String(datosSimulados.citasCompletadas), 'Citas completadas', '#2ecc71'],
            [String(datosSimulados.citasCanceladas), 'Canceladas', 'var(--muted)'],
            [datosSimulados.barberoTop, 'Barbero top', 'var(--cobre-light)'],
          ].map(([v, l, c]) => (
            <div key={l} className="stat-card">
              <div className="stat-value" style={{ color: c, fontSize: '1.3rem' }}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        {/* Ganancias por barbero */}
        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={18} /> Ganancias por barbero</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Barbero</th><th>Citas</th><th>Ganancias</th><th>%</th></tr>
              </thead>
              <tbody>
                {datosSimulados.gananciasPorBarbero.map((b) => (
                  <tr key={b.nombre}>
                    <td><strong>{b.nombre}</strong></td>
                    <td>{b.citas}</td>
                    <td style={{ color: 'var(--gold)' }}>{formatPrecio(b.ganancias)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                          <div style={{
                            height: '100%', borderRadius: 3, background: 'var(--cobre)',
                            width: `${Math.round((b.ganancias / datosSimulados.gananciasTotal) * 100)}%`
                          }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', minWidth: 32 }}>
                          {Math.round((b.ganancias / datosSimulados.gananciasTotal) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}