import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Home, Scissors, ClipboardList, Clock, BarChart3, Building2, BookOpen, Smartphone } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/useAuth.js';
import { useNotificaciones } from '../context/useNotificaciones.js';

const TIPO_ICON = {
  cita_cancelada: 'cancelada',
  cita_confirmada: 'confirmada',
  aplicacion_nueva: 'nueva',
  aplicacion_aceptada: 'aceptada',
  aplicacion_rechazada: 'rechazada',
  despedido: 'despedido',
  horario_modificado: 'horario',
  servicios_modificados: 'servicios',
  queja_cliente: 'queja',
  renuncia_barbero: 'renuncia',
};

const iconoPorTipo = (tipo) => {
  const map = {
    cita_cancelada: '❌',
    cita_confirmada: '✅',
    aplicacion_nueva: '📩',
    aplicacion_aceptada: '🎉',
    aplicacion_rechazada: '😞',
    despedido: '🚫',
    horario_modificado: '🕐',
    servicios_modificados: '✂️',
    queja_cliente: '⚠️',
    renuncia_barbero: '👋',
  };
  return map[tipo] || '🔔';
};

const navItemsCliente = [
  { icon: <Home size={18} />, label: 'Dashboard', href: '/cliente' },
  { icon: <Scissors size={18} />, label: 'Barberos', href: '/cliente/barberos' },
  { icon: <BookOpen size={18} />, label: 'Mi historial', href: '/cliente/historial' },
  { icon: <Smartphone size={18} />, label: 'Vincular Telegram', href: '/cliente/telegram' },
  { icon: <Bell size={18} />, label: 'Notificaciones', href: '/cliente/notificaciones', notificacionesBadge: true },
];

const navItemsBarbero = [
  { icon: <Home size={18} />, label: 'Dashboard', href: '/barbero' },
  { icon: <Clock size={18} />, label: 'Mis horarios', href: '/barbero/horarios' },
  { icon: <Scissors size={18} />, label: 'Mis servicios', href: '/barbero/precios' },
  { icon: <ClipboardList size={18} />, label: 'Ofertas', href: '/barbero/ofertas' },
  { icon: <BookOpen size={18} />, label: 'Historial', href: '/barbero/historial' },
  { icon: <BarChart3 size={18} />, label: 'Reportes', href: '/barbero/reportes' },
  { icon: <Bell size={18} />, label: 'Notificaciones', href: '/barbero/notificaciones', notificacionesBadge: true },
];

const navItemsBarberia = [
  { icon: <Home size={18} />, label: 'Dashboard', href: '/barberia' },
  { icon: <Scissors size={18} />, label: 'Barberos', href: '/barberia/barberos' },
  { icon: <ClipboardList size={18} />, label: 'Ofertas', href: '/barberia/ofertas' },
  { icon: <Clock size={18} />, label: 'Horarios', href: '/barberia/horarios' },
  { icon: <Scissors size={18} />, label: 'Servicios', href: '/barberia/servicios' },
  { icon: <BarChart3 size={18} />, label: 'Reportes', href: '/barberia/reportes' },
  { icon: <Bell size={18} />, label: 'Notificaciones', href: '/barberia/notificaciones', notificacionesBadge: true },
];

export default function Notificaciones() {
  const { user } = useAuth();
  const { notificaciones, noLeidas, cargarNotificaciones, marcarLeida, marcarTodasLeidas } = useNotificaciones();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.rol && user?.nombre) {
      cargarNotificaciones(user.rol, user.nombre);
    }
  }, [user, cargarNotificaciones]);

  const navMap = {
    cliente: { items: navItemsCliente, avatar: <Home size={20} />, badge: 'Cliente', badgeClass: 'badge-gold' },
    barbero: { items: navItemsBarbero, avatar: <Scissors size={20} />, badge: 'Barbero', badgeClass: '' },
    barberia: { items: navItemsBarberia, avatar: <Building2 size={20} />, badge: 'Barbería', badgeClass: 'badge-cobre' },
  };

  const config = navMap[user?.rol] || navMap.cliente;

  const handleClick = (n) => {
    if (!n.leida) {
      marcarLeida(n.id);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        avatar={config.avatar}
        badge={config.badge}
        badgeClass={config.badgeClass}
        navItems={config.items}
      />
      <main className="main-content">
        <div className="welcome-banner">
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>Notificaciones</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 4 }}>
              {noLeidas > 0 ? `Tienes ${noLeidas} notificación${noLeidas !== 1 ? 'es' : ''} sin leer` : 'No hay notificaciones nuevas'}
            </p>
          </div>
          {noLeidas > 0 && (
            <button className="btn btn-outline btn-sm" onClick={() => marcarTodasLeidas(user.rol, user.nombre)}>
              <CheckCheck size={16} /> Marcar todas como leídas
            </button>
          )}
        </div>

        {notificaciones.length === 0 ? (
          <div className="alert alert-info">
            <Bell size={18} /> No tienes notificaciones aún.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notificaciones.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: n.leida ? 'var(--surface)' : 'rgba(192,57,43,0.06)',
                  border: n.leida ? '1px solid var(--border)' : '1px solid rgba(192,57,43,0.15)',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover, rgba(255,255,255,0.03))'}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = n.leida ? 'var(--surface)' : 'rgba(192,57,43,0.06)';
                }}
              >
                <div style={{ fontSize: '1.2rem', lineHeight: 1 }}>
                  {iconoPorTipo(n.tipo)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.88rem',
                    fontWeight: n.leida ? 400 : 600,
                    color: n.leida ? 'var(--text)' : 'var(--text)',
                    marginBottom: 2,
                    lineHeight: 1.4,
                  }}>
                    {n.mensaje}
                  </div>
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    {new Date(n.fechaCreacion).toLocaleString('es-CO', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
                {!n.leida && (
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--cobre-light)',
                    flexShrink: 0,
                    marginTop: 6,
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
