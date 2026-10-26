// src/pages/barbero/OfertasBarbero.jsx
import { useState, useEffect } from 'react';
import { Home, Clock, Scissors, ClipboardList, BookOpen, BarChart3, BriefcaseBusiness, Wallet, Users, Target, Wrench, Calendar, Building2, X, Check, Sparkles, Frown, Hourglass, GraduationCap, Lightbulb, ArrowLeft, ArrowRight, Bell, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { ofertasService } from '../../services/ofertasService.js';
import { cvService } from '../../services/cvService.js';
import CVPreviewModal from '../../components/cv/CVPreviewModal.jsx';
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
  { icon: <FileText size={18} />, label: 'Mi Hoja de Vida', href: '/barbero/hoja-de-vida' },
  { icon: <ClipboardList size={18} />, label: 'Ofertas',       href: '/barbero/ofertas' },
  { icon: <BookOpen size={18} />, label: 'Historial',     href: '/barbero/historial' },
  { icon: <BarChart3 size={18} />, label: 'Reportes',      href: '/barbero/reportes' },
  { icon: <Bell size={18} />, label: 'Notificaciones', href: '/barbero/notificaciones', notificacionesBadge: true },
];

const extra = <div className="spec-badge" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><Scissors size={14} /> Corte a tijera</div>;

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
            {activo ? <><Check size={12} /> </> : ''}{tag}
          </button>
        );
      })}
    </div>
  );
}

// ── Modal de detalle + aplicación ────────────────────────────
function ModalOferta({ oferta, cvData, onCerrar, onAplicar, yaAplic, estadoApp }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paso, setPaso]         = useState(1);
  const [mensaje, setMensaje]   = useState('');
  const [enviado, setEnviado]   = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const tieneCV = cvData?.presentacion?.trim() && cvData?.nivel;

  const handleEnviar = () => {
    if (!tieneCV) return;
    onAplicar(oferta.id, {
      ...cvData,
      experiencia: cvData.anosExperiencia || '',
    }, mensaje);
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
                  <Clock size={12} /> Horario
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
                Aplicar a esta oferta <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* ── PESTAÑA 2: Aplicar con CV guardado ── */}
          {!yaAplic && !enviado && paso === 2 && (
            <div>
              {tieneCV ? (
                <>
                  <div style={{
                    background: 'rgba(230,184,106,0.08)',
                    border: '1px solid rgba(230,184,106,0.25)',
                    borderRadius: 10, padding: '14px 16px', marginBottom: 20,
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={16} style={{ color: '#3fb950' }} /> Tu hoja de vida está lista
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>
                      {cvData.nivel && `${cvData.nivel}`}
                      {cvData.anosExperiencia && ` · ${cvData.anosExperiencia}`}
                      {cvData.especialidades?.length > 0 && ` · ${cvData.especialidades.slice(0, 3).join(', ')}${cvData.especialidades.length > 3 ? '...' : ''}`}
                    </div>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => setShowPreview(true)}
                      style={{ color: 'var(--gold)', fontWeight: 600 }}>
                      <FileText size={14} /> Ver CV completo
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mensaje para {oferta.barberiaNombre}</label>
                    <textarea
                      className="form-control" rows={3}
                      placeholder="Escribe algo adicional que quieras que la barbería sepa sobre ti..."
                      value={mensaje}
                      onChange={(e) => setMensaje(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <button className="btn btn-outline" onClick={() => setPaso(1)}>
                      <ArrowLeft size={16} /> Ver oferta
                    </button>
                    <button className="btn btn-success btn-lg" onClick={handleEnviar}>
                      <Check size={16} /> Enviar aplicación
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <FileText size={40} style={{ color: 'var(--muted)', marginBottom: 16 }} />
                  <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: 8 }}>
                    No has creado tu hoja de vida
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 20, lineHeight: 1.5 }}>
                    Crea tu hoja de vida profesional para poder postularte a las ofertas de trabajo.
                    Solo la llenas una vez y la usas en todas tus aplicaciones.
                  </div>
                  <button className="btn btn-primary"
                    onClick={() => navigate('/barbero/hoja-de-vida')}>
                    <FileText size={16} /> Crear hoja de vida
                  </button>
                </div>
              )}

              {showPreview && (
                <CVPreviewModal
                  cv={cvData}
                  nombre={user?.nombre}
                  onClose={() => setShowPreview(false)}
                  showPrintButton={false}
                />
              )}
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

  const [ofertas, setOfertas] = useState([]);
  const [aplicaciones, setAplicaciones] = useState([]);
  const [cvData, setCvData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [ofertasData, appsData, cv] = await Promise.all([
        ofertasService.getOfertasActivas(),
        user?.nombre ? ofertasService.getAplicacionesByBarbero(user.nombre) : Promise.resolve([]),
        cvService.getCV(user?.nombre),
      ]);
      setOfertas(ofertasData);
      setAplicaciones(appsData);
      setCvData(cv);
    };
    fetchData();
  }, [user?.nombre]);
  const [ofertaModal, setOfertaModal] = useState(null);
  const [filtro, setFiltro]           = useState('');

  const handleAplicar = async (ofertaId, hdv, mensaje) => {
    if (!user?.nombre) return;
    const resultado = await ofertasService.aplicar(ofertaId, user.nombre, {
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
                      {aplicado ? <Check size={14} /> : <span style={{ fontSize: '0.9rem' }}>›</span>}
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
          cvData={cvData}
          onCerrar={() => setOfertaModal(null)}
          onAplicar={handleAplicar}
          yaAplic={yaAplic(ofertaModal.id)}
          estadoApp={getEstadoApp(ofertaModal.id)}
        />
      )}
    </div>
  );
}