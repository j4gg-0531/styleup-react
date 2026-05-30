// src/pages/barbero/Reportes.jsx
import { useState, useEffect } from 'react';
import { Home, Clock, Scissors, ClipboardList, BookOpen, BarChart3 } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { preciosService, NOMBRES_SERVICIOS } from '../../services/preciosService.js';

export default function Reportes() {
  const { user } = useAuth();
  const { citas, cargarCitas } = useCitas();

  const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [mesFiltro, setMesFiltro]   = useState(new Date().getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user?.nombre) cargarCitas(user.nombre);
  }, [user, cargarCitas]);

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  const citasReportes = citas.filter((c) => {
    const mesesMap = { 'Ene':1,'Feb':2,'Mar':3,'Abr':4,'May':5,'Jun':6,
                       'Jul':7,'Ago':8,'Sep':9,'Oct':10,'Nov':11,'Dic':12 };
    const mesCita  = mesesMap[c.fechaMes] || 0;
    const anioCita = Number(c.fechaAnio);
    return c.barbero?.name === user?.nombre &&
           mesCita === mesFiltro &&
           anioCita === anioFiltro;
  });

  const gananciasReportes = citasReportes
    .filter((c) => c.estado === 'completada')
    .reduce((total, c) => {
      const precio = preciosService.getPrecioServicio(user.nombre, c.servicio?.id);
      return total + precio;
    }, 0);

  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard',     href: '/barbero' },
    { icon: <Clock size={18} />, label: 'Mis horarios',  href: '/barbero/horarios' },
    { icon: <Scissors size={18} />, label: 'Mis servicios', href: '/barbero/precios' },
    { icon: <ClipboardList size={18} />, label: 'Ofertas',       href: '/barbero/ofertas' },
    { icon: <BookOpen size={18} />, label: 'Historial',     href: '/barbero/historial' },
    { icon: <BarChart3 size={18} />, label: 'Reportes',      href: '/barbero/reportes' },
  ];

  const extra = <div className="spec-badge" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Scissors size={14} /> Corte a tijera</div>;

  return (
    <div className="app-layout">
      <Sidebar avatar={<Scissors size={20} />} badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={22} /> Reportes</h2>
          <p className="page-subtitle">Estadísticas y ganancias por período</p>
        </div>

        {/* Filtro mes/año */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
              Filtrar por período:
            </span>
            <select
              className="form-control"
              style={{ maxWidth: 160 }}
              value={mesFiltro}
              onChange={(e) => setMesFiltro(Number(e.target.value))}
            >
              {mesesNombres.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              className="form-control"
              style={{ maxWidth: 120 }}
              value={anioFiltro}
              onChange={(e) => setAnioFiltro(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              {citasReportes.length} citas encontradas
            </span>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BarChart3 size={18} /> Resumen del período</div>
            <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                [formatPrecio(gananciasReportes), 'Ganancias', 'var(--gold)'],
                [citasReportes.filter((c) => c.estado === 'completada').length, 'Completadas', '#2ecc71'],
                [citasReportes.filter((c) => c.estado === 'cancelada').length, 'Canceladas', 'var(--muted)'],
                [citasReportes.length, 'Total agendadas', 'var(--cobre-light)'],
              ].map(([v, l, c]) => (
                <div key={l} className="stat-card" style={{ padding: 14 }}>
                  <div className="stat-value" style={{ fontSize: '1.3rem', color: c }}>{v}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Scissors size={18} /> Servicios del período</div>
            {Object.entries(NOMBRES_SERVICIOS).map(([id, nombre]) => {
              const cantidad = citasReportes.filter(
                (c) => c.servicio?.id === id && c.estado === 'completada'
              ).length;
              const ganancia = cantidad * preciosService.getPrecioServicio(user.nombre, id);
              const total = citasReportes.filter((c) => c.estado === 'completada').length;
              return (
                <div key={id} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span>{nombre}</span>
                    <span className="text-gold">{cantidad} citas · {formatPrecio(ganancia)}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                    <div style={{
                      height: '100%',
                      width: total > 0 ? `${Math.min((cantidad / total) * 100, 100)}%` : '0%',
                      background: 'var(--cobre)', borderRadius: 3,
                      minWidth: cantidad > 0 ? '4px' : 0
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}