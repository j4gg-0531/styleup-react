// src/pages/cliente/DashboardCliente.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { Home, Scissors, BookOpen, Smartphone, User, Zap, Clock, Bell } from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { useNotificaciones } from '../../context/useNotificaciones.js';

export default function DashboardCliente() {
  const { user } = useAuth();
  const { citas, cargarCitas, cancelarCita } = useCitas();

  useEffect(() => {
    if (user?.nombre) cargarCitas(user.nombre);
  }, [user, cargarCitas]);

  const citasPendientes = citas.filter((c) => c.estado === 'pendiente');
  const citasHistorial  = citas.filter((c) => c.estado !== 'pendiente');

  const handleCancelar = (id) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      cancelarCita(id);
    }
  };

  const badgePorEstado = {
    pendiente:  <span className="badge badge-gold">Pendiente</span>,
    completada: <span className="badge badge-green">Completada</span>,
    cancelada:  <span className="badge badge-muted">Cancelada</span>,
  };

  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard',        href: '/cliente' },
    { icon: <Scissors size={18} />, label: 'Barberos',          href: '/cliente/barberos' },
    { icon: <BookOpen size={18} />, label: 'Mi historial',      href: '/cliente/historial' },
    { icon: <Smartphone size={18} />, label: 'Vincular Telegram', href: '/cliente/telegram' },
    { icon: <Bell size={18} />, label: 'Notificaciones', href: '/cliente/notificaciones', notificacionesBadge: true },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar={<User size={20} />} badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content">
        <div className="welcome-banner">
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>¡Hola, {user?.nombre}!</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 4 }}>
              Aquí tienes un resumen de tu actividad en StyleUp.
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--gold)' }}>{citas.length}</div>
            <div className="stat-label">Citas agendadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--cobre-light)' }}>{citasPendientes.length}</div>
            <div className="stat-label">Próximas citas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#2ecc71' }}>
              {citas.filter((c) => c.estado === 'completada').length}
            </div>
            <div className="stat-label">Completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--muted)' }}>
              {citas.filter((c) => c.estado === 'cancelada').length}
            </div>
            <div className="stat-label">Canceladas</div>
          </div>
        </div>

        {/* Próximas citas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 className="card-title" style={{ marginBottom: 0 }}>Próximas citas</h3>
          <Link to="/cliente/agendar" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Zap size={16} /> Cita rápida</Link>
        </div>

        {citasPendientes.length === 0 ? (
          <div className="alert alert-info">
            No tienes citas próximas. ¡Agenda una ahora!
          </div>
        ) : (
          citasPendientes.map((c) => (
            <div key={c.id} className="cita-card">
              <div className="cita-date-block">
                <div className="cita-day">{c.fechaDia}</div>
                <div className="cita-month">{c.fechaMes}</div>
              </div>
              <div className="cita-info">
                <div className="cita-service">{c.servicio?.icon} {c.servicio?.name}</div>
                <div className="cita-meta">
                  <Clock size={14} /> {c.hora} · <Scissors size={14} /> {c.barbero?.name} · {c.servicio?.dur}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {badgePorEstado[c.estado]}
                <button
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--cobre-light)', borderColor: 'var(--cobre-light)' }}
                  onClick={() => handleCancelar(c.id)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ))
        )}

        {/* Historial reciente */}
        {citasHistorial.length > 0 && (
          <>
            <h3 className="card-title" style={{ marginTop: 24 }}>Historial reciente</h3>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Fecha</th><th>Hora</th><th>Servicio</th>
                      <th>Barbero</th><th>Duración</th><th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasHistorial.slice(-3).reverse().map((c) => (
                      <tr key={c.id}>
                        <td>{c.fechaDia} {c.fechaMes} {c.fechaAnio}</td>
                        <td>{c.hora}</td>
                        <td>{c.servicio?.name}</td>
                        <td>{c.barbero?.name}</td>
                        <td>{c.servicio?.dur}</td>
                        <td>{badgePorEstado[c.estado]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}