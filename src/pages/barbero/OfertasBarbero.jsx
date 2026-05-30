// src/pages/barbero/OfertasBarbero.jsx
import { useState } from 'react';
import { Home, Clock, Scissors, ClipboardList, BookOpen, BarChart3, BriefcaseBusiness, Wallet, Users, Target, Wrench, Calendar, Building2, X, Check, Sparkles, Frown, Hourglass } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { ofertasService } from '../../services/ofertasService.js';
import {
  labelContratacion,
  labelExperiencia,
  ESPECIALIDADES_TAGS,
  NIVEL_PROFESIONAL,
  DISPONIBILIDAD_OPCIONES,
  MODALIDAD_OPCIONES,
} from '../../services/ofertasConfig.js';

const navItems = [
  { icon: <Home size={18} />, label: 'Dashboard',     href: '/barbero' },
  { icon: <Clock size={18} />, label: 'Mis horarios',  href: '/barbero/horarios' },
  { icon: <Scissors size={18} />, label: 'Mis servicios', href: '/barbero/precios' },
  { icon: <ClipboardList size={18} />, label: 'Ofertas',       href: '/barbero/ofertas' },
  { icon: <BookOpen size={18} />, label: 'Historial',     href: '/barbero/historial' },
  { icon: <BarChart3 size={18} />, label: 'Reportes',      href: '/barbero/reportes' },
];

const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

// ── Badge de tipo de contratación ─────────────────────────────
const colorContratacion = {
  comision:          { bg: 'rgba(230,184,106,0.12)', color: 'var(--gold)',      border: 'rgba(230,184,106,0.3)' },
  salario_fijo:      { bg: 'rgba(46,160,67,0.12)',   color: '#3fb950',          border: 'rgba(46,160,67,0.3)' },
  salario_comision:  { bg: 'rgba(52,152,219,0.12)',  color: '#3498db',          border: 'rgba(52,152,219,0.3)' },
  alquiler_silla:    { bg: 'rgba(192,57,43,0.12)',   color: 'var(--cobre-light)', border: 'rgba(192,57,43,0.3)' },
};

function BadgeContratacion({ tipo }) {
  const c = colorContratacion[tipo] || colorContratacion.comision;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      <BriefcaseBusiness size={14} /> {labelContratacion(tipo)}
    </span>
  );
}

// ── Selector de tags reutilizable ─────────────────────────────
function SelectorTags({ opciones, seleccionados, onChange, max = 6 }) {
  const toggle = (tag) => {
    if (seleccionados.includes(tag)) {
      onChange(seleccionados.filter((t) => t !== tag));
    } else if (seleccionados.length < max) {
      onChange([...seleccionados, tag]);
    }
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {opciones.map((tag) => {
        const activo = seleccionados.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            style={{
              padding: '5px 12px', borderRadius: 20, border: '1.5px solid',
              borderColor: activo ? 'var(--gold)' : 'var(--border)',
              background: activo ? 'rgba(230,184,106,0.12)' : 'var(--surface2)',
              color: activo ? 'var(--gold)' : 'var(--muted)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: seleccionados.length >= max && !activo ? 0.4 : 1,
            }}
          >
            {activo ? '✓ ' : ''}{tag}
          </button>
        );
      })}
    </div>
  );
}

