// src/pages/cliente/PerfilBarbero.jsx
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { useHorarios } from '../../context/useHorarios.js';
import { useChatFlotante } from '../../context/useChatFlotante.js';
import { barberosService } from '../../services/barberosService.js';
import { citasService } from '../../services/citasService.js';
import { preciosService, NOMBRES_SERVICIOS } from '../../services/preciosService.js';
import { barberiaService } from '../../services/barberiaService.js';
import {
  DURACION_SERVICIOS,
  generarSlots,
} from '../../services/agendamientoService.js';
import Estrellas from '../../components/Estrellas.jsx';
import MapaMini from '../../components/MapaMini.jsx';
import { getDiasSemana, fmtFecha } from '../../services/semana.js';

const SERVICIOS_INFO = {
  E001: { icon: '✂',  dur: DURACION_SERVICIOS.E001 },
  E002: { icon: '💈', dur: DURACION_SERVICIOS.E002 },
  E006: { icon: '🪒', dur: DURACION_SERVICIOS.E006 },
  E008: { icon: '🧔', dur: DURACION_SERVICIOS.E008 },
  E007: { icon: '🎨', dur: DURACION_SERVICIOS.E007 },
  E004: { icon: '⚡', dur: DURACION_SERVICIOS.E004 },
};

export default function PerfilBarbero() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agregarCita } = useCitas();
  const { horarios, cargarHorarios } = useHorarios();
  const { abrirChatCon } = useChatFlotante();

  const barbero = barberosService.getById(id);
  if (!barbero) { navigate('/cliente/barberos'); return null; }

  const nombreCompleto = `${barbero.nombre} ${barbero.apellido}`;

  // Carga de horarios una sola vez (patrón lazy sin useEffect)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [horariosListos, setHorariosListos] = useState(false);
  if (!horariosListos) {
    cargarHorarios(nombreCompleto);
    setHorariosListos(true);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const precios = useMemo(
    () => preciosService.getPreciosByBarbero(nombreCompleto),
    [nombreCompleto]
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const barberia = useMemo(
    () => barberiaService.getTodas().find((b) => b.barberos?.includes(nombreCompleto)) ?? null,
    [nombreCompleto]
  );

  // ── Navegación de semanas ──────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [semanaOffset, setSemanaOffset] = useState(0);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const diasSemana = useMemo(() => getDiasSemana(semanaOffset), [semanaOffset]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [diaSeleccionado, setDiaSeleccionado] = useState(
    () => String(new Date().getDate())
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
        background: 'linear-gradient(160deg, #1a0806 0%, #2c0f0a 50%, #161b22 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '32px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button className="btn btn-ghost btn-sm"
            style={{ marginBottom: 24, color: 'var(--muted)' }}
            onClick={() => navigate('/cliente/barberos')}>
            ← Volver a barberos
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
                  {barbero.disponibleHoy ? '● Disponible hoy' : '● No disponible'}
                </span>
              </div>
              <div style={{ color: 'var(--gold)', fontSize: '0.95rem', marginBottom: 8 }}>
                ✂ {barbero.especialidad}
              </div>
              {barberia && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(230,184,106,0.08)',
                  border: '1px solid rgba(230,184,106,0.2)',
                  borderRadius: 20, padding: '3px 12px',
                  fontSize: '0.78rem', color: 'var(--gold)', marginBottom: 8,
                }}>
                  🏪 Trabaja en {barberia.nombre}
                </div>
              )}
              <div style={{ marginBottom: 12 }}>
                <Estrellas calificacion={barbero.calificacion} total={barbero.totalCalificaciones} size="lg" />
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>📍 {barbero.direccion}, {barbero.ciudad}</span>
                <span>📞 {barbero.telefono}</span>
              </div>
            </div>

            <button className="btn btn-outline" style={{ flexShrink: 0 }}
              onClick={() => abrirChatCon(nombreCompleto)}>
              💬 Enviar mensaje
            </button>
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
                💰 Servicios y precios
              </div>
              {!servicioSel
                ? <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600 }}>← Elige uno para agendar</span>
                : <span className="badge badge-green">✓ Seleccionado</span>
              }
            </div>
            <div style={{ padding: '8px 16px' }}>
              {Object.entries(NOMBRES_SERVICIOS).map(([sid, nombre]) => {
                const info   = SERVICIOS_INFO[sid] || { icon: '✂', dur: 30 };
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: esSel ? 'rgba(230,184,106,0.15)' : 'var(--surface2)',
                        border: esSel ? '1px solid rgba(230,184,106,0.3)' : '1px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', flexShrink: 0, transition: 'all 0.2s',
                      }}>
                        {info.icon}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: esSel ? 'var(--gold)' : 'var(--text)' }}>
                          {nombre}
                        </div>
                        {/* Duración real del servicio */}
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          ⏱ {info.dur} min
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        color: 'var(--gold)', fontWeight: 700, fontSize: '0.95rem',
                      }}>
                        {formatPrecio(precio)}
                      </div>
                      {esSel && (
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--gold)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', color: '#000', fontWeight: 700, flexShrink: 0,
                        }}>✓</span>
                      )}
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
                📅 Disponibilidad
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
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>👈</div>
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
                      const esSeleccionado = diaSeleccionado === d.num;
                      const esHoyDia = String(new Date().getDate()) === d.num && semanaOffset === 0;
                      const tieneSlots = horarios.some(
                        (h) => h.dia === d.num && h.estado === 'disponible'
                      );
                      return (
                        <div
                          key={d.num}
                          onClick={() => { setDiaSeleccionado(d.num); setSlotSel(null); }}
                          style={{
                            padding: '8px 4px', textAlign: 'center', borderRadius: 8,
                            cursor: 'pointer', border: '1.5px solid',
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
                ✅ Resumen de tu cita
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
                📱 Recibirás un recordatorio por Telegram 1 hora antes.
              </div>
              {confirmado && (
                <div className="alert alert-success" style={{ marginBottom: 12 }}>
                  ✅ ¡Cita agendada! Redirigiendo...
                </div>
              )}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-outline" onClick={() => setSlotSel(null)}>
                  ← Modificar hora
                </button>
                <button className="btn btn-success btn-lg" onClick={handleConfirmar} disabled={confirmado}>
                  ✅ Confirmar cita
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── UBICACIÓN ── */}
        {(ubicacion.lat && ubicacion.lng) && (
          <div className="card">
            <div className="card-title">📍 Ubicación</div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 12 }}>
              <MapaMini
                lat={ubicacion.lat} lng={ubicacion.lng}
                icono={barberia ? '🏪' : '💈'}
                color={barberia ? '#e6b86a' : '#e74c3c'}
                altura={230}
              />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              {barberia
                ? <><strong style={{ color: 'var(--text)' }}>🏪 {barberia.nombre}</strong> · {barberia.direccion}, {barberia.ciudad}</>
                : <>📍 {barbero.direccion}, {barbero.ciudad}</>
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}