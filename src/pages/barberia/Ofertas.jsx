// src/pages/barberia/Ofertas.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { ofertasService } from '../../services/ofertasService.js';
import {
  TIPOS_CONTRATACION,
  EXPERIENCIA_OPCIONES,
  ESPECIALIDADES_TAGS,
  labelContratacion,
  labelExperiencia,
} from '../../services/ofertasConfig.js';

// ── Valores iniciales del formulario ─────────────────────────
const FORM_VACIO = {
  titulo: '',
  descripcion: '',
  tipoContratacion: '',
  condicionEconomica: '',
  horario: '',
  diasLaborales: [],
  horasPorDia: {}, // { Lun: { entrada: '09:00', salida: '18:00' }, ... }
  vacantes: 1,
  especialidadesBuscadas: [],
  experienciaRequerida: '',
  herramientasPropias: false,
  fechaLimite: '',
};

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/barberia' },
  { icon: '💈', label: 'Barberos',  href: '/barberia/barberos' },
  { icon: '📋', label: 'Ofertas',   href: '/barberia/ofertas' },
  { icon: '⏰', label: 'Horarios',  href: '/barberia/horarios' },
  { icon: '✂️', label: 'Servicios', href: '/barberia/servicios' },
  { icon: '📊', label: 'Reportes',  href: '/barberia/reportes' },
];

