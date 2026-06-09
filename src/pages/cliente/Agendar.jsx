// src/pages/cliente/Agendar.jsx
// Agendamiento rápido — fecha = HOY, barberos filtrados por servicio,
// slots dinámicos según duración del servicio seleccionado.

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { useHorarios } from '../../context/useHorarios.js';
import { barberosService } from '../../services/barberosService.js';
import AvatarDisplay from '../../components/AvatarDisplay.jsx';
import { citasService } from '../../services/citasService.js';
import { serviciosService } from '../../services/serviciosService.js';
import {
  generarSlots,
  filtrarBarberosPorServicio,
} from '../../services/agendamientoService.js';
import { Calendar, Smartphone, Check, Scissors, Clock, ArrowLeft, ArrowRight, Circle, Frown, CheckCircle, Zap } from 'lucide-react';
import { preciosService } from '../../services/preciosService.js';

// ── Catálogo de servicios ──────────────────────────────────────────────────
const SERVICIOS = [
  { id: 'E001', name: 'Corte a tijera',    dur: serviciosService.getDuracion('E001') },
  { id: 'E002', name: 'Degradado / Fade',   dur: serviciosService.getDuracion('E002') },
  { id: 'E006', name: 'Afeitado con navaja', dur: serviciosService.getDuracion('E006') },
  { id: 'E008', name: 'Corte + Barba',       dur: serviciosService.getDuracion('E008') },
  { id: 'E007', name: 'Diseño en cabello',   dur: serviciosService.getDuracion('E007') },
  { id: 'E004', name: 'Undercut',            dur: serviciosService.getDuracion('E004') },
];

// Fecha de HOY formateada para mostrar y para filtrar citas
const hoy = new Date();
const HOY_NUM  = String(hoy.getDate());
const HOY_MES  = hoy.toLocaleDateString('es-CO', { month: 'short' }); // "May"
const HOY_ANIO = String(hoy.getFullYear());
const HOY_LABEL = hoy.toLocaleDateString('es-CO', {
  weekday: 'long', day: 'numeric', month: 'long',
}); // "miércoles, 27 de mayo"

