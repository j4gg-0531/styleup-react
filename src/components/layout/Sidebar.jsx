import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';

export default function Sidebar({ avatar, badge, badgeClass = 'badge-red', navItems, extra }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
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
            onClick={() => item.href ? navigate(item.href) : item.onClick?.()}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </span>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-ghost btn-sm btn-block" onClick={logout}>
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  );
}