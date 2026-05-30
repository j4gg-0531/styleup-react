// src/pages/barberia/PerfilBarberoAdmin.jsx
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Scissors, MapPin, Phone, MessageCircle, XOctagon, Clock, Save, Pencil, Lightbulb, ClipboardList, AlertTriangle, CheckCircle } from 'lucide-react';
import { barberosService } from '../../services/barberosService.js';
import { citasService } from '../../services/citasService.js';
import { preciosService } from '../../services/preciosService.js';
import { notificacionesService } from '../../services/notificacionesService.js';
import { useChatFlotante } from '../../context/useChatFlotante.js';
import Estrellas from '../../components/Estrellas.jsx';

const HORARIO_MOCK = {
  'Juan Pérez':    { Lun:'09:00–18:00', Mar:'09:00–18:00', Mié:'09:00–18:00', Jue:'09:00–18:00', Vie:'09:00–18:00', Sáb:'09:00–14:00', Dom:'—' },
  'Carlos López':  { Lun:'12:00–20:00', Mar:'12:00–20:00', Mié:'Descanso',    Jue:'12:00–20:00', Vie:'12:00–20:00', Sáb:'10:00–16:00', Dom:'—' },
  'Miguel Torres': { Lun:'Descanso',    Mar:'10:00–18:00', Mié:'10:00–18:00', Jue:'10:00–18:00', Vie:'10:00–18:00', Sáb:'Descanso',    Dom:'—' },
};

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const formatPrecio = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export default function PerfilBarberoAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { abrirChatCon } = useChatFlotante();

  const barbero = barberosService.getById(id);
  const nombreCompleto = barbero ? `${barbero.nombre} ${barbero.apellido}` : '';

  // ── Hooks siempre primero ────────────────────────────────────
  const [activo, setActivo]                               = useState(barbero?.disponibleHoy ?? false);
  const [mostrarConfirmDespido, setMostrarConfirmDespido] = useState(false);
  const [despedido, setDespedido]                         = useState(false);

  const STORAGE_KEY_HORARIOS = 'styleup_barberia_horarios_admin';
  const horarioInicial = () => {
    const guardado = sessionStorage.getItem(STORAGE_KEY_HORARIOS);
    if (guardado) {
      const data = JSON.parse(guardado);
      if (data[nombreCompleto]) return data[nombreCompleto];
    }
    return { ...(HORARIO_MOCK[nombreCompleto] || {}) };
  };
  const [editandoHorario, setEditandoHorario] = useState(false);
  const [horarioEdit, setHorarioEdit] = useState(horarioInicial);

  const OPCIONES_TURNOS = [
    '—', 'Descanso',
    '08:00–13:00', '08:00–18:00',
    '09:00–13:00', '09:00–14:00', '09:00–18:00',
    '10:00–16:00', '10:00–18:00', '10:00–19:00',
    '12:00–20:00', '13:00–20:00', '14:00–20:00',
  ];

  const todasLasCitas = useMemo(
    () => barbero ? citasService.getCitasByBarbero(nombreCompleto) : [],
    [nombreCompleto, barbero]
  );

  useEffect(() => {
    if (!barbero) navigate('/barberia/barberos');
  }, [barbero, navigate]);

  if (!barbero) return null;

  // ── Estadísticas ─────────────────────────────────────────────
  const mesesMap = {
    'Ene':1,'Feb':2,'Mar':3,'Abr':4,'May':5,'Jun':6,
    'Jul':7,'Ago':8,'Sep':9,'Oct':10,'Nov':11,'Dic':12,
  };
  const mesActual    = new Date().getMonth() + 1;
  const citasEsteMes = todasLasCitas.filter(
    (c) => (mesesMap[c.fechaMes] || 0) === mesActual
  );
  const completadas  = citasEsteMes.filter((c) => c.estado === 'completada').length;
  const canceladas   = citasEsteMes.filter((c) => c.estado === 'cancelada').length;
  const pendientes   = citasEsteMes.filter((c) => c.estado === 'pendiente').length;
  const gananciasEsteMes = citasEsteMes
    .filter((c) => c.estado === 'completada')
    .reduce((total, c) =>
      total + preciosService.getPrecioServicio(nombreCompleto, c.servicio?.id), 0);

  const handleDespedir = () => {
    notificacionesService.crear({
      tipo: 'despedido',
      paraRol: 'barbero',
      paraNombre: nombreCompleto,
      deRol: 'barberia',
      deNombre: 'BarberShop Style',
      mensaje: `Has sido despedido de BarberShop Style`,
      metadata: { barberoId: id },
    });
    setDespedido(true);
    setTimeout(() => navigate('/barberia/barberos'), 2000);
  };

  return (
    // Sin app-layout, sin Sidebar — página full width igual que PerfilBarbero del cliente
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ════════════════════════════════════════
          HERO BANNER
      ════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(160deg, #1a0806 0%, #2c0f0a 50%, #161b22 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '32px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: 24, color: 'var(--muted)' }}
            onClick={() => navigate('/barberia/barberos')}
          >
            ← Volver a mis barberos
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.8rem', flexShrink: 0,
              boxShadow: '0 0 0 4px rgba(192,57,43,0.2), var(--shadow-lg)',
            }}>
              {barbero.avatar}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: 12, flexWrap: 'wrap', marginBottom: 6,
              }}>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '2rem', fontWeight: 900, margin: 0,
                }}>
                  {nombreCompleto}
                </h1>

                {/* Toggle activo/inactivo */}
                <button
                  onClick={() => setActivo(!activo)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '4px 14px', borderRadius: 20, border: '1.5px solid',
                    borderColor: activo ? '#3fb950' : 'var(--muted)',
                    background: activo
                      ? 'rgba(63,185,80,0.12)'
                      : 'rgba(139,148,158,0.1)',
                    color: activo ? '#3fb950' : 'var(--muted)',
                    fontSize: '0.78rem', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: activo ? '#3fb950' : 'var(--muted)',
                    display: 'inline-block',
                  }} />
                  {activo ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div style={{ color: 'var(--gold)', fontSize: '0.95rem', marginBottom: 8 }}>
                <Scissors size={16} /> {barbero.especialidad}
              </div>
              <div style={{ marginBottom: 12 }}>
                <Estrellas
                  calificacion={barbero.calificacion}
                  total={barbero.totalCalificaciones}
                  size="lg"
                />
              </div>
              <div style={{
                fontSize: '0.82rem', color: 'var(--muted)',
                display: 'flex', gap: 16, flexWrap: 'wrap',
              }}>
                <span><MapPin size={14} /> {barbero.direccion}, {barbero.ciudad}</span>
                <span><Phone size={14} /> {barbero.telefono}</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  ID: {barbero.id}
                </span>
              </div>
            </div>

            {/* Acciones */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              gap: 10, flexShrink: 0,
            }}>
              <button
                className="btn btn-outline"
                onClick={() => abrirChatCon(nombreCompleto)}
              >
                <MessageCircle size={16} /> Enviar mensaje
              </button>
              <button
                className="btn btn-outline"
                style={{ color: 'var(--cobre-light)', borderColor: 'var(--cobre-light)' }}
                onClick={() => setMostrarConfirmDespido(true)}
              >
                <XOctagon size={16} /> Despedir barbero
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          CONTENIDO
      ════════════════════════════════════════ */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px' }}>

        {/* Estadísticas */}
        <h3 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '0.82rem', color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          marginBottom: 14,
        }}>
          Rendimiento este mes
        </h3>

        <div className="stats-grid" style={{ marginBottom: 32 }}>
          {[
            [formatPrecio(gananciasEsteMes), 'Ganancias generadas', 'var(--gold)'],
            [completadas,                    'Citas completadas',    '#3fb950'],
            [pendientes,                     'Pendientes',           'var(--cobre-light)'],
            [canceladas,                     'Cancelaciones',        'var(--muted)'],
          ].map(([valor, label, color]) => (
            <div key={label} className="stat-card">
              <div className="stat-value" style={{ color, fontSize: '1.5rem' }}>{valor}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Horario semanal */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 20,
          }}>
            <div>
              <div className="card-title" style={{ marginBottom: 2 }}>
                <Clock size={18} /> Horario semanal
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                {editandoHorario
                  ? 'Selecciona el turno para cada día y guarda los cambios.'
                  : 'Solo lectura — usa "Editar horario" para modificar'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {editandoHorario ? (
                <>
                  <button className="btn btn-outline btn-sm" onClick={() => {
                    setHorarioEdit(horarioInicial());
                    setEditandoHorario(false);
                  }}>
                    Cancelar
                  </button>
                  <button className="btn btn-success btn-sm" onClick={() => {
                    const guardado = sessionStorage.getItem(STORAGE_KEY_HORARIOS);
                    const data = guardado ? JSON.parse(guardado) : {};
                    data[nombreCompleto] = horarioEdit;
                    sessionStorage.setItem(STORAGE_KEY_HORARIOS, JSON.stringify(data));
                    setEditandoHorario(false);
                  }}>
                    <Save size={16} /> Guardar horario
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => abrirChatCon(nombreCompleto)}
                  >
                    <MessageCircle size={16} /> Coordinar cambio
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setEditandoHorario(true)}
                  >
                    <Pencil size={16} /> Editar horario
                  </button>
                </>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 8,
          }}>
            {DIAS.map((dia) => {
              const turno     = horarioEdit[dia] || '—';
              const esDescanso = turno === 'Descanso' || turno === '—';
              return (
                <div
                  key={dia}
                  style={{
                    textAlign: 'center', padding: '12px 6px', borderRadius: 10,
                    border: '1.5px solid',
                    borderColor: editandoHorario
                      ? 'var(--gold)'
                      : esDescanso ? 'var(--border)' : 'rgba(230,184,106,0.3)',
                    background: editandoHorario
                      ? 'rgba(230,184,106,0.06)'
                      : esDescanso ? 'var(--surface2)' : 'rgba(230,184,106,0.05)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    fontSize: '0.62rem', color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    marginBottom: 6,
                  }}>
                    {dia}
                  </div>
                  {editandoHorario ? (
                    <select
                      className="form-control"
                      style={{ fontSize: '0.65rem', padding: '4px 2px', textAlign: 'center', width: '100%' }}
                      value={turno}
                      onChange={(e) => setHorarioEdit((prev) => ({ ...prev, [dia]: e.target.value }))}
                    >
                      {OPCIONES_TURNOS.map((opt) => (
                        <option key={opt} value={opt}>{opt === '—' ? 'Libre' : opt}</option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <div style={{
                        fontSize: '0.68rem', fontWeight: 600,
                        color: esDescanso ? 'var(--muted)' : 'var(--gold)',
                        lineHeight: 1.5,
                      }}>
                        {turno === '—' ? 'Libre' : turno}
                      </div>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        margin: '6px auto 0',
                        background: esDescanso ? 'transparent' : '#3fb950',
                      }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {!editandoHorario && (
            <div className="alert alert-info" style={{ marginTop: 16, fontSize: '0.82rem' }}>
              <Lightbulb size={16} /> Puedes editar el horario de <strong>{barbero.nombre}</strong> directamente
              presionando <strong>Editar horario</strong>.
            </div>
          )}
        </div>

        {/* Citas recientes */}
        {todasLasCitas.length > 0 ? (
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} /> Citas recientes</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Valor</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[...todasLasCitas].reverse().slice(0, 5).map((c) => (
                    <tr key={c.id}>
                      <td>{c.fechaDia} {c.fechaMes} {c.fechaAnio}</td>
                      <td>{c.clienteNombre}</td>
                      <td>{c.servicio?.name}</td>
                      <td style={{ color: 'var(--gold)' }}>
                        {c.estado === 'completada'
                          ? formatPrecio(preciosService.getPrecioServicio(
                              nombreCompleto, c.servicio?.id
                            ))
                          : '—'}
                      </td>
                      <td>
                        {c.estado === 'completada' && <span className="badge badge-green">Completada</span>}
                        {c.estado === 'pendiente'  && <span className="badge badge-gold">Pendiente</span>}
                        {c.estado === 'cancelada'  && <span className="badge badge-muted">Cancelada</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="alert alert-info">
            Este barbero aún no tiene citas registradas en el sistema.
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          MODAL DESPIDO
      ════════════════════════════════════════ */}
      {mostrarConfirmDespido && !despedido && (
        <div
          onClick={() => setMostrarConfirmDespido(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 16, padding: '32px 28px',
              maxWidth: 420, width: '100%',
              boxShadow: 'var(--shadow-lg)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 16 }}><AlertTriangle size={48} /></div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.3rem', marginBottom: 10,
            }}>
              ¿Despedir a {barbero.nombre}?
            </h3>
            <p style={{
              color: 'var(--muted)', fontSize: '0.88rem',
              lineHeight: 1.65, marginBottom: 24,
            }}>
              Esto eliminará a{' '}
              <strong style={{ color: 'var(--text)' }}>{nombreCompleto}</strong>{' '}
              de tu equipo. Sus citas pendientes quedarán sin barbero asignado.
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn btn-outline"
                onClick={() => setMostrarConfirmDespido(false)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
                }}
                onClick={handleDespedir}
              >
                <XOctagon size={16} /> Sí, despedir
              </button>
            </div>
          </div>
        </div>
      )}

      {despedido && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px' }}>
          <div className="alert alert-success" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={16} /> {nombreCompleto} ha sido removido del equipo. Redirigiendo...
          </div>
        </div>
      )}
    </div>
  );
}