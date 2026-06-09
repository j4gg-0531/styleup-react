// src/pages/cliente/PerfilBarbero.jsx
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { useHorarios } from '../../context/useHorarios.js';
import { useChatFlotante } from '../../context/useChatFlotante.js';
import { barberosService } from '../../services/barberosService.js';
import { citasService } from '../../services/citasService.js';
import { preciosService, NOMBRES_SERVICIOS } from '../../services/preciosService.js';
import { barberiaService } from '../../services/barberiaService.js';
import { notificacionesService } from '../../services/notificacionesService.js';
import {
  DURACION_SERVICIOS,
  generarSlots,
} from '../../services/agendamientoService.js';
import Estrellas from '../../components/Estrellas.jsx';
import { Scissors, Building2, MapPin, Phone, MessageCircle, Wallet, Clock, Calendar, ArrowLeft, Smartphone, Circle, CheckCircle, AlertTriangle, Check } from 'lucide-react';
import MapaMini, { SVG_SCISSORS, SVG_BUILDING2 } from '../../components/MapaMini.jsx';
import { getDiasSemana, fmtFecha } from '../../services/semana.js';

const SERVICIOS_INFO = {
  E001: { dur: DURACION_SERVICIOS.E001 },
  E002: { dur: DURACION_SERVICIOS.E002 },
  E006: { dur: DURACION_SERVICIOS.E006 },
  E008: { dur: DURACION_SERVICIOS.E008 },
  E007: { dur: DURACION_SERVICIOS.E007 },
  E004: { dur: DURACION_SERVICIOS.E004 },
};

