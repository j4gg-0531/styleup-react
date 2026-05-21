// src/pages/cliente/Telegram.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';

export default function Telegram() {
  const [tgOk, setTgOk] = useState(false);

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
          <h2 className="page-title">📱 Vincular Telegram</h2>
          <p className="page-subtitle">Recibe recordatorios automáticos de tus citas</p>
        </div>

        <div className="card" style={{ maxWidth: 500 }}>
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <strong>¿Cómo obtener tu Chat ID?</strong><br />
            1. Abre Telegram y busca el bot <strong>@StyleUpBot</strong><br />
            2. Escribe <strong>/start</strong> en el chat<br />
            3. El bot te mostrará tu Chat ID único<br />
            4. Ingrésalo aquí abajo
          </div>
          <div className="form-group">
            <label className="form-label">Chat ID de Telegram</label>
            <input className="form-control" placeholder="Ej: 1675586943" />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setTgOk(true); setTimeout(() => setTgOk(false), 3000); }}
          >
            Vincular cuenta
          </button>
          {tgOk && (
            <div className="alert alert-success" style={{ marginTop: 8 }}>
              ✅ Cuenta vinculada. Recibirás recordatorios por Telegram.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}