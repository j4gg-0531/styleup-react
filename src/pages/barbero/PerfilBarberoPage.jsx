// src/pages/barbero/PerfilBarberoPage.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';

export default function PerfilBarberoPage() {
  const { user } = useAuth();
  const [saveOk, setSaveOk] = useState(false);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',    href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios', href: '/barbero/horarios' },
    { icon: '📋', label: 'Ofertas',      href: '/barbero/ofertas' },  // ← NUEVO
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
        <div className="page-header">
          <h2 className="page-title">✏️ Mi perfil</h2>
          <p className="page-subtitle">Datos personales y profesionales</p>
        </div>

        <div className="card" style={{ maxWidth: 540 }}>
          <div className="form-group">
            <label className="form-label">Cédula (no editable)</label>
            <input className="form-control" defaultValue="B001" readOnly style={{ opacity: 0.5 }} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Nombres</label>
              <input className="form-control" defaultValue={user?.nombre} />
            </div>
            <div className="form-group">
              <label className="form-label">Apellidos</label>
              <input className="form-control" defaultValue="Pérez" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Correo</label>
            <input className="form-control" defaultValue="barbero@correo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-control" defaultValue="3009876543" />
          </div>
          <div className="form-group">
            <label className="form-label">Especialidad</label>
            <select className="form-control">
              <option>Corte a tijera (30 min)</option>
              <option>Degradado / Fade (25 min)</option>
              <option>Afeitado con navaja (20 min)</option>
              <option>Corte + Barba (45 min)</option>
            </select>
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