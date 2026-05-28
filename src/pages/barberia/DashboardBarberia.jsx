// src/pages/barberia/DashboardBarberia.jsx
import {  useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { barberiaService } from '../../services/barberiaService.js';

export default function DashboardBarberia() {
  const { user } = useAuth();
  
  const [ofertasActivas] = useState(
  () => barberiaService.getOfertas('BAR001').filter((o) => o.estado === 'activa').length
);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',  href: '/barberia' },
    { icon: '💈', label: 'Barberos',   href: '/barberia/barberos' },
    { icon: '📋', label: 'Ofertas',    href: '/barberia/ofertas' },
    { icon: '⏰', label: 'Horarios',   href: '/barberia/horarios' },
    { icon: '✂️', label: 'Servicios',  href: '/barberia/servicios' },
    { icon: '📊', label: 'Reportes',   href: '/barberia/reportes' },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar="🏪" badge="Barbería" badgeClass="badge-red" navItems={navItems} />

      <main className="main-content">
        <div className="welcome-banner">
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>¡Hola, {user?.nombre}! 🏪</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 4 }}>
              Panel de gestión de tu barbería
            </p>
          </div>
          <Link to="/barberia/ofertas" className="btn btn-primary">
            📋 Nueva oferta
          </Link>
        </div>

        <div className="stats-grid">
          {[
            ['3',  'Barberos activos',  'var(--gold)'],
            [String(ofertasActivas), 'Ofertas activas', 'var(--red-light)'],
            ['24', 'Citas este mes',    '#2ecc71'],
            ['0',  'Pendientes hoy',    'var(--muted)'],
          ].map(([v, l, c]) => (
            <div key={l} className="stat-card">
              <div className="stat-value" style={{ color: c }}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-title">💈 Barberos empleados</div>
            {[
              { nombre: 'Juan Pérez',    especialidad: 'Corte a tijera', estado: 'Disponible' },
              { nombre: 'Carlos López',  especialidad: 'Fade / Degradado', estado: 'En cita' },
              { nombre: 'Miguel Torres', especialidad: 'Diseño / Undercut', estado: 'Disponible' },
            ].map((b) => (
              <div key={b.nombre} className="cita-row">
                <div style={{ fontSize: '1.5rem' }}>💈</div>
                <div className="cita-detail">
                  <div className="cita-client">{b.nombre}</div>
                  <div className="cita-service-label">{b.especialidad}</div>
                </div>
                <span className={`badge ${b.estado === 'Disponible' ? 'badge-green' : 'badge-gold'}`}>
                  {b.estado}
                </span>
              </div>
            ))}
            <Link to="/barberia/barberos" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
              Ver todos →
            </Link>
          </div>

          <div className="card">
            <div className="card-title">📋 Ofertas recientes</div>
            {barberiaService.getOfertas('BAR001').slice(0, 2).map((o) => (
              <div key={o.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{o.titulo}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 6 }}>{o.fecha}</div>
                <span className={`badge ${o.estado === 'activa' ? 'badge-green' : 'badge-muted'}`}>
                  {o.estado === 'activa' ? 'Activa' : 'Cerrada'}
                </span>
              </div>
            ))}
            <Link to="/barberia/ofertas" className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>
              Ver todas →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}