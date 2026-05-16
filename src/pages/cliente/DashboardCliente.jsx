import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/AuthContext';

//const SECCIONES = ['dashboard', 'historial', 'perfil', 'telegram'];

export default function DashboardCliente() {
  const { user } = useAuth();
  const [sec, setSec] = useState('dashboard');
  const [saveOk, setSaveOk] = useState(false);
  const [tgOk, setTgOk] = useState(false);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',       href: '/cliente' },
    { icon: '📅', label: 'Agendar cita',    href: '/cliente/agendar' },
    { icon: '📖', label: 'Mi historial',    onClick: () => setSec('historial') },
    { icon: '✏️', label: 'Mi perfil',       onClick: () => setSec('perfil') },
    { icon: '📱', label: 'Vincular Telegram', onClick: () => setSec('telegram') },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar="👤" badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content">
        {/* DASHBOARD */}
        {sec === 'dashboard' && (
          <div>
            <div className="welcome-banner">
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>¡Hola, {user?.nombre}! 👋</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 4 }}>Aquí tienes un resumen de tu actividad en StyleUp.</p>
              </div>
              <Link to="/cliente/agendar" className="btn btn-primary">📅 Nueva cita</Link>
            </div>

            <div className="stats-grid">
              {[['3','Citas agendadas','var(--gold)'],['1','Próxima cita','var(--red-light)'],['8','Completadas','#2ecc71'],['2','Canceladas','var(--muted)']].map(([v,l,c]) => (
                <div key={l} className="stat-card">
                  <div className="stat-value" style={{ color: c }}>{v}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Próximas citas</h3>
              <Link to="/cliente/agendar" className="btn btn-primary btn-sm">+ Nueva cita</Link>
            </div>

            {[{ day:'15', month:'Jun', service:'✂ Corte a tijera', meta:'⏰ 10:00 AM · 💈 Juan Pérez · 30 min' },
              { day:'22', month:'Jun', service:'🪒 Afeitado con navaja', meta:'⏰ 02:00 PM · 💈 Carlos López · 20 min' }].map((c) => (
              <div key={c.day} className="cita-card">
                <div className="cita-date-block">
                  <div className="cita-day">{c.day}</div>
                  <div className="cita-month">{c.month}</div>
                </div>
                <div className="cita-info">
                  <div className="cita-service">{c.service}</div>
                  <div className="cita-meta">{c.meta}</div>
                </div>
                <span className="badge badge-gold">Pendiente</span>
              </div>
            ))}

            <h3 className="card-title" style={{ marginTop: 24 }}>Historial reciente</h3>
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Fecha</th><th>Servicio</th><th>Barbero</th><th>Duración</th><th>Estado</th></tr></thead>
                  <tbody>
                    <tr><td>2025-05-28</td><td>Degradado / Fade</td><td>Juan Pérez</td><td>25 min</td><td><span className="badge badge-green">Completada</span></td></tr>
                    <tr><td>2025-05-10</td><td>Corte a tijera</td><td>Carlos López</td><td>30 min</td><td><span className="badge badge-green">Completada</span></td></tr>
                    <tr><td>2025-04-30</td><td>Diseño en cabello</td><td>Juan Pérez</td><td>40 min</td><td><span className="badge badge-muted">Cancelada</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {sec === 'historial' && (
          <div>
            <div className="page-header">
              <h2 className="page-title">📖 Mi historial</h2>
              <p className="page-subtitle">Todas tus citas registradas en StyleUp</p>
            </div>
            <div className="card">
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <select className="form-control" style={{ maxWidth: 180 }}>
                  <option>Todos los estados</option><option>Completada</option><option>Cancelada</option><option>Pendiente</option>
                </select>
                <input type="date" className="form-control" style={{ maxWidth: 180 }} />
                <button className="btn btn-outline btn-sm">Filtrar</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Fecha</th><th>Hora</th><th>Servicio</th><th>Barbero</th><th>Duración</th><th>Estado</th></tr></thead>
                  <tbody>
                    <tr><td>2025-06-15</td><td>10:00</td><td>Corte a tijera</td><td>Juan Pérez</td><td>30 min</td><td><span className="badge badge-gold">Pendiente</span></td></tr>
                    <tr><td>2025-05-28</td><td>14:00</td><td>Degradado</td><td>Juan Pérez</td><td>25 min</td><td><span className="badge badge-green">Completada</span></td></tr>
                    <tr><td>2025-04-30</td><td>11:00</td><td>Diseño en cabello</td><td>Juan Pérez</td><td>40 min</td><td><span className="badge badge-muted">Cancelada</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PERFIL */}
        {sec === 'perfil' && (
          <div>
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
                <div className="form-group"><label className="form-label">Nombres</label><input className="form-control" defaultValue="Juan" /></div>
                <div className="form-group"><label className="form-label">Apellidos</label><input className="form-control" defaultValue="García" /></div>
              </div>
              <div className="form-group"><label className="form-label">Correo</label><input className="form-control" defaultValue="juan@correo.com" /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" defaultValue="3001234567" /></div>
              <hr className="divider" />
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Nueva contraseña</label><input type="password" className="form-control" placeholder="Dejar vacío" /></div>
                <div className="form-group"><label className="form-label">Confirmar</label><input type="password" className="form-control" /></div>
              </div>
              <button className="btn btn-primary" onClick={() => { setSaveOk(true); setTimeout(() => setSaveOk(false), 3000); }}>
                Guardar cambios
              </button>
              {saveOk && <div className="alert alert-success" style={{ marginTop: 8 }}>✅ Perfil actualizado.</div>}
            </div>
          </div>
        )}

        {/* TELEGRAM */}
        {sec === 'telegram' && (
          <div>
            <div className="page-header">
              <h2 className="page-title">📱 Vincular Telegram</h2>
              <p className="page-subtitle">Recibe recordatorios automáticos de tus citas</p>
            </div>
            <div className="card" style={{ maxWidth: 500 }}>
              <div className="alert alert-info mb-2">
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
              <button className="btn btn-primary" onClick={() => { setTgOk(true); setTimeout(() => setTgOk(false), 3000); }}>
                Vincular cuenta
              </button>
              {tgOk && <div className="alert alert-success" style={{ marginTop: 8 }}>✅ Cuenta vinculada. Recibirás recordatorios por Telegram.</div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}