// ── Modal de detalle + aplicación ────────────────────────────
function ModalOferta({ oferta, onCerrar, onAplicar, yaAplic, estadoApp }) {
  const [paso, setPaso]         = useState(1); // 1=detalle, 2=aplicar
  const [mensaje, setMensaje]   = useState('');
  const [hdv, setHdv]           = useState({
    presentacion:        '',
    nivel:               '',
    especialidades:      [],
    disponibilidad:      '',
    modalidad:           '',
    herramientasPropias: false,
    experiencia:         '',
    certificados:        [{ nombre: '', institucion: '', anio: '' }],
  });
  const [enviado, setEnviado]   = useState(false);
  const [errHdv, setErrHdv]     = useState({});

  const setHdvField = (campo, valor) =>
    setHdv((prev) => ({ ...prev, [campo]: valor }));

  const setCertificado = (i, campo, valor) => {
    const certs = [...hdv.certificados];
    certs[i] = { ...certs[i], [campo]: valor };
    setHdv((prev) => ({ ...prev, certificados: certs }));
  };

  const agregarCertificado = () => {
    setHdv((prev) => ({
      ...prev,
      certificados: [...prev.certificados, { nombre: '', institucion: '', anio: '' }],
    }));
  };

  const validarHdv = () => {
    const e = {};
    if (!hdv.presentacion.trim()) e.presentacion = 'Escribe una breve presentación.';
    if (!hdv.nivel)               e.nivel         = 'Selecciona tu nivel profesional.';
    if (hdv.especialidades.length === 0) e.especialidades = 'Selecciona al menos una especialidad.';
    if (!hdv.disponibilidad)      e.disponibilidad = 'Indica tu disponibilidad.';
    if (!hdv.modalidad)           e.modalidad      = 'Indica la modalidad preferida.';
    setErrHdv(e);
    return Object.keys(e).length === 0;
  };

  const handleEnviar = () => {
    if (!validarHdv()) return;
    onAplicar(oferta.id, hdv, mensaje);
    setEnviado(true);
  };

  // Cierra al hacer clic fuera del modal
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCerrar();
  };

  const badgeEstadoApp = {
    pendiente: <span className="badge badge-gold">Aplicación pendiente</span>,
    aceptada:  <span className="badge badge-green">¡Aplicación aceptada!</span>,
    rechazada: <span className="badge badge-muted">Aplicación rechazada</span>,
  };

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 18,
        width: '100%', maxWidth: 600,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 0.2s ease',
      }}>

        {/* ── Header del modal ── */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface2)',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.2rem', fontWeight: 700, marginBottom: 4,
            }}>
              {oferta.titulo}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--gold)' }}>
              <Building2 size={14} /> {oferta.barberiaNombre}
            </div>
          </div>
          <button
            onClick={onCerrar}
            style={{
              background: 'none', border: 'none', color: 'var(--muted)',
              cursor: 'pointer', fontSize: '1.2rem', flexShrink: 0,
              padding: '2px 6px', borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Tabs detalle / aplicar ── */}
        {!yaAplic && !enviado && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[
              { num: 1, label: 'Ver detalle' },
              { num: 2, label: 'Aplicar' },
            ].map((t) => (
              <button
                key={t.num}
                onClick={() => setPaso(t.num)}
                style={{
                  flex: 1, padding: '12px',
                  background: 'none', border: 'none',
                  borderBottom: `2px solid ${paso === t.num ? 'var(--gold)' : 'transparent'}`,
                  color: paso === t.num ? 'var(--gold)' : 'var(--muted)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600, fontSize: '0.88rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Contenido scrolleable ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Estado: ya aplicó o se acaba de enviar */}
          {(yaAplic || enviado) && (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>
                {enviado ? <Check size={48} /> : estadoApp === 'aceptada' ? <Sparkles size={48} /> : estadoApp === 'rechazada' ? <Frown size={48} /> : <Hourglass size={48} />}
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.2rem', fontWeight: 700, marginBottom: 8,
              }}>
                {enviado
                  ? '¡Aplicación enviada!'
                  : estadoApp === 'aceptada' ? '¡Te aceptaron!'
                  : estadoApp === 'rechazada' ? 'No fue esta vez'
                  : 'Aplicación en revisión'}
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: 20 }}>
                {enviado
                  ? 'La barbería revisará tu hoja de vida y te contactará.'
                  : badgeEstadoApp[estadoApp]}
              </div>
              <button className="btn btn-outline" onClick={onCerrar}>
                Cerrar
              </button>
            </div>
          )}

          {/* ── PESTAÑA 1: Detalle de la oferta ── */}
          {!yaAplic && !enviado && paso === 1 && (
            <div>
              {/* Chips de info clave */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                <BadgeContratacion tipo={oferta.tipoContratacion} />
                <span className="badge badge-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Wallet size={14} /> {oferta.condicionEconomica}</span>
                <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {oferta.vacantes} vacante{oferta.vacantes !== 1 ? 's' : ''}</span>
                <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Target size={14} /> {labelExperiencia(oferta.experienciaRequerida)}</span>
                {oferta.herramientasPropias && (
                  <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Wrench size={14} /> Herramientas propias</span>
                )}
                {oferta.fechaLimite && (
                  <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> Límite: {oferta.fechaLimite}</span>
                )}
              </div>

              {/* Horario */}
              <div style={{
                background: 'var(--surface2)', borderRadius: 10,
                padding: '14px 16px', marginBottom: 16,
              }}>
                <div style={{
                  fontSize: '0.72rem', color: 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
                }}>
                  ⏰ Horario
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                  {oferta.horario || '—'}
                </div>
              </div>

              {/* Descripción */}
              {oferta.descripcion && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
                  }}>
                    Descripción
                  </div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--text)' }}>
                    {oferta.descripcion}
                  </div>
                </div>
              )}

              {/* Especialidades buscadas */}
              {oferta.especialidadesBuscadas?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
                  }}>
                    Especialidades buscadas
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {oferta.especialidadesBuscadas.map((e) => (
                      <span key={e} className="badge badge-gold">{e}</span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: 8 }}
                onClick={() => setPaso(2)}
              >
                Aplicar a esta oferta →
              </button>
            </div>
          )}

          {/* ── PESTAÑA 2: Hoja de vida + mensaje ── */}
          {!yaAplic && !enviado && paso === 2 && (
            <div>
              <div className="alert alert-info" style={{ marginBottom: 20, fontSize: '0.82rem' }}>
                💡 Esta información se enviará directamente a <strong>{oferta.barberiaNombre}</strong>.
                Complétala con cuidado — es tu carta de presentación.
              </div>

              {/* Sección 1 — Presentación */}
              <div style={{
                fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                1 · Presentación
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Presentación profesional *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Ej: Barbero con 3 años de experiencia especializado en fades y cortes urbanos..."
                  value={hdv.presentacion}
                  onChange={(e) => setHdvField('presentacion', e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                {errHdv.presentacion && (
                  <div style={{ color: 'var(--cobre-light)', fontSize: '0.75rem', marginTop: 4 }}>
                    {errHdv.presentacion}
                  </div>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nivel profesional *</label>
                  <select
                    className="form-control"
                    value={hdv.nivel}
                    onChange={(e) => setHdvField('nivel', e.target.value)}
                  >
                    <option value="">Selecciona...</option>
                    {NIVEL_PROFESIONAL.map((n) => (
                      <option key={n.value} value={n.label}>{n.label}</option>
                    ))}
                  </select>
                  {errHdv.nivel && (
                    <div style={{ color: 'var(--cobre-light)', fontSize: '0.75rem', marginTop: 4 }}>
                      {errHdv.nivel}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Años de experiencia</label>
                  <input
                    className="form-control"
                    placeholder="Ej: 3 años en BarberShop X"
                    value={hdv.experiencia}
                    onChange={(e) => setHdvField('experiencia', e.target.value)}
                  />
                </div>
              </div>

              {/* Sección 2 — Especialidades */}
              <div style={{
                fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 12, marginTop: 8,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                2 · Especialidades
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Mis especialidades *
                  <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', marginLeft: 6 }}>
                    (máx. 6)
                  </span>
                </label>
                <SelectorTags
                  opciones={ESPECIALIDADES_TAGS}
                  seleccionados={hdv.especialidades}
                  onChange={(v) => setHdvField('especialidades', v)}
                />
                {errHdv.especialidades && (
                  <div style={{ color: 'var(--cobre-light)', fontSize: '0.75rem', marginTop: 6 }}>
                    {errHdv.especialidades}
                  </div>
                )}
              </div>

              {/* Sección 3 — Disponibilidad */}
              <div style={{
                fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 12, marginTop: 8,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                3 · Disponibilidad y condiciones
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Disponibilidad *</label>
                  <select
                    className="form-control"
                    value={hdv.disponibilidad}
                    onChange={(e) => setHdvField('disponibilidad', e.target.value)}
                  >
                    <option value="">Selecciona...</option>
                    {DISPONIBILIDAD_OPCIONES.map((o) => (
                      <option key={o.value} value={o.label}>{o.label}</option>
                    ))}
                  </select>
                  {errHdv.disponibilidad && (
                    <div style={{ color: 'var(--cobre-light)', fontSize: '0.75rem', marginTop: 4 }}>
                      {errHdv.disponibilidad}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Modalidad preferida *</label>
                  <select
                    className="form-control"
                    value={hdv.modalidad}
                    onChange={(e) => setHdvField('modalidad', e.target.value)}
                  >
                    <option value="">Selecciona...</option>
                    {MODALIDAD_OPCIONES.map((o) => (
                      <option key={o.value} value={o.label}>{o.label}</option>
                    ))}
                  </select>
                  {errHdv.modalidad && (
                    <div style={{ color: 'var(--cobre-light)', fontSize: '0.75rem', marginTop: 4 }}>
                      {errHdv.modalidad}
                    </div>
                  )}
                </div>
              </div>

              {/* Herramientas propias */}
              <div
                onClick={() => setHdvField('herramientasPropias', !hdv.herramientasPropias)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', marginBottom: 20,
                  background: hdv.herramientasPropias ? 'rgba(230,184,106,0.08)' : 'var(--surface2)',
                  border: '1.5px solid',
                  borderColor: hdv.herramientasPropias ? 'var(--gold)' : 'var(--border)',
                  borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 4, border: '2px solid',
                  borderColor: hdv.herramientasPropias ? 'var(--gold)' : 'var(--border)',
                  background: hdv.herramientasPropias ? 'var(--gold)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', color: '#000', flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {hdv.herramientasPropias ? '✓' : ''}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      <Wrench size={14} /> Tengo mis propias herramientas
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                    Máquina, tijeras, kit completo
                  </div>
                </div>
              </div>

              {/* Sección 4 — Certificados */}
              <div style={{
                fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                4 · Certificados y cursos
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {hdv.certificados.map((cert, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--surface2)', borderRadius: 10,
                    padding: '14px 16px', marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 10 }}>
                    🎓 Certificado {i + 1}
                  </div>
                  <div className="grid-2" style={{ gap: 10 }}>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label">Nombre del curso</label>
                      <input
                        className="form-control"
                        placeholder="Ej: Curso de barbería profesional"
                        value={cert.nombre}
                        onChange={(e) => setCertificado(i, 'nombre', e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label">Institución</label>
                      <input
                        className="form-control"
                        placeholder="Ej: SENA"
                        value={cert.institucion}
                        onChange={(e) => setCertificado(i, 'institucion', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Año</label>
                    <input
                      className="form-control"
                      placeholder="Ej: 2024"
                      value={cert.anio}
                      onChange={(e) => setCertificado(i, 'anio', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={agregarCertificado}
                style={{ marginBottom: 20 }}
              >
                + Agregar otro certificado
              </button>

              {/* Sección 5 — Mensaje adicional */}
              <div style={{
                fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                5 · Mensaje para la barbería
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <div className="form-group">
                <label className="form-label">Mensaje opcional</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Escribe algo adicional que quieras que la barbería sepa sobre ti..."
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <button className="btn btn-outline" onClick={() => setPaso(1)}>
                  ← Ver oferta
                </button>
                <button className="btn btn-success btn-lg" onClick={handleEnviar}>
                  <Check size={16} /> Enviar aplicación
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function OfertasBarbero() {
  const { user } = useAuth();

  // ✅ FIX: inicialización lazy con función — evita el warning
  // "setState synchronously within an effect". Como ofertasService
  // usa sessionStorage (síncrono), podemos leer los datos directamente
  // al crear el estado, sin necesidad de useEffect.
  const [ofertas] = useState(() => ofertasService.getOfertasActivas());

  const [aplicaciones, setAplicaciones] = useState(
    () => user?.nombre
      ? ofertasService.getAplicacionesByBarbero(user.nombre)
      : []
  );

  const [ofertaModal, setOfertaModal] = useState(null);
  const [filtro, setFiltro]           = useState('');

  const handleAplicar = (ofertaId, hdv, mensaje) => {
    if (!user?.nombre) return;
    const resultado = ofertasService.aplicar(ofertaId, user.nombre, {
      ...hdv,
      nombreCompleto: user.nombre,
      mensaje,
    });
    if (resultado) {
      setAplicaciones((prev) => [...prev, resultado]);
    }
  };

  const getEstadoApp = (ofertaId) => {
    const app = aplicaciones.find((a) => a.ofertaId === ofertaId);
    return app ? app.estado : null;
  };

  const yaAplic = (ofertaId) =>
    aplicaciones.some((a) => a.ofertaId === ofertaId);

  // Filtro por texto
  const ofertasFiltradas = ofertas.filter((o) =>
    `${o.titulo} ${o.barberiaNombre} ${o.condicionEconomica}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  const badgeEstadoApp = {
    pendiente: <span className="badge badge-gold" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Hourglass size={12} /> Pendiente</span>,
    aceptada:  <span className="badge badge-green" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={12} /> Aceptada</span>,
    rechazada: <span className="badge badge-muted" style={{ fontSize: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 3 }}><X size={12} /> Rechazada</span>,
  };

  return (
    <div className="app-layout">
      <Sidebar avatar={<Scissors size={20} />} badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={22} /> Ofertas de trabajo</h2>
          <p className="page-subtitle">Encuentra oportunidades en barberías de tu ciudad</p>
        </div>

        {/* ── Stats ── */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            [ofertas.length,      'Ofertas disponibles',  'var(--gold)'],
            [aplicaciones.length, 'Mis aplicaciones',     '#3fb950'],
            [aplicaciones.filter((a) => a.estado === 'aceptada').length,
              'Aceptadas', 'var(--cobre-light)'],
          ].map(([v, l, c]) => (
            <div key={l} className="stat-card">
              <div className="stat-value" style={{ color: c, fontSize: '1.6rem' }}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        {/* ── Buscador ── */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por título, barbería o condición económica..."
            style={{ maxWidth: 480 }}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {/* ── Lista compacta ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ofertasFiltradas.length === 0 ? (
            <div className="alert alert-info">No se encontraron ofertas.</div>
          ) : (
            ofertasFiltradas.map((o) => {
              const aplicado  = yaAplic(o.id);
              const estadoApp = getEstadoApp(o.id);

              return (
                <div
                  key={o.id}
                  onClick={() => setOfertaModal(o)}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    borderLeft: aplicado ? '3px solid #3fb950' : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                  }}>
                    {/* Info principal */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: 10, marginBottom: 6, flexWrap: 'wrap',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {o.titulo}
                        </div>
                        <BadgeContratacion tipo={o.tipoContratacion} />
                        {aplicado && badgeEstadoApp[estadoApp]}
                      </div>

                      <div style={{
                        display: 'flex', gap: 14, flexWrap: 'wrap',
                        fontSize: '0.78rem', color: 'var(--muted)',
                      }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Building2 size={14} /> {o.barberiaNombre}</span>
                        <span style={{ color: 'var(--gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Wallet size={14} /> {o.condicionEconomica}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Target size={14} /> {labelExperiencia(o.experienciaRequerida)}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={14} /> {o.vacantes} vacante{o.vacantes !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Tags de especialidades */}
                      {o.especialidadesBuscadas?.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                          {o.especialidadesBuscadas.map((e) => (
                            <span key={e} style={{
                              fontSize: '0.68rem', padding: '2px 8px',
                              background: 'rgba(230,184,106,0.08)',
                              border: '1px solid rgba(230,184,106,0.2)',
                              borderRadius: 10, color: 'var(--gold)',
                            }}>
                              {e}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Flecha / check */}
                    <div style={{ flexShrink: 0, color: 'var(--muted)', fontSize: '0.9rem' }}>
                      {aplicado ? '✓' : '›'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ── Modal ── */}
      {ofertaModal && (
        <ModalOferta
          oferta={ofertaModal}
          onCerrar={() => setOfertaModal(null)}
          onAplicar={handleAplicar}
          yaAplic={yaAplic(ofertaModal.id)}
          estadoApp={getEstadoApp(ofertaModal.id)}
        />
      )}
    </div>
  );
}