// ── Componente reutilizable: selector de tags ─────────────────
function SelectorTags({ opciones, seleccionados, onChange, max = 5 }) {
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
              padding: '6px 14px',
              borderRadius: 20,
              border: '1.5px solid',
              borderColor: activo ? 'var(--gold)' : 'var(--border)',
              background: activo ? 'rgba(230,184,106,0.12)' : 'var(--surface2)',
              color: activo ? 'var(--gold)' : 'var(--muted)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: seleccionados.length >= max && !activo ? 'not-allowed' : 'pointer',
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

// ── Componente: card de oferta publicada ──────────────────────
function CardOferta({ oferta, aplicaciones, onCerrar }) {
  const [expandida, setExpandida] = useState(false);
  const appsDeEstaOferta = aplicaciones.filter((a) => a.ofertaId === oferta.id);

  return (
    <div
      className="card"
      style={{
        padding: 0,
        overflow: 'hidden',
        borderLeft: oferta.estado === 'activa'
          ? '3px solid #3fb950'
          : '3px solid var(--muted)',
      }}
    >
      {/* Cabecera de la card */}
      <div
        style={{
          padding: '18px 22px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
        onClick={() => setExpandida(!expandida)}
      >
        <div style={{ flex: 1 }}>
          {/* Título + badge estado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{oferta.titulo}</div>
            <span className={`badge ${oferta.estado === 'activa' ? 'badge-green' : 'badge-muted'}`}>
              {oferta.estado === 'activa' ? '● Activa' : '● Cerrada'}
            </span>
            {appsDeEstaOferta.length > 0 && (
              <span className="badge badge-gold">
                {appsDeEstaOferta.length} aplicación{appsDeEstaOferta.length !== 1 ? 'es' : ''}
              </span>
            )}
          </div>

          {/* Chips de info rápida */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <span>💼 {labelContratacion(oferta.tipoContratacion)}</span>
            <span>💰 {oferta.condicionEconomica}</span>
            <span>⏰ {oferta.horario}</span>
            <span>👥 {oferta.vacantes} vacante{oferta.vacantes !== 1 ? 's' : ''}</span>
            {oferta.fechaLimite && <span>📅 Límite: {oferta.fechaLimite}</span>}
          </div>
        </div>

        {/* Flecha expandir */}
        <div style={{
          color: 'var(--muted)', fontSize: '0.9rem', flexShrink: 0,
          transition: 'transform 0.2s',
          transform: expandida ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </div>
      </div>

      {/* Detalle expandido */}
      {expandida && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '18px 22px',
          background: 'rgba(255,255,255,0.02)',
        }}>
          {/* Descripción */}
          <div style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 16 }}>
            {oferta.descripcion}
          </div>

          {/* Detalles en grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              ['🎯 Experiencia requerida', labelExperiencia(oferta.experienciaRequerida)],
              ['🔧 Herramientas propias', oferta.herramientasPropias ? 'Sí, requeridas' : 'No requeridas'],
            ].map(([l, v]) => (
              <div key={l} style={{
                background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px',
              }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Especialidades */}
          {oferta.especialidadesBuscadas?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Especialidades buscadas
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {oferta.especialidadesBuscadas.map((e) => (
                  <span key={e} className="badge badge-gold">{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Aplicaciones recibidas */}
          {appsDeEstaOferta.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 10,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Aplicaciones recibidas
              </div>
              <TablaAplicaciones aplicaciones={appsDeEstaOferta} />
            </div>
          )}

          {/* Acción cerrar */}
          {oferta.estado === 'activa' && (
            <button
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--cobre-light)', borderColor: 'var(--cobre-light)' }}
              onClick={(e) => { e.stopPropagation(); onCerrar(oferta.id); }}
            >
              Cerrar oferta
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tabla de aplicaciones recibidas ──────────────────────────
function TablaAplicaciones({ aplicaciones }) {
  const [verHDV, setVerHDV] = useState(null); // aplicación seleccionada
  const [estados, setEstados] = useState(() =>
    aplicaciones.reduce((acc, a) => ({ ...acc, [a.id]: a.estado }), {})
  );

  const cambiarEstado = (aplicacionId, nuevoEstado) => {
    ofertasService.cambiarEstadoAplicacion(aplicacionId, nuevoEstado);
    setEstados((prev) => ({ ...prev, [aplicacionId]: nuevoEstado }));
  };

  const badgeEstado = {
    pendiente:  <span className="badge badge-gold">Pendiente</span>,
    aceptada:   <span className="badge badge-green">Aceptada</span>,
    rechazada:  <span className="badge badge-muted">Rechazada</span>,
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {aplicaciones.map((ap) => {
          const hdv = ap.hojaDeVida || {};
          const estado = estados[ap.id] || ap.estado;

          return (
            <div
              key={ap.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              {/* Avatar + nombre */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem', flexShrink: 0,
              }}>
                💈
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ap.barberoNombre}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                  {hdv.nivel && <span style={{ marginRight: 10 }}>🏆 {hdv.nivel}</span>}
                  {hdv.disponibilidad && <span>⏰ {hdv.disponibilidad}</span>}
                </div>
                {/* Tags de especialidades del barbero */}
                {hdv.especialidades?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {hdv.especialidades.slice(0, 4).map((e) => (
                      <span key={e} style={{
                        fontSize: '0.65rem', padding: '2px 8px',
                        background: 'rgba(230,184,106,0.1)',
                        border: '1px solid rgba(230,184,106,0.2)',
                        borderRadius: 10, color: 'var(--gold)',
                      }}>
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Estado + acciones */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {badgeEstado[estado]}
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setVerHDV(verHDV?.id === ap.id ? null : ap)}
                >
                  {verHDV?.id === ap.id ? 'Ocultar' : 'Ver hoja de vida'}
                </button>
                {estado === 'pendiente' && (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => cambiarEstado(ap.id, 'aceptada')}
                    >
                      ✓ Aceptar
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--cobre-light)', borderColor: 'var(--cobre-light)' }}
                      onClick={() => cambiarEstado(ap.id, 'rechazada')}
                    >
                      ✕ Rechazar
                    </button>
                  </>
                )}
              </div>

              {/* Hoja de vida expandida */}
              {verHDV?.id === ap.id && (
                <VistaHojaDeVida hdv={ap.hojaDeVida} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Vista resumida de la hoja de vida ────────────────────────
function VistaHojaDeVida({ hdv }) {
  if (!hdv) return null;

  const filas = [
    ['Presentación',   hdv.presentacion],
    ['Nivel',          hdv.nivel],
    ['Disponibilidad', hdv.disponibilidad],
    ['Modalidad',      hdv.modalidad],
    ['Herramientas',   hdv.herramientasPropias ? 'Sí tiene' : 'No tiene'],
    ['Experiencia',    hdv.experiencia],
  ].filter(([, v]) => v);

  return (
    <div style={{
      width: '100%',
      marginTop: 12,
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '14px 18px',
    }}>
      <div style={{
        fontFamily: "'Playfair Display', serif",
        fontWeight: 700, fontSize: '0.95rem', marginBottom: 12,
      }}>
        📄 Hoja de vida — {hdv.nombreCompleto || 'Barbero'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {filas.map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>

      {hdv.especialidades?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            Especialidades
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hdv.especialidades.map((e) => (
              <span key={e} className="badge badge-gold">{e}</span>
            ))}
          </div>
        </div>
      )}

      {hdv.certificados?.length > 0 && (
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            Certificados y cursos
          </div>
          {hdv.certificados.map((c, i) => (
            <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text)', marginBottom: 4 }}>
              🎓 {c.nombre} — {c.institucion} ({c.anio})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function Ofertas() {
  const [ofertas, setOfertas] = useState(() =>
    ofertasService.getOfertasByBarberia('BAR001')
  );

  const [aplicaciones] = useState(() =>
    ofertas.flatMap((o) => ofertasService.getAplicacionesByOferta(o.id))
  );

  // Wizard de nueva oferta
  const [modoNueva, setModoNueva] = useState(false);
  const [paso, setPaso]           = useState(1);
  const [form, setForm]           = useState(FORM_VACIO);
  const [errores, setErrores]     = useState({});
  const [publicadaOk, setPublicadaOk] = useState(false);

  // Helper para actualizar un campo del form
  const set = (campo, valor) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  // ── Validación por paso ───────────────────────────────────
  const validarPaso1 = () => {
    const e = {};
    if (!form.titulo.trim())           e.titulo = 'El título es obligatorio.';
    if (!form.tipoContratacion)        e.tipoContratacion = 'Selecciona el tipo de contratación.';
    if (!form.condicionEconomica.trim()) e.condicionEconomica = 'Indica la condición económica.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const validarPaso2 = () => {
    const e = {};
    if (!form.diasLaborales?.length)   e.horario = 'Selecciona al menos un día.';
    if (!form.experienciaRequerida)    e.experienciaRequerida = 'Selecciona la experiencia requerida.';
    if (form.especialidadesBuscadas.length === 0)
      e.especialidadesBuscadas = 'Selecciona al menos una especialidad.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleSiguiente = () => {
    if (paso === 1 && !validarPaso1()) return;
    if (paso === 2 && !validarPaso2()) return;
    setErrores({});
    setPaso((p) => p + 1);
  };

  const handlePublicar = () => {
    const horarioTexto = (form.diasLaborales || [])
      .map((dia) => {
        const h = form.horasPorDia?.[dia] || { entrada: '09:00', salida: '18:00' };
        return `${dia} ${h.entrada}–${h.salida}`;
      })
      .join(', ');

    const nueva = ofertasService.crearOferta({
      ...form,
      horario: horarioTexto,
      barberiaId: 'BAR001',
      barberiaNombre: 'BarberShop Style',
    });
    setOfertas((prev) => [...prev, nueva]);
    setPublicadaOk(true);
    setTimeout(() => {
      setModoNueva(false);
      setPublicadaOk(false);
      setPaso(1);
      setForm(FORM_VACIO);
    }, 1500);
  };

  const handleCerrar = (id) => {
    ofertasService.cerrarOferta(id);
    setOfertas((prev) =>
      prev.map((o) => (o.id === id ? { ...o, estado: 'cerrada' } : o))
    );
  };

  // ── Contadores ────────────────────────────────────────────
  const activas   = ofertas.filter((o) => o.estado === 'activa').length;
  const cerradas  = ofertas.filter((o) => o.estado === 'cerrada').length;
  const totalApps = aplicaciones.length;

  return (
    <div className="app-layout">
      <Sidebar avatar="🏪" badge="Barbería" badgeClass="badge-cobre" navItems={navItems} />

      <main className="main-content">

        {/* ── Cabecera ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap',
          gap: 12, marginBottom: 28,
        }}>
          <div>
            <h2 className="page-title">📋 Ofertas de trabajo</h2>
            <p className="page-subtitle">Publica y gestiona ofertas para barberos</p>
          </div>
          {!modoNueva && (
            <button
              className="btn btn-primary"
              onClick={() => { setModoNueva(true); setPaso(1); setForm(FORM_VACIO); }}
            >
              + Nueva oferta
            </button>
          )}
        </div>

        {/* ── Stats rápidas ── */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          {[
            [activas,   'Ofertas activas',       'var(--gold)'],
            [cerradas,  'Ofertas cerradas',       'var(--muted)'],
            [totalApps, 'Aplicaciones recibidas', '#3fb950'],
          ].map(([v, l, c]) => (
            <div key={l} className="stat-card">
              <div className="stat-value" style={{ color: c, fontSize: '1.6rem' }}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════════════
            WIZARD — Nueva oferta
        ════════════════════════════════════════ */}
        {modoNueva && (
          <div className="card" style={{ marginBottom: 28, padding: 28 }}>

            {/* Steps */}
            <div className="steps" style={{ marginBottom: 28 }}>
              {['Información básica', 'Detalles del puesto', 'Revisar y publicar'].map((l, i) => (
                <div key={l} className={`step ${paso === i + 1 ? 'active' : paso > i + 1 ? 'done' : ''}`}>
                  <div className="step-circle">{paso > i + 1 ? '✓' : i + 1}</div>
                  <div className="step-label">{l}</div>
                </div>
              ))}
            </div>

            {/* ── PASO 1 ── */}
            {paso === 1 && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: 20 }}>
                  Información básica
                </h3>

                <div className="form-group">
                  <label className="form-label">Título de la oferta *</label>
                  <input
                    className="form-control"
                    placeholder="Ej: Barbero especialista en fades"
                    value={form.titulo}
                    onChange={(e) => set('titulo', e.target.value)}
                  />
                  {errores.titulo && <div style={{ color: 'var(--cobre-light)', fontSize: '0.78rem', marginTop: 4 }}>{errores.titulo}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe el ambiente laboral, tipo de clientes y lo que buscas en el candidato..."
                    value={form.descripcion}
                    onChange={(e) => set('descripcion', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Tipo de contratación *</label>
                    <select
                      className="form-control"
                      value={form.tipoContratacion}
                      onChange={(e) => set('tipoContratacion', e.target.value)}
                    >
                      <option value="">Selecciona...</option>
                      {TIPOS_CONTRATACION.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {errores.tipoContratacion && (
                      <div style={{ color: 'var(--cobre-light)', fontSize: '0.78rem', marginTop: 4 }}>
                        {errores.tipoContratacion}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Condición económica *</label>
                    <input
                      className="form-control"
                      placeholder="Ej: 60% para el barbero o $1.800.000/mes"
                      value={form.condicionEconomica}
                      onChange={(e) => set('condicionEconomica', e.target.value)}
                    />
                    {errores.condicionEconomica && (
                      <div style={{ color: 'var(--cobre-light)', fontSize: '0.78rem', marginTop: 4 }}>
                        {errores.condicionEconomica}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 2 ── */}
            {paso === 2 && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: 20 }}>
                  Detalles del puesto
                </h3>

                {/* Horario — fila completa */}
                <div className="form-group">
                  <label className="form-label">Horario laboral *</label>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 10 }}>
                    Selecciona los días y ajusta el horario de cada uno individualmente.
                  </div>

                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((dia) => {
                    const diasLaborales = form.diasLaborales || [];
                    const activo = diasLaborales.includes(dia);
                    const horasDia = form.horasPorDia?.[dia] || { entrada: '09:00', salida: '18:00' };

                    return (
                      <div
                        key={dia}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 14px', marginBottom: 6,
                          borderRadius: 10, border: '1.5px solid',
                          borderColor: activo ? 'var(--gold)' : 'var(--border)',
                          background: activo ? 'rgba(230,184,106,0.06)' : 'var(--surface2)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const nuevos = activo
                              ? diasLaborales.filter((d) => d !== dia)
                              : [...diasLaborales, dia];
                            set('diasLaborales', nuevos);
                          }}
                          style={{
                            width: 44, height: 36, borderRadius: 8,
                            border: '1.5px solid',
                            borderColor: activo ? 'var(--gold)' : 'var(--border)',
                            background: activo ? 'rgba(230,184,106,0.15)' : 'transparent',
                            color: activo ? 'var(--gold)' : 'var(--muted)',
                            fontWeight: 700, fontSize: '0.78rem',
                            cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
                          }}
                        >
                          {dia}
                        </button>

                        {activo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                            <select
                              className="form-control"
                              style={{ flex: 1, padding: '7px 10px', fontSize: '0.85rem' }}
                              value={horasDia.entrada}
                              onChange={(e) => set('horasPorDia', {
                                ...form.horasPorDia,
                                [dia]: { ...horasDia, entrada: e.target.value },
                              })}
                            >
                              {['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00'].map((h) => (
                                <option key={h}>{h}</option>
                              ))}
                            </select>
                            <span style={{ color: 'var(--muted)', fontSize: '0.8rem', flexShrink: 0 }}>→</span>
                            <select
                              className="form-control"
                              style={{ flex: 1, padding: '7px 10px', fontSize: '0.85rem' }}
                              value={horasDia.salida}
                              onChange={(e) => set('horasPorDia', {
                                ...form.horasPorDia,
                                [dia]: { ...horasDia, salida: e.target.value },
                              })}
                            >
                              {['12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map((h) => (
                                <option key={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', flex: 1 }}>
                            Día libre
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {errores.horario && (
                    <div style={{ color: 'var(--cobre-light)', fontSize: '0.78rem', marginTop: 4 }}>
                      {errores.horario}
                    </div>
                  )}
                </div>

                {/* Vacantes + Experiencia + Fecha — fila de 3 columnas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 4 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Vacantes</label>
                    <input
                      type="number"
                      className="form-control"
                      min={1} max={10}
                      value={form.vacantes}
                      onChange={(e) => set('vacantes', Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Experiencia requerida *</label>
                    <select
                      className="form-control"
                      value={form.experienciaRequerida}
                      onChange={(e) => set('experienciaRequerida', e.target.value)}
                    >
                      <option value="">Selecciona...</option>
                      {EXPERIENCIA_OPCIONES.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    {errores.experienciaRequerida && (
                      <div style={{ color: 'var(--cobre-light)', fontSize: '0.78rem', marginTop: 4 }}>
                        {errores.experienciaRequerida}
                      </div>
                    )}
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Fecha límite (opcional)</label>
                    <input
                      type="date"
                      className="form-control"
                      value={form.fechaLimite}
                      onChange={(e) => set('fechaLimite', e.target.value)}
                    />
                  </div>
                </div>

                {/* Especialidades — fila completa */}
                <div className="form-group" style={{ marginTop: 20 }}>
                  <label className="form-label">
                    Especialidades buscadas *{' '}
                    <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem' }}>
                      (máx. 5)
                    </span>
                  </label>
                  <SelectorTags
                    opciones={ESPECIALIDADES_TAGS}
                    seleccionados={form.especialidadesBuscadas}
                    onChange={(v) => set('especialidadesBuscadas', v)}
                  />
                  {errores.especialidadesBuscadas && (
                    <div style={{ color: 'var(--cobre-light)', fontSize: '0.78rem', marginTop: 6 }}>
                      {errores.especialidadesBuscadas}
                    </div>
                  )}
                </div>

                {/* Herramientas — fila completa */}
                <div
                  onClick={() => set('herramientasPropias', !form.herramientasPropias)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    background: form.herramientasPropias ? 'rgba(230,184,106,0.08)' : 'var(--surface2)',
                    border: '1.5px solid',
                    borderColor: form.herramientasPropias ? 'var(--gold)' : 'var(--border)',
                    borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 4,
                    border: '2px solid',
                    borderColor: form.herramientasPropias ? 'var(--gold)' : 'var(--border)',
                    background: form.herramientasPropias ? 'var(--gold)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', color: '#000', flexShrink: 0, transition: 'all 0.2s',
                  }}>
                    {form.herramientasPropias ? '✓' : ''}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                      🔧 El barbero debe tener herramientas propias
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                      Máquina, tijeras, kit completo
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 3 — Resumen ── */}
            {paso === 3 && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: 20 }}>
                  Revisa tu oferta antes de publicar
                </h3>

                <div style={{
                  background: 'var(--surface2)',
                  borderRadius: 12, padding: '20px 24px', marginBottom: 20,
                }}>
                  {/* Título */}
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>
                    {form.titulo}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 16 }}>
                    BarberShop Style
                  </div>

                  {/* Info clave en chips */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                    <span className="badge badge-gold">💼 {labelContratacion(form.tipoContratacion)}</span>
                    <span className="badge badge-gold">💰 {form.condicionEconomica}</span>
                    <span className="badge badge-muted">⏰ {form.horario}</span>
                    <span className="badge badge-muted">👥 {form.vacantes} vacante{form.vacantes !== 1 ? 's' : ''}</span>
                    <span className="badge badge-muted">🎯 {labelExperiencia(form.experienciaRequerida)}</span>
                    {form.herramientasPropias && <span className="badge badge-muted">🔧 Herramientas requeridas</span>}
                    {form.fechaLimite && <span className="badge badge-muted">📅 Límite: {form.fechaLimite}</span>}
                  </div>

                  {/* Descripción */}
                  {form.descripcion && (
                    <div style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 16 }}>
                      {form.descripcion}
                    </div>
                  )}

                  {/* Especialidades */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {form.especialidadesBuscadas.map((e) => (
                      <span key={e} className="badge badge-gold">{e}</span>
                    ))}
                  </div>
                </div>

                {publicadaOk && (
                  <div className="alert alert-success" style={{ marginBottom: 16 }}>
                    ✅ ¡Oferta publicada correctamente!
                  </div>
                )}
              </div>
            )}

            {/* ── Botones de navegación ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (paso === 1) { setModoNueva(false); setErrores({}); }
                  else setPaso((p) => p - 1);
                }}
              >
                {paso === 1 ? '✕ Cancelar' : '← Anterior'}
              </button>

              {paso < 3 ? (
                <button className="btn btn-primary" onClick={handleSiguiente}>
                  Siguiente →
                </button>
              ) : (
                <button
                  className="btn btn-success btn-lg"
                  onClick={handlePublicar}
                  disabled={publicadaOk}
                >
                  📋 Publicar oferta
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Lista de ofertas ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ofertas.length === 0 ? (
            <div className="alert alert-info">No tienes ofertas publicadas aún.</div>
          ) : (
            ofertas.map((o) => (
              <CardOferta
                key={o.id}
                oferta={o}
                aplicaciones={aplicaciones}
                onCerrar={handleCerrar}
              />
            ))
          )}
        </div>

      </main>
    </div>
  );
}