export default function PerfilBarbero() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agregarCita } = useCitas();
  const { horarios, cargarHorarios } = useHorarios();
  const { abrirChatCon } = useChatFlotante();

  const [barbero, setBarbero] = useState(null);
  const [barberia, setBarberia] = useState(null);

  useEffect(() => {
    const load = async () => {
      const b = await barberosService.getById(id);
      if (!b) {
        navigate('/cliente/barberos');
        return;
      }
      setBarbero(b);
      const todas = await barberiaService.getTodas();
      const barb = todas.find((bb) => bb.barberoIds?.includes(b.id)) ?? null;
      setBarberia(barb);
    };
    load();
  }, [id, navigate]);

  if (!barbero) return null;

  const nombreCompleto = `${barbero.nombre} ${barbero.apellido}`;

  // Carga de horarios una sola vez (patrón lazy sin useEffect)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [horariosListos, setHorariosListos] = useState(false);
  const [mostrarQueja, setMostrarQueja] = useState(false);
  const [quejaTexto, setQuejaTexto] = useState('');
  const [quejaEnviada, setQuejaEnviada] = useState(false);
  if (!horariosListos) {
    cargarHorarios(barbero.id);
    setHorariosListos(true);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const precios = useMemo(
    () => preciosService.getPreciosByBarbero(nombreCompleto),
    [nombreCompleto]
  );

  // ── Navegación de semanas ──────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [semanaOffset, setSemanaOffset] = useState(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const diasSemana = useMemo(() => getDiasSemana(semanaOffset), [semanaOffset]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const hoyMidnight = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [diaSeleccionado, setDiaSeleccionado] = useState(
    () => {
      const hoyNum = String(new Date().getDate());
      const dias = getDiasSemana(0);
      const hoyMid = new Date();
      hoyMid.setHours(0, 0, 0, 0);
      // Si hoy está en la semana y no es pasado → seleccionar hoy
      for (const d of dias) {
        if (d.num === hoyNum && d.fecha >= hoyMid) return hoyNum;
      }
      // Si no, el primer día futuro disponible
      for (const d of dias) {
        if (d.fecha >= hoyMid) return d.num;
      }
      return hoyNum;
    }
  );

  // ── Booking ────────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [slotSel, setSlotSel]         = useState(null);   // { horaInicio, horaFin }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [servicioSel, setServicioSel] = useState(null);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [confirmado, setConfirmado]   = useState(false);

  // ── Slots dinámicos según servicio y día seleccionado ─────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const slots = useMemo(() => {
    if (!servicioSel || !diaSeleccionado) return [];

    const duracion = SERVICIOS_INFO[servicioSel.id]?.dur ?? 30;

    // Citas existentes del barbero en ese día (para detectar conflictos)
    const citasExistentes = citasService.getCitasBarberoEnDia(
      nombreCompleto,
      diaSeleccionado
    );

    return generarSlots({
      barberoNombre:   nombreCompleto,
      diaNum:          diaSeleccionado,
      duracionMin:     duracion,
      horarios,
      citasExistentes,
    });
  }, [servicioSel, diaSeleccionado, horarios, nombreCompleto]);

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(n);

  const handleConfirmar = () => {
    if (!diaSeleccionado || !servicioSel || !slotSel) return;
    agregarCita({
      clienteNombre: user.nombre,
      servicio: { ...servicioSel, ...SERVICIOS_INFO[servicioSel.id] },
      barbero:  { id: barbero.id, name: nombreCompleto },
      fechaDia:  diaSeleccionado,
      fechaMes:  diasSemana.find((d) => d.num === diaSeleccionado)?.name || '',
      fechaAnio: String(new Date().getFullYear()),
      horaInicio: slotSel.horaInicio,
      horaFin:    slotSel.horaFin,
      hora:       slotSel.horaInicio, // compatibilidad con otras vistas
    });
    setConfirmado(true);
    setTimeout(() => navigate('/cliente'), 2000);
  };

  const ubicacion = barberia
    ? { lat: barberia.lat, lng: barberia.lng }
    : { lat: barbero?.lat, lng: barbero?.lng };

  const primerDia = diasSemana[0]?.fecha;
  const ultimoDia = diasSemana[5]?.fecha;

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* ── HERO BANNER ── */}
      <div style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '32px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button className="btn btn-ghost btn-sm"
            style={{ marginBottom: 24, color: 'var(--muted)' }}
            onClick={() => navigate('/cliente/barberos')}>
            <ArrowLeft size={16} /> Volver a barberos
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.8rem', flexShrink: 0,
              boxShadow: '0 0 0 4px rgba(192,57,43,0.2), var(--shadow-lg)',
            }}>
              {barbero.avatar}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                  {nombreCompleto}
                </h1>
                <span className={`badge ${barbero.disponibleHoy ? 'badge-green' : 'badge-muted'}`}>
                  {barbero.disponibleHoy ? <><Circle size={8} /> Disponible hoy</> : <><Circle size={8} /> No disponible</>}
                </span>
              </div>
              <div style={{ color: 'var(--gold)', fontSize: '0.95rem', marginBottom: 8 }}>
                <Scissors size={16} /> {barbero.especialidad}
              </div>
              {barberia && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(230,184,106,0.08)',
                  border: '1px solid rgba(230,184,106,0.2)',
                  borderRadius: 20, padding: '3px 12px',
                  fontSize: '0.78rem', color: 'var(--gold)', marginBottom: 8,
                }}>
                  <Building2 size={14} /> Trabaja en {barberia.nombre}
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <Estrellas calificacion={barbero.calificacion} total={barbero.totalCalificaciones} size="lg" />
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span><MapPin size={14} /> {barbero.direccion}, {barbero.ciudad}</span>
                <span><Phone size={14} /> {barbero.telefono}</span>
                {barbero.instagram && (
                  <a href={`https://instagram.com/${barbero.instagram.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                    title="Instagram">
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} style={{flexShrink:0}}>
                      <rect x={2} y={2} width={20} height={20} rx={5} />
                      <circle cx={12} cy={12} r={5} />
                      <circle cx={17.5} cy={6.5} r={1.5} fill="currentColor" />
                    </svg>
                  </a>
                )}
                {barbero.tiktok && (
                  <a href={`https://tiktok.com/@${barbero.tiktok.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                    title="TikTok">
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" style={{flexShrink:0}}>
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <button className="btn btn-outline"
                onClick={() => abrirChatCon(nombreCompleto)}>
                <MessageCircle size={16} /> Enviar mensaje
              </button>
              <button className="btn btn-outline"
                style={{ color: 'var(--cobre-light)', borderColor: 'var(--cobre-light)' }}
                onClick={() => setMostrarQueja(true)}>
                <AlertTriangle size={16} /> Reportar queja
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* ── CONTENIDO ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px' }}>
        <div className="grid-2" style={{ marginBottom: 28 }}>

          {/* ── SERVICIOS ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              background: 'var(--surface2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                <Wallet size={18} /> Servicios y precios
              </div>
              {!servicioSel && (
                <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <ArrowLeft size={14} /> Elige uno para agendar
                </span>
              )}
            </div>
            <div style={{ padding: '8px 16px' }}>
              {Object.entries(NOMBRES_SERVICIOS).map(([sid, nombre]) => {
                const info   = SERVICIOS_INFO[sid] || { dur: 30 };
                const precio = precios[sid] || preciosService.getPrecioServicio(nombreCompleto, sid);
                const esSel  = servicioSel?.id === sid;
                return (
                  <div
                    key={sid}
                    onClick={() => {
                      setServicioSel({ id: sid, name: nombre, ...info });
                      setDiaSeleccionado(String(new Date().getDate()));
                      setSlotSel(null);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 10px', marginBottom: 4, borderRadius: 8,
                      border: '1.5px solid',
                      borderColor: esSel ? 'var(--gold)' : 'transparent',
                      background: esSel ? 'rgba(230,184,106,0.08)' : 'transparent',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { if (!esSel) e.currentTarget.style.background = 'var(--surface2)'; }}
                    onMouseLeave={(e) => { if (!esSel) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: esSel ? 'var(--gold)' : 'var(--text)' }}>
                        {nombre}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                        <Clock size={12} /> {info.dur} min
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--gold)', fontWeight: 700, fontSize: '0.95rem',
                      }}>
                        {formatPrecio(precio)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── DISPONIBILIDAD ── */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid var(--border)',
              background: 'var(--surface2)',
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                <Calendar size={18} /> Disponibilidad
              </div>
              {/* Sub-título: muestra la duración del servicio elegido */}
              {servicioSel && (
                <div style={{ fontSize: '0.72rem', color: 'var(--gold)', marginTop: 3 }}>
                  Slots de {servicioSel.dur} min · {servicioSel.name}
                </div>
              )}
            </div>
            <div style={{ padding: '16px' }}>

              {!servicioSel ? (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--muted)', fontSize: '0.88rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 10, display: 'flex', justifyContent: 'center' }}><ArrowLeft size={32} /></div>
                  Primero selecciona un servicio para ver los horarios disponibles
                </div>
              ) : (
                <>
                  {/* Navegación de semana */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => setSemanaOffset((o) => o - 1)}
                      disabled={semanaOffset <= 0}
                      style={{ opacity: semanaOffset <= 0 ? 0.3 : 1 }}>
                      ‹
                    </button>
                    <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>
                      {primerDia && ultimoDia ? `${fmtFecha(primerDia)} – ${fmtFecha(ultimoDia)}` : ''}
                      {semanaOffset === 0 && (
                        <span className="badge badge-gold" style={{ marginLeft: 6, fontSize: '0.65rem' }}>
                          Esta semana
                        </span>
                      )}
                    </div>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => setSemanaOffset((o) => o + 1)}>
                      ›
                    </button>
                  </div>

                  {/* Días de la semana */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 16 }}>
                    {diasSemana.map((d) => {
                      const esPasado = d.fecha < hoyMidnight;
                      const esSeleccionado = diaSeleccionado === d.num;
                      const esHoyDia = String(new Date().getDate()) === d.num && semanaOffset === 0;
                      const tieneSlots = horarios.some(
                        (h) => h.dia === d.num && h.estado === 'disponible'
                      );
                      return (
                        <div
                          key={d.num}
                          onClick={esPasado ? undefined : () => { setDiaSeleccionado(d.num); setSlotSel(null); }}
                          style={{
                            padding: '8px 4px', textAlign: 'center', borderRadius: 8,
                            cursor: esPasado ? 'not-allowed' : 'pointer',
                            opacity: esPasado ? 0.35 : 1,
                            border: '1.5px solid',
                            borderColor: esSeleccionado ? 'var(--gold)' : esHoyDia ? 'var(--cobre-light)' : 'var(--border)',
                            background: esSeleccionado ? 'rgba(230,184,106,0.12)' : 'var(--surface)',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ fontSize: '0.6rem', color: 'var(--muted)', textTransform: 'uppercase' }}>{d.name}</div>
                          <div style={{
                            fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700,
                            color: esSeleccionado ? 'var(--gold)' : esHoyDia ? 'var(--cobre-light)' : 'var(--text)',
                          }}>
                            {d.num}
                          </div>
                          <div style={{
                            width: 5, height: 5, borderRadius: '50%', margin: '3px auto 0',
                            background: tieneSlots ? '#2ecc71' : 'transparent',
                          }} />
                        </div>
                      );
                    })}
                  </div>

                  {/* ── SLOTS dinámicos con rango ── */}
                  {slots.length === 0 ? (
                    <div className="alert alert-info" style={{ fontSize: '0.82rem' }}>
                      Sin horarios disponibles para este día.
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 8 }}>
                        {slots.filter(s => !s.ocupado).length} horarios libres
                        · cada bloque = {servicioSel.dur} min
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 8,
                      }}>
                        {slots.map((slot) => {
                          const esSel = slotSel?.horaInicio === slot.horaInicio;
                          return (
                            <div
                              key={slot.horaInicio}
                              onClick={() => !slot.ocupado && setSlotSel(esSel ? null : slot)}
                              style={{
                                border: '1.5px solid',
                                borderColor: esSel ? 'var(--gold)'
                                  : slot.ocupado ? 'var(--border)' : 'var(--border)',
                                borderRadius: 8, padding: '8px 10px',
                                cursor: slot.ocupado ? 'not-allowed' : 'pointer',
                                background: esSel ? 'rgba(230,184,106,0.1)'
                                  : slot.ocupado ? 'rgba(139,148,158,0.06)' : 'var(--surface)',
                                opacity: slot.ocupado ? 0.45 : 1,
                                transition: 'all 0.2s',
                                boxShadow: esSel ? 'var(--shadow-gold)' : 'none',
                              }}
                            >
                              {/* Hora de inicio */}
                              <div style={{
                                fontFamily: "'Playfair Display', serif",
                                fontSize: '1rem', fontWeight: 700,
                                color: esSel ? 'var(--gold)'
                                  : slot.ocupado ? 'var(--muted)' : 'var(--text)',
                              }}>
                                {slot.horaInicio}
                              </div>
                              {/* Hora de fin */}
                              <div style={{
                                fontSize: '0.68rem',
                                color: esSel ? 'var(--gold-dim)' : 'var(--muted)',
                                marginTop: 2,
                              }}>
                                hasta {slot.horaFin}
                              </div>
                              {slot.ocupado && (
                                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: 2 }}>
                                  Ocupado
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── RESUMEN Y CONFIRMACIÓN ── */}
        {servicioSel && diaSeleccionado && slotSel && (
          <div className="card" style={{ marginBottom: 28 }}>
            <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700, marginBottom: 12, fontSize: '1.1rem',
              }}>
                <Check size={20} /> Resumen de tu cita
              </div>
              {[
                ['Barbero',   nombreCompleto],
                ['Servicio',  servicioSel.name],
                ['Duración',  `${servicioSel.dur} min`],
                ['Fecha',     `${diaSeleccionado} · ${diasSemana.find((d) => d.num === diaSeleccionado)?.name || ''}`],
                // Rango completo inicio → fin
                ['Hora',      `${slotSel.horaInicio} → ${slotSel.horaFin}`],
                ['Precio',    formatPrecio(precios[servicioSel.id] || preciosService.getPrecioServicio(nombreCompleto, servicioSel.id))],
              ].map(([l, v]) => (
                <div key={l} className="resumen-row">
                  <span className="resumen-label">{l}</span>
                  <span className="resumen-value">{v}</span>
                </div>
              ))}
              <div className="alert alert-info" style={{ marginTop: 12, marginBottom: 12 }}>
                <Smartphone size={14} /> Recibirás un recordatorio por Telegram 1 hora antes.
              </div>
              {confirmado && (
                <div className="alert alert-success" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} /> ¡Cita agendada! Redirigiendo...
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline" onClick={() => setSlotSel(null)}>
                  <ArrowLeft size={16} /> Modificar hora
                </button>
                <button className="btn btn-success btn-lg" onClick={handleConfirmar} disabled={confirmado}>
                  <Check size={16} /> Confirmar cita
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── UBICACIÓN ── */}
        {(ubicacion.lat && ubicacion.lng) && (
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} /> Ubicación</div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 12 }}>
              <MapaMini
                lat={ubicacion.lat} lng={ubicacion.lng}
                icono={barberia ? SVG_BUILDING2 : SVG_SCISSORS}
                color={barberia ? '#e6b86a' : '#e74c3c'}
                altura={230}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {barberia
                ? <><strong style={{ color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Building2 size={14} /> {barberia.nombre}</strong> · {barberia.direccion}, {barberia.ciudad}</>
                : <><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {barbero.direccion}, {barbero.ciudad}</span></>
              }
            </div>
          </div>
        )}
      </div>

      {mostrarQueja && (
        <div onClick={() => setMostrarQueja(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 16, padding: '28px 24px',
              maxWidth: 480, width: '100%',
              boxShadow: 'var(--shadow-lg)',
            }}>
            <div style={{ fontSize: '2rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cobre-light)' }}>
              <AlertTriangle size={28} /> Reportar queja
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.5 }}>
              Describe el motivo de tu queja contra <strong>{nombreCompleto}</strong>:
            </p>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Escribe aquí los detalles de tu queja..."
              value={quejaTexto}
              onChange={(e) => setQuejaTexto(e.target.value)}
              style={{ marginBottom: 16, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => { setMostrarQueja(false); setQuejaTexto(''); }}>
                Cancelar
              </button>
              <button className="btn btn-primary"
                style={{
                  background: quejaTexto.trim() ? 'linear-gradient(135deg, var(--cobre), var(--cobre-light))' : 'var(--surface2)',
                }}
                disabled={!quejaTexto.trim()}
                onClick={() => {
                  const datosQueja = {
                    tipo: 'queja_cliente',
                    deRol: 'cliente',
                    deNombre: user?.nombre || 'Cliente',
                    mensaje: `Queja de ${user?.nombre || 'Cliente'} contra ${nombreCompleto}: ${quejaTexto.trim()}`,
                    metadata: { barberoId: id, barberoNombre: nombreCompleto },
                  };
                  notificacionesService.crear({
                    ...datosQueja,
                    paraRol: 'barberia',
                    paraNombre: 'styleup',
                  });
                  notificacionesService.crear({
                    ...datosQueja,
                    paraRol: 'barbero',
                    paraNombre: nombreCompleto,
                  });
                  setQuejaTexto('');
                  setMostrarQueja(false);
                  setQuejaEnviada(true);
                  setTimeout(() => setQuejaEnviada(false), 3000);
                }}>
                <AlertTriangle size={16} /> Enviar queja
              </button>
            </div>
          </div>
        </div>
      )}

      {quejaEnviada && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2001,
          background: 'var(--surface)',
          border: '1px solid rgba(230,184,106,0.3)',
          borderRadius: 12, padding: '14px 20px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.88rem', color: 'var(--gold)',
        }}>
          <AlertTriangle size={18} /> Queja enviada correctamente
        </div>
      )}
    </div>
  );
}
