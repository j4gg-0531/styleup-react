// src/pages/barberia/PerfilBarberia.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';

export default function PerfilBarberia() {
  const { user } = useAuth();
  const [saveOk, setSaveOk] = useState(false);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',  href: '/barberia' },
    { icon: '💈', label: 'Barberos',   href: '/barberia/barberos' },
    { icon: '📋', label: 'Ofertas',    href: '/barberia/ofertas' },
    { icon: '⏰', label: 'Horarios',   href: '/barberia/horarios' },
    { icon: '✂️', label: 'Servicios',  href: '/barberia/servicios' },
    { icon: '📊', label: 'Reportes',   href: '/barberia/reportes' },
    { icon: '✏️', label: 'Mi perfil',  href: '/barberia/perfil' },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar="🏪" badge="Barbería" badgeClass="badge-red" navItems={navItems} />
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">✏️ Perfil de la barbería</h2>
          <p className="page-subtitle">Datos del negocio</p>
        </div>

        <div className="card" style={{ maxWidth: 540 }}>
          <div className="form-group">
            <label className="form-label">NIT (no editable)</label>
            <input className="form-control" defaultValue="900123456-1" readOnly style={{ opacity: 0.5 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Nombre de la barbería</label>
            <input className="form-control" defaultValue={user?.nombre} />
          </div>
          <div className="form-group">
            <label className="form-label">Correo</label>
            <input className="form-control" defaultValue="barberia@correo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-control" defaultValue="3001234567" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input className="form-control" defaultValue="Calle 10 #5-32" />
            </div>
            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <input className="form-control" defaultValue="Valledupar" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" rows={3} defaultValue="Barbería profesional con años de experiencia." style={{ resize: 'vertical' }} />
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
          <button className="btn btn-primary"
            onClick={() => { setSaveOk(true); setTimeout(() => setSaveOk(false), 3000); }}>
            Guardar cambios
          </button>
          {saveOk && <div className="alert alert-success" style={{ marginTop: 8 }}>✅ Perfil actualizado.</div>}
        </div>
      </main>
    </div>
  );
}