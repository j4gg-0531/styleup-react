// src/pages/barberia/Barberos.jsx
import { useNavigate } from 'react-router-dom';  // ← agregar este import
import Sidebar from '../../components/layout/Sidebar';

const BARBEROS_EMPLEADOS = [
  { id: 'B001', nombre: 'Juan Pérez',    especialidad: 'Corte a tijera',   estado: 'activo',   citasHoy: 3 },
  { id: 'B002', nombre: 'Carlos López',  especialidad: 'Fade / Degradado', estado: 'activo',   citasHoy: 2 },
  { id: 'B003', nombre: 'Miguel Torres', especialidad: 'Diseño / Undercut', estado: 'inactivo', citasHoy: 0 },
];

export default function BarberosBarberia() {
  const navigate = useNavigate();  // ← agregar esto

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
      <Sidebar avatar="🏪" badge="Barbería" badgeClass="badge-cobre" navItems={navItems} />
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">💈 Mis barberos</h2>
          <p className="page-subtitle">Haz clic en un barbero para ver su perfil completo</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {BARBEROS_EMPLEADOS.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{ padding: 20, cursor: 'pointer' }}
              onClick={() => navigate(`/barberia/barberos/${b.id}`)}  // ← navegar al perfil
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="barbero-avatar" style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                  💈
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                    {b.nombre}
                  </div>
                  <div style={{ color: 'var(--gold)', fontSize: '0.82rem' }}>
                    ✂ {b.especialidad}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Playfair Display',serif",
                      fontSize: '1.3rem', color: 'var(--gold)',
                    }}>
                      {b.citasHoy}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>citas hoy</div>
                  </div>
                  <span className={`badge ${b.estado === 'activo' ? 'badge-green' : 'badge-muted'}`}>
                    {b.estado === 'activo' ? '● Activo' : '● Inactivo'}
                  </span>
                  {/* Quitamos el botón "Ver horarios" — ahora toda la card es clickeable */}
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>›</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}