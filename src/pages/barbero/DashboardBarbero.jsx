// src/pages/barbero/DashboardBarbero.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { citasService } from '../../services/citasService.js';
import { preciosService } from '../../services/preciosService.js';

export default function DashboardBarbero() {
  const { user } = useAuth();
  const { citas, cargarCitas } = useCitas();

  useEffect(() => {
    if (user?.nombre) cargarCitas(user.nombre);
  }, [user, cargarCitas]);

  const hoy = new Date().getDate().toString();
  const citasHoy = citas.filter(
    (c) => c.barbero?.name === user?.nombre && c.fechaDia === hoy
  );

  const citasPendientesHoy  = citasHoy.filter((c) => c.estado === 'pendiente').length;
  const citasCompletadasHoy = citasHoy.filter((c) => c.estado === 'completada').length;

  const gananciasHoy = citasHoy
    .filter((c) => c.estado === 'completada')
    .reduce((total, c) => {
      const precio = preciosService.getPrecioServicio(user.nombre, c.servicio?.id);
      return total + precio;
    }, 0);

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  const handleCompletarCita = (citaId) => {
    citasService.completarCita(citaId);
    cargarCitas(user.nombre);
  };

  const badgePorEstado = {
    pendiente:  <span className="badge badge-gold">Pendiente</span>,
    completada: <span className="badge badge-green">Completada</span>,
    cancelada:  <span className="badge badge-muted">Cancelada</span>,
  };

  const navItems = [
    { icon: '🏠', label: 'Dashboard',    href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios', href: '/barbero/horarios' },
    { icon: '📖', label: 'Historial',    href: '/barbero/historial' },
    { icon: '💰', label: 'Mis precios',  href: '/barbero/precios' },
    { icon: '📊', label: 'Reportes',     href: '/barbero/reportes' },
    { icon: '✏️', label: 'Mi perfil',    href: '/barbero/perfil' },
  ];

  const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">
        <div className="today-header">
          <div>
            <div className="today-date">
              {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="today-sub">Tu agenda de hoy</div>
          </div>
          <Link to="/barbero/horarios" className="btn btn-outline btn-sm">
            ⏰ Gestionar horarios
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{citasHoy.length}</div>
            <div className="stat-label">Citas hoy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--red-light)' }}>{citasPendientesHoy}</div>
            <div className="stat-label">Pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#2ecc71' }}>{citasCompletadasHoy}</div>
            <div className="stat-label">Completadas hoy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--gold)', fontSize: '1.3rem' }}>
              {formatPrecio(gananciasHoy)}
            </div>
            <div className="stat-label">Ganancias de hoy</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">📅 Agenda de hoy</div>
          {citasHoy.length === 0 ? (
            <div className="alert alert-info">No tienes citas para hoy.</div>
          ) : (
            citasHoy.map((c) => (
              <div key={c.id} className="cita-row">
                <div className="cita-hora">{c.hora}</div>
                <div className={`cita-bar ${c.estado === 'completada' ? 'bar-completada' : 'bar-pendiente'}`} />
                <div className="cita-detail">
                  <div className="cita-client">{c.clienteNombre}</div>
                  <div className="cita-service-label">{c.servicio?.name} · {c.servicio?.dur}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {badgePorEstado[c.estado]}
                  {c.estado === 'pendiente' && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleCompletarCita(c.id)}
                    >
                      ✓ Completar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}