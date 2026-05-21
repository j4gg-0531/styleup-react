// src/pages/cliente/Perfil.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';

export default function Perfil() {
  const { user } = useAuth();
  const [saveOk, setSaveOk] = useState(false);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',        href: '/cliente' },
    { icon: '💈', label: 'Barberos',          href: '/cliente/barberos' },
    { icon: '📖', label: 'Mi historial',      href: '/cliente/historial' },
    { icon: '✏️', label: 'Mi perfil',         href: '/cliente/perfil' },
    { icon: '📱', label: 'Vincular Telegram', href: '/cliente/telegram' },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar="👤" badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">✏️ Mi perfil</h2>
          <p className="page-subtitle">Actualiza tus datos personales</p>
        </div>

        <div className="card" style={{ maxWidth: 500 }}>
          <div className="form-group">
            <label className="form-label">Cédula (no editable)</label>
            <input className="form-control" defaultValue="1001234567" readOnly style={{ opacity: 0.5 }} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nombres</label>
              <input className="form-control" defaultValue={user?.nombre} />
            </div>
            <div className="form-group">
              <label className="form-label">Apellidos</label>
              <input className="form-control" defaultValue="García" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Correo</label>
            <input className="form-control" defaultValue="juan@correo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-control" defaultValue="3001234567" />
          </div>
          <hr className="divider" />
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nueva contraseña</label>
              <input type="password" className="form-control" placeholder="Dejar vacío" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar</label>
              <input type="password" className="form-control" />
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setSaveOk(true); setTimeout(() => setSaveOk(false), 3000); }}
          >
            Guardar cambios
          </button>
          {saveOk && (
            <div className="alert alert-success" style={{ marginTop: 8 }}>
              ✅ Perfil actualizado.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}