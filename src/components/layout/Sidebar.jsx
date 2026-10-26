import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';
import { useNotificaciones } from '../../context/useNotificaciones.js';

let _expandido = false;

export default function Sidebar({ avatar, badge, badgeClass = 'badge-cobre', navItems, extra }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandido, setExpandido] = useState(_expandido);

  const [tema, setTema] = useState(() => localStorage.getItem('styleup_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('styleup_theme', tema);
  }, [tema]);

  const toggleTema = () => setTema((prev) => (prev === 'dark' ? 'light' : 'dark'));

  const { notificaciones, noLeidas, cargarNotificaciones } = useNotificaciones();

  useEffect(() => {
    if (user?.rol && user?.nombre) {
      cargarNotificaciones(user.rol, user.nombre);
    }
  }, [user, cargarNotificaciones]);

  const perfilHref = user?.rol === 'cliente' ? '/cliente/perfil'
    : user?.rol === 'barbero' ? '/barbero/perfil'
    : user?.rol === 'barberia' ? '/barberia/perfil'
    : null;

  const handleMouseEnter = () => {
    _expandido = true;
    setExpandido(true);
  };

  const handleMouseLeave = () => {
    _expandido = false;
    setExpandido(false);
  };

  return (
    <aside
      className={`sidebar ${expandido ? 'expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="sidebar-header" style={{ cursor: 'pointer' }} onClick={() => perfilHref && navigate(perfilHref)}>
        <div className="sidebar-avatar">{avatar}</div>
        <div className="sidebar-name">{user?.nombre}</div>
        <div className="sidebar-role">
          <span className={`badge ${badgeClass}`}>{badge}</span>
        </div>
        {extra}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => (
          <span
            key={i}
            className={`nav-item ${location.pathname === item.href ? 'active' : ''}`}
            onClick={() => {
              item.onClick?.();
              if (item.href) navigate(item.href);
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.notificacionesBadge && noLeidas > 0 && (
              <span className="badge badge-notification">{noLeidas}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-ghost btn-sm btn-block" onClick={toggleTema}>
          {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          <span>{tema === 'dark' ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>
        <button className="btn btn-ghost btn-sm btn-block" onClick={() => {_expandido = false; logout();}}>
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}