export default function Agendar() {
  const [paso, setPaso]         = useState(1);
  const [sel, setSel]           = useState({
    servicio: null,
    barbero:  null,
    slot:     null,   // { horaInicio, horaFin }
  });
  const [msgs, setMsgs]         = useState({});
  const [confirmado, setConfirmado] = useState(false);
  const navigate = useNavigate();

  const { user }        = useAuth();
  const { agregarCita } = useCitas();
  const { horarios, cargarHorarios } = useHorarios();

  // Cargamos horarios la primera vez (sin useEffect en paso 1, lo hacemos lazy)
  // PerfilBarbero ya usa el mismo patrón
  const [horariosListos, setHorariosListos] = useState(false);
  const [todosBarberos, setTodosBarberos] = useState([]);

  // ── Todos los barberos ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      const todos = await barberosService.getTodos();
      setTodosBarberos(todos);
    };
    load();
  }, []);

  // ── Barberos filtrados según el servicio elegido ────────────────────────
  const barberosFiltrados = useMemo(() => {
    if (!sel.servicio) return [];
    return filtrarBarberosPorServicio(todosBarberos, sel.servicio.id)
      .filter((b) => b.disponibleHoy);   // solo los disponibles hoy
  }, [sel.servicio, todosBarberos]);

  // ── Slots para el barbero y servicio seleccionados (HOY) ───────────────
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!sel.barbero || !sel.servicio) {
      setSlots([]);
      return;
    }

    const barberoNombre = `${sel.barbero.nombre} ${sel.barbero.apellido}`;
    const duracion      = sel.servicio.dur;

    // Citas que ya tiene el barbero HOY (para detectar conflictos)
    citasService.getCitasBarberoEnDia(barberoNombre, HOY_NUM).then((citasHoy) => {
      setSlots(generarSlots({
        barberoNombre,
        diaNum:         HOY_NUM,
        duracionMin:    duracion,
        horarios,
        citasExistentes: citasHoy,
      }));
    });
  }, [sel.barbero, sel.servicio, horarios]);

  // ── Carga de horarios al pasar al paso 3 ───────────────────────────────
  const irAPaso3 = () => {
    if (!sel.barbero) { setMsgs({ 2: true }); return; }
    setMsgs({});
    if (!horariosListos) {
      cargarHorarios(sel.barbero.id);
      setHorariosListos(true);
    }
    setPaso(3);
  };

  // ── Validaciones por paso ───────────────────────────────────────────────
  const validar1 = () => {
    if (!sel.servicio) { setMsgs({ 1: true }); return; }
    setMsgs({});
    setPaso(2);
  };

  const validar3 = () => {
    if (!sel.slot) { setMsgs({ 3: true }); return; }
    setMsgs({});
    setPaso(4);
  };

  // ── Confirmación ───────────────────────────────────────────────────────
  const confirmar = async () => {
    await agregarCita({
      clienteNombre: user.nombre,
      servicio: sel.servicio,
      barbero:  { id: sel.barbero.id, name: `${sel.barbero.nombre} ${sel.barbero.apellido}` },
      fechaDia:  HOY_NUM,
      fechaMes:  HOY_MES,
      fechaAnio: HOY_ANIO,
      horaInicio: sel.slot.horaInicio,
      horaFin:    sel.slot.horaFin,
      hora:       sel.slot.horaInicio, // compatibilidad con vistas que usan "hora"
    });
    setConfirmado(true);
    setTimeout(() => navigate('/cliente'), 2200);
  };

  // ── Formato precio ─────────────────────────────────────────────────────
  const fmtPrecio = (n) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(n);

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: 'radial-gradient(ellipse at 30% 60%, rgba(52,152,219,0.08) 0%, transparent 55%), var(--bg)',
      minHeight: '100vh',
    }}>
      <div className="wizard-wrap">

        {/* ── Cabecera ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 32,
        }}>
          <Link to="/cliente" className="wizard-back" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={16} /> Volver al panel</Link>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem' }}>
            <Scissors size={16} /> StyleUp
          </div>
        </div>

        {/* ── Banner "Agendamiento rápido — HOY" ── */}
        <div style={{
          background: 'linear-gradient(120deg, rgba(192,57,43,0.12) 0%, rgba(230,184,106,0.06) 100%)',
          border: '1px solid rgba(192,57,43,0.2)',
          borderRadius: 12, padding: '14px 20px',
          marginBottom: 28,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: '1.3rem', display: 'flex' }}><Zap size={24} /></span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Agendamiento rápido — Hoy
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 2, textTransform: 'capitalize' }}>
              <Calendar size={14} /> {HOY_LABEL}
            </div>
          </div>
        </div>

        {/* ── Steps ── */}
        <div className="steps mb-3">
          {['Servicio', 'Barbero', 'Hora', 'Confirmar'].map((l, i) => (
            <div key={l} className={`step ${paso === i+1 ? 'active' : paso > i+1 ? 'done' : ''}`}>
              <div className="step-circle" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{paso > i+1 ? <Check size={14} /> : i+1}</div>
              <div className="step-label">{l}</div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════
            PASO 1 — Seleccionar servicio
        ════════════════════════════════════════ */}
        {paso === 1 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>¿Qué servicio deseas?</h2>
            <p className="text-muted mb-3">
              La duración varía según el servicio. El horario se ajusta automáticamente.
            </p>
            <div className="option-grid">
              {SERVICIOS.map((s) => {
                const esSel = sel.servicio?.id === s.id;
                return (
                  <div
                    key={s.id}
                    className={`option-card ${esSel ? 'selected' : ''}`}
                    onClick={() => setSel({ servicio: s, barbero: null, slot: null })}
                  >
                    <div className="option-name">{s.name}</div>
                    {/* Duración real del servicio */}
                    <div className="option-sub" style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}><Clock size={12} /> {s.dur} min</div>
                  </div>
                );
              })}
            </div>
            {msgs[1] && (
              <div className="alert alert-error">Selecciona un servicio para continuar.</div>
            )}
            <div className="nav-btns">
              <span />
              <button className="btn btn-primary" onClick={validar1}>
                Siguiente <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            PASO 2 — Elegir barbero (filtrado por servicio)
        ════════════════════════════════════════ */}
        {paso === 2 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Elige tu barbero</h2>
            <p className="text-muted mb-3">
              Mostrando solo los barberos especializados en{' '}
              <strong style={{ color: 'var(--gold)' }}>{sel.servicio?.name}</strong>{' '}
              y disponibles hoy.
            </p>

            {barberosFiltrados.length === 0 ? (
              <div className="alert alert-info">
                <Frown size={16} /> No hay barberos disponibles hoy para este servicio.
                Prueba con el agendamiento normal para elegir otra fecha.
              </div>
            ) : (
              <div className="barbero-grid">
                {barberosFiltrados.map((b) => {
                  const nombre   = `${b.nombre} ${b.apellido}`;
                  const esSel    = sel.barbero?.id === b.id;
                  const precio   = preciosService.getPrecioServicio(nombre, sel.servicio.id);
                  return (
                    <div
                      key={b.id}
                      className={`barbero-card ${esSel ? 'selected' : ''}`}
                      onClick={() => setSel({ ...sel, barbero: b, slot: null })}
                    >
                      <div className="barbero-avatar"><AvatarDisplay src={b.avatar} size="1.5rem" /></div>
                      <div className="barbero-name">{nombre}</div>
                      <div className="barbero-spec"><Scissors size={12} /> {b.especialidad}</div>
                      {/* Precio para este servicio */}
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--gold)', fontWeight: 700,
                        fontSize: '0.95rem', marginTop: 6,
                      }}>
                        {fmtPrecio(precio)}
                      </div>
                      <div className="barbero-avail" style={{ color: '#2ecc71', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Circle size={8} /> Disponible hoy
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {msgs[2] && (
              <div className="alert alert-error">Selecciona un barbero para continuar.</div>
            )}
            <div className="nav-btns">
              <button className="btn btn-outline" onClick={() => setPaso(1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={16} /> Anterior</button>
              <button className="btn btn-primary" onClick={irAPaso3}
                disabled={barberosFiltrados.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Siguiente <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            PASO 3 — Seleccionar hora (slots dinámicos)
        ════════════════════════════════════════ */}
        {paso === 3 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Elige tu hora</h2>
            <p className="text-muted mb-3">
              Cada bloque tiene exactamente{' '}
              <strong style={{ color: 'var(--gold)' }}>{sel.servicio?.dur} minutos</strong>{' '}
              — la duración real de tu servicio.
            </p>

            {/* ── Chip de contexto ── */}
            <div style={{
              display: 'flex', gap: 10, flexWrap: 'wrap',
              marginBottom: 20, alignItems: 'center',
            }}>
              <span className="badge badge-gold">{sel.servicio?.icon} {sel.servicio?.name}</span>
              <span className="badge badge-muted">
                <Scissors size={12} /> {sel.barbero?.nombre} {sel.barbero?.apellido}
              </span>
              <span className="badge badge-muted"><Calendar size={12} /> Hoy</span>
            </div>

            {slots.length === 0 ? (
              <div className="alert alert-info">
                <Frown size={16} /> No hay horarios disponibles hoy para este barbero.
                Puedes intentar con otro barbero o usar el agendamiento normal
                para elegir otra fecha.
              </div>
            ) : (
              <>
                {/* Leyenda */}
                <div style={{
                  display: 'flex', gap: 16, marginBottom: 16,
                  fontSize: '0.75rem', color: 'var(--muted)',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 3, display: 'inline-block' }} />
                    Libre
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, background: 'rgba(139,148,158,0.2)', border: '1.5px solid var(--border)', borderRadius: 3, display: 'inline-block' }} />
                    Ocupado
                  </span>
                </div>

                {/* Grid de slots — muestra inicio y fin */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 10, marginBottom: 28,
                }}>
                  {slots.map((slot) => {
                    const esSel = sel.slot?.horaInicio === slot.horaInicio;
                    return (
                      <div
                        key={slot.horaInicio}
                        onClick={() => !slot.ocupado && setSel({ ...sel, slot })}
                        style={{
                          border: '1.5px solid',
                          borderColor: esSel
                            ? 'var(--gold)'
                            : slot.ocupado ? 'var(--border)' : 'var(--border)',
                          borderRadius: 10, padding: '10px 12px',
                          textAlign: 'center', cursor: slot.ocupado ? 'not-allowed' : 'pointer',
                          background: esSel
                            ? 'rgba(230,184,106,0.1)'
                            : slot.ocupado ? 'rgba(139,148,158,0.08)' : 'var(--surface)',
                          opacity: slot.ocupado ? 0.5 : 1,
                          transition: 'all 0.2s',
                          boxShadow: esSel ? 'var(--shadow-gold)' : 'none',
                        }}
                      >
                        {/* Hora de inicio — grande */}
                        <div style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '1.1rem', fontWeight: 700,
                          color: esSel ? 'var(--gold)'
                            : slot.ocupado ? 'var(--muted)' : 'var(--text)',
                        }}>
                          {slot.horaInicio}
                        </div>
                        {/* Hora de fin — pequeña */}
                        <div style={{
                          fontSize: '0.72rem',
                          color: esSel ? 'var(--gold-dim)' : 'var(--muted)',
                          marginTop: 2,
                        }}>
                          hasta {slot.horaFin}
                        </div>
                        {/* Indicador de ocupado */}
                        {slot.ocupado && (
                          <div style={{
                            fontSize: '0.65rem', color: 'var(--muted)',
                            marginTop: 4,
                          }}>
                            Ocupado
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {msgs[3] && (
              <div className="alert alert-error">Selecciona un horario para continuar.</div>
            )}
            <div className="nav-btns">
              <button className="btn btn-outline" onClick={() => setPaso(2)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={16} /> Anterior</button>
              <button className="btn btn-primary" onClick={validar3}
                disabled={slots.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Ver resumen <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            PASO 4 — Confirmar
        ════════════════════════════════════════ */}
        {paso === 4 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Confirma tu cita</h2>
            <p className="text-muted mb-3">Revisa los detalles antes de confirmar.</p>

            <div className="card mb-3">
              {[
                ['Servicio',  `${sel.servicio?.icon} ${sel.servicio?.name}`],
                ['Barbero',    `${sel.barbero?.nombre} ${sel.barbero?.apellido}`],
                ['Fecha',      `Hoy — ${HOY_LABEL}`],
                ['Hora',       sel.slot ? `${sel.slot.horaInicio} → ${sel.slot.horaFin}` : '—'],
                ['Duración',   `${sel.servicio?.dur} min`],
                ['Precio',     fmtPrecio(preciosService.getPrecioServicio(
                                 `${sel.barbero?.nombre} ${sel.barbero?.apellido}`,
                                 sel.servicio?.id
                               ))],
              ].map(([l, v]) => (
                <div key={l} className="resumen-row">
                  <span className="resumen-label">{l}</span>
                  <span className="resumen-value">{v}</span>
                </div>
              ))}
            </div>

            <div className="alert alert-info mb-2">
              <Smartphone size={14} /> Recibirás un recordatorio por Telegram 1 hora antes de tu cita.
            </div>

            {confirmado && (
              <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} /> ¡Cita agendada con éxito! Redirigiendo...
              </div>
            )}

            <div className="nav-btns">
              <button className="btn btn-outline" onClick={() => setPaso(3)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={16} /> Modificar</button>
              <button
                className="btn btn-success btn-lg"
                onClick={confirmar}
                disabled={confirmado}
              >
                <Check size={16} /> Confirmar cita
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
