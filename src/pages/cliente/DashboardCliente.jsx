// src/pages/cliente/DashboardCliente.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js'; // ← NUEVO

export default function DashboardCliente() {
  const { user } = useAuth();
  const { citas, cargarCitas, cancelarCita } = useCitas(); // ← NUEVO
  const [sec, setSec] = useState('dashboard');
  const [saveOk, setSaveOk] = useState(false);
  const [tgOk, setTgOk] = useState(false);

  // Carga las citas del usuario al entrar al dashboard
  useEffect(() => {
    if (user?.nombre) cargarCitas(user.nombre);
  }, [user, cargarCitas]);

  // Separa citas según estado para mostrarlas en distintas secciones
  const citasPendientes  = citas.filter((c) => c.estado === 'pendiente');
  const citasHistorial   = citas.filter((c) => c.estado !== 'pendiente');

  // Función para cancelar con confirmación simple
  const handleCancelar = (id) => {
    if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      cancelarCita(id);
    }
  };

  // Badge según estado
  const badgePorEstado = {
    pendiente:  <span className="badge badge-gold">Pendiente</span>,
    completada: <span className="badge badge-green">Completada</span>,
    cancelada:  <span className="badge badge-muted">Cancelada</span>,
  };

  const navItems = [
    { icon: '🏠', label: 'Dashboard', href: '/cliente', onClick: () => setSec('dashboard') },
    { icon: '📅', label: 'Agendar cita',     href: '/cliente/agendar' },
    { icon: '📖', label: 'Mi historial',     onClick: () => setSec('historial') },
    { icon: '✏️', label: 'Mi perfil',        onClick: () => setSec('perfil') },
    { icon: '📱', label: 'Vincular Telegram', onClick: () => setSec('telegram') },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar="👤" badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content">

        {/* ── DASHBOARD ── */}
        {sec === 'dashboard' && (
          <div>
            <div className="welcome-banner">
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>¡Hola, {user?.nombre}! 👋</h2>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 4 }}>
                  Aquí tienes un resumen de tu actividad en StyleUp.
                </p>
              </div>
              <Link to="/cliente/agendar" className="btn btn-primary">📅 Nueva cita</Link>
            </div>

            {/* Estadísticas reales basadas en las citas del usuario */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--gold)' }}>{citas.length}</div>
                <div className="stat-label">Citas agendadas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--red-light)' }}>{citasPendientes.length}</div>
                <div className="stat-label">Próximas citas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#2ecc71' }}>
                  {citas.filter((c) => c.estado === 'completada').length}
                </div>
                <div className="stat-label">Completadas</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--muted)' }}>
                  {citas.filter((c) => c.estado === 'cancelada').length}
                </div>
                <div className="stat-label">Canceladas</div>
              </div>
            </div>

            {/* Próximas citas */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="card-title" style={{ marginBottom: 0 }}>Próximas citas</h3>
              <Link to="/cliente/agendar" className="btn btn-primary btn-sm">+ Nueva cita</Link>
            </div>

            {citasPendientes.length === 0 ? (
              <div className="alert alert-info">No tienes citas próximas. ¡Agenda una ahora!</div>
            ) : (
              citasPendientes.map((c) => (
                <div key={c.id} className="cita-card">
                  <div className="cita-date-block">
                    <div className="cita-day">{c.fechaDia}</div>
                    <div className="cita-month">{c.fechaMes}</div>
                  </div>
                  <div className="cita-info">
                    <div className="cita-service">{c.servicio?.icon} {c.servicio?.name}</div>
                    <div className="cita-meta">
                      ⏰ {c.hora} · 💈 {c.barbero?.name} · {c.servicio?.dur}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {badgePorEstado[c.estado]}
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--red-light)', borderColor: 'var(--red-light)' }}
                      onClick={() => handleCancelar(c.id)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* Historial reciente (últimas 3) */}
            {citasHistorial.length > 0 && (
              <>
                <h3 className="card-title" style={{ marginTop: 24 }}>Historial reciente</h3>
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Fecha</th><th>Hora</th><th>Servicio</th>
                          <th>Barbero</th><th>Duración</th><th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citasHistorial.slice(-3).reverse().map((c) => (
                          <tr key={c.id}>
                            <td>{c.fechaDia} {c.fechaMes} {c.fechaAnio}</td>
                            <td>{c.hora}</td>
                            <td>{c.servicio?.name}</td>
                            <td>{c.barbero?.name}</td>
                            <td>{c.servicio?.dur}</td>
                            <td>{badgePorEstado[c.estado]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── HISTORIAL COMPLETO ── */}
        {sec === 'historial' && (
          <div>
            <div className="page-header">
              <h2 className="page-title">📖 Mi historial</h2>
              <p className="page-subtitle">Todas tus citas registradas en StyleUp</p>
            </div>
            <div className="card">
              {citas.length === 0 ? (
                <div className="alert alert-info">Aún no tienes citas registradas.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th><th>Hora</th><th>Servicio</th>
                        <th>Barbero</th><th>Duración</th><th>Estado</th><th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...citas].reverse().map((c) => (
                        <tr key={c.id}>
                          <td>{c.fechaDia} {c.fechaMes} {c.fechaAnio}</td>
                          <td>{c.hora}</td>
                          <td>{c.servicio?.icon} {c.servicio?.name}</td>
                          <td>{c.barbero?.name}</td>
                          <td>{c.servicio?.dur}</td>
                          <td>{badgePorEstado[c.estado]}</td>
                          <td>
                            {c.estado === 'pendiente' && (
                              <button
                                className="btn btn-outline btn-sm"
                                style={{ color: 'var(--red-light)', borderColor: 'var(--red-light)' }}
                                onClick={() => handleCancelar(c.id)}
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PERFIL (sin cambios) ── */}
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
                <div className="form-group"><label className="form-label">Nombres</label><input className="form-control" defaultValue={user?.nombre} /></div>
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

        {/* ── TELEGRAM (sin cambios) ── */}
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
              {tgOk && <div className="alert alert-success" style={{ marginTop: 8 }}>✅ Cuenta vinculada.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}