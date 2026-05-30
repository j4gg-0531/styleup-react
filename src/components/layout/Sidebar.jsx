import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/useAuth.js';

let _expandido = false;

export default function Sidebar({ avatar, badge, badgeClass = 'badge-cobre', navItems, extra }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandido, setExpandido] = useState(_expandido);

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
          </span>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-ghost btn-sm btn-block" onClick={() => {_expandido = false; logout();}}>
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}