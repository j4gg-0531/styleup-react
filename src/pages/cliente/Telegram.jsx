// src/pages/cliente/Telegram.jsx
import { useState } from 'react';
import { Home, Scissors, BookOpen, Smartphone, User, Smartphone as SmartphoneIcon, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

export default function Telegram() {
  const [tgOk, setTgOk] = useState(false);

  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard',        href: '/cliente' },
    { icon: <Scissors size={18} />, label: 'Barberos',          href: '/cliente/barberos' },
    { icon: <BookOpen size={18} />, label: 'Mi historial',      href: '/cliente/historial' },
    { icon: <Smartphone size={18} />, label: 'Vincular Telegram', href: '/cliente/telegram' },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar={<User size={20} />} badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><SmartphoneIcon size={22} /> Vincular Telegram</h2>
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
            <div className="alert alert-success" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} /> Cuenta vinculada. Recibirás recordatorios por Telegram.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}