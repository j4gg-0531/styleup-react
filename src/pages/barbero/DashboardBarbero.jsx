import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';

const CITAS_HOY = [
  { hora:'09:00', cliente:'María García', servicio:'Corte a tijera · 30 min', estado:'done' },
  { hora:'10:00', cliente:'Andrés Ruiz', servicio:'Degradado · 25 min', estado:'done' },
  { hora:'11:00', cliente:'Carlos Medina', servicio:'Corte + Barba · 45 min', estado:'pend' },
  { hora:'02:00', cliente:'Luis Herrera', servicio:'Afeitado navaja · 20 min', estado:'pend' },
  { hora:'03:00', cliente:'Pedro Salcedo', servicio:'Undercut · 35 min', estado:'pend' },
];

export default function DashboardBarbero() {
  const [sec, setSec] = useState('dashboard');
  const [saveOk, setSaveOk] = useState(false);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',     href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios',  href: '/barbero/horarios' },
    { icon: '📅', label: 'Mis citas',     onClick: () => setSec('citas') },
    { icon: '✏️', label: 'Mi perfil',     onClick: () => setSec('perfil') },
    { icon: '📊', label: 'Reportes',      onClick: () => setSec('reportes') },
  ];

  const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">

        {/* DASHBOARD */}
        {sec === 'dashboard' && (
          <div>
            <div className="today-header">
              <div>
                <div className="today-date">Lunes, 9 de junio</div>
                <div className="today-sub">Tu agenda de hoy</div>
              </div>
              <Link to="/barbero/horarios" className="btn btn-outline btn-sm">⏰ Gestionar horarios</Link>
            </div>

            <div className="stats-grid">
              {[['8','Citas hoy','var(--gold)'],['3','Pendientes','var(--red-light)'],['5','Completadas','#2ecc71'],['6h','Tiempo trabajado','var(--muted)']].map(([v,l,c]) => (
                <div key={l} className="stat-card">
                  <div className="stat-value" style={{ color: c }}>{v}</div>
                  <div className="stat-label">{l}</div>
                </div>
              ))}
            </div>

            <div className="grid-2" style={{ gap: 20 }}>
              <div className="card">
                <div className="card-title">📅 Agenda del día</div>
                {CITAS_HOY.map((c) => (
                  <div key={c.hora} className="cita-row">
                    <div className="cita-hora">{c.hora}</div>
                    <div className={`cita-bar ${c.estado === 'done' ? 'bar-completada' : 'bar-pendiente'}`} />
                    <div className="cita-detail">
                      <div className="cita-client">{c.cliente}</div>
                      <div className="cita-service-label">{c.servicio}</div>
                    </div>
                    <span className={`badge ${c.estado === 'done' ? 'badge-green' : 'badge-gold'}`}>
                      {c.estado === 'done' ? 'Hecha' : 'Pend.'}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div className="card-title">📊 Esta semana</div>
                  {[['Lunes','8',80],['Martes','6',60],['Miércoles','10',100],['Jueves','4',40]].map(([d,n,w]) => (
                    <div key={d} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                        <span>{d}</span><span className="text-gold">{n} citas</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${w}%`, background: w === 100 ? 'var(--gold)' : 'var(--red)', borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-title">🔗 Telegram</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>Recibe notificaciones cuando lleguen nuevas citas.</p>
                  <button className="btn btn-outline btn-sm" onClick={() => alert('En el proyecto real esto vincula tu cuenta de Telegram.')}>
                    📱 Vincular Telegram
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CITAS */}
        {sec === 'citas' && (
          <div>
            <div className="page-header">
              <h2 className="page-title">📅 Mis citas</h2>
              <p className="page-subtitle">Historial completo de citas agendadas</p>
            </div>
            <div className="card">
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <input type="date" className="form-control" style={{ maxWidth: 200 }} />
                <select className="form-control" style={{ maxWidth: 180 }}>
                  <option>Todos los estados</option><option>Pendiente</option><option>Completada</option><option>Cancelada</option>
                </select>
                <button className="btn btn-outline btn-sm">Filtrar</button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Fecha</th><th>Hora</th><th>Cliente</th><th>Servicio</th><th>Duración</th><th>Estado</th><th>Acción</th></tr></thead>
                  <tbody>
                    <tr><td>2025-06-09</td><td>09:00</td><td>María García</td><td>Corte a tijera</td><td>30 min</td><td><span className="badge badge-green">Completada</span></td><td>—</td></tr>
                    <tr><td>2025-06-09</td><td>11:00</td><td>Carlos Medina</td><td>Corte + Barba</td><td>45 min</td><td><span className="badge badge-gold">Pendiente</span></td><td><button className="btn btn-success btn-sm">✓ Completar</button></td></tr>
                    <tr><td>2025-06-07</td><td>14:00</td><td>Andrés Ruiz</td><td>Undercut</td><td>35 min</td><td><span className="badge badge-muted">Cancelada</span></td><td>—</td></tr>
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
              <p className="page-subtitle">Datos personales y profesionales</p>
            </div>
            <div className="card" style={{ maxWidth: 540 }}>
              <div className="form-group"><label className="form-label">Cédula (no editable)</label><input className="form-control" defaultValue="B001" readOnly style={{ opacity: 0.5 }} /></div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Nombres</label><input className="form-control" defaultValue="Juan" /></div>
                <div className="form-group"><label className="form-label">Apellidos</label><input className="form-control" defaultValue="Pérez" /></div>
              </div>
              <div className="form-group"><label className="form-label">Correo</label><input className="form-control" defaultValue="juan.barbero@correo.com" /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" defaultValue="3009876543" /></div>
              <div className="form-group">
                <label className="form-label">Especialidad</label>
                <select className="form-control">
                  <option>Corte a tijera (30 min)</option><option>Degradado / Fade (25 min)</option>
                  <option>Afeitado con navaja (20 min)</option><option>Corte + Barba (45 min)</option>
                </select>
              </div>
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

        {/* REPORTES */}
        {sec === 'reportes' && (
          <div>
            <div className="page-header">
              <h2 className="page-title">📊 Reportes</h2>
              <p className="page-subtitle">Estadísticas de tu desempeño</p>
            </div>
            <div className="grid-2">
              <div className="card">
                <div className="card-title">Servicios más realizados</div>
                {[['Corte a tijera','42',85],['Degradado / Fade','28',57],['Corte + Barba','15',30]].map(([s,n,w]) => (
                  <div key={s} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                      <span>{s}</span><span className="text-gold">{n} citas</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--border)', borderRadius: 4 }}>
                      <div style={{ height: '100%', width: `${w}%`, background: w > 80 ? 'var(--gold)' : 'var(--red)', borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title">Resumen del mes</div>
                <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['85','Citas totales','var(--gold)'],['78','Completadas','#2ecc71'],['7','Canceladas','var(--muted)'],['91%','Efectividad','var(--red-light)']].map(([v,l,c]) => (
                    <div key={l} className="stat-card" style={{ padding: 14 }}>
                      <div className="stat-value" style={{ fontSize: '1.6rem', color: c }}>{v}</div>
                      <div className="stat-label">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}