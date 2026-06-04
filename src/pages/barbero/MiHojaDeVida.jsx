import { useState, useRef } from 'react';
import { Home, Clock, Scissors, ClipboardList, BookOpen, BarChart3, Bell, FileText, Save, Printer, Plus, Trash2, X, GraduationCap, Award, Wrench, Check, Briefcase, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { cvService } from '../../services/cvService.js';
import { ESPECIALIDADES_TAGS, NIVEL_PROFESIONAL, DISPONIBILIDAD_OPCIONES, MODALIDAD_OPCIONES } from '../../services/ofertasConfig.js';
import CVPreviewModal from '../../components/cv/CVPreviewModal.jsx';

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

function SelectorTags({ opciones, seleccionados, onChange, max = 6 }) {
  const toggle = (tag) => {
    if (seleccionados.includes(tag)) {
      onChange(seleccionados.filter((t) => t !== tag));
    } else if (seleccionados.length < max) {
      onChange([...seleccionados, tag]);
    }
  };
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {opciones.map((tag) => {
        const sel = seleccionados.includes(tag);
        return (
          <span key={tag}
            onClick={() => toggle(tag)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: '0.82rem',
              fontWeight: 600, cursor: 'pointer', userSelect: 'none',
              transition: 'all 0.2s',
              background: sel ? 'rgba(230,184,106,0.15)' : 'var(--surface2)',
              color: sel ? 'var(--gold)' : 'var(--text)',
              border: `1.5px solid ${sel ? 'var(--gold)' : 'var(--border)'}`,
              opacity: !sel && seleccionados.length >= max ? 0.4 : 1,
            }}>
            {tag}
          </span>
        );
      })}
    </div>
  );
}

function SeccionHeader({ num, titulo }) {
  return (
    <div style={{
      fontSize: '0.72rem', color: 'var(--gold)', fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 12, marginTop: 24,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {num} · {titulo}
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

export default function MiHojaDeVida() {
  const { user } = useAuth();
  const [cv, setCv] = useState(() => cvService.getCV(user?.nombre));
  const [guardado, setGuardado] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  const setField = (campo, valor) => {
    setCv((prev) => ({ ...prev, [campo]: valor }));
    setIsDirty(true);
  };

  const handleGuardar = () => {
    cvService.guardarCV(user?.nombre, cv);
    setGuardado(true);
    setIsDirty(false);
    setTimeout(() => setGuardado(false), 2000);
  };

  // ── Experiencia laboral ──
  const setExp = (i, campo, valor) => {
    const arr = [...cv.experienciaLaboral];
    arr[i] = { ...arr[i], [campo]: valor };
    setField('experienciaLaboral', arr);
  };
  const agregarExp = () => setField('experienciaLaboral', [...cv.experienciaLaboral, { lugar: '', cargo: '', desde: '', hasta: '', descripcion: '' }]);
  const eliminarExp = (i) => setField('experienciaLaboral', cv.experienciaLaboral.filter((_, j) => j !== i));

  // ── Certificados ──
  const setCert = (i, campo, valor) => {
    const arr = [...cv.certificados];
    arr[i] = { ...arr[i], [campo]: valor };
    setField('certificados', arr);
  };
  const agregarCert = () => setField('certificados', [...cv.certificados, { nombre: '', institucion: '', anio: '', imagen: null }]);

  const handleSubirImagenCert = async (i, file) => {
    if (!file) return;
    const base64 = await cvService.procesarImagen(file, 800, 0.7);
    setCert(i, 'imagen', base64);
  };
  const eliminarCert = (i) => setField('certificados', cv.certificados.filter((_, j) => j !== i));

  // ── Reconocimientos ──
  const setRec = (i, campo, valor) => {
    const arr = [...cv.reconocimientos];
    arr[i] = { ...arr[i], [campo]: valor };
    setField('reconocimientos', arr);
  };
  const agregarRec = () => setField('reconocimientos', [...cv.reconocimientos, { titulo: '', institucion: '', fecha: '', descripcion: '', imagen: null }]);
  const eliminarRec = (i) => setField('reconocimientos', cv.reconocimientos.filter((_, j) => j !== i));

  const handleSubirImagen = async (i, file) => {
    if (!file) return;
    const base64 = await cvService.procesarImagen(file, 800, 0.7);
    setRec(i, 'imagen', base64);
  };

  // ── PDF ──
  const handlePDF = () => {
    cvService.guardarCV(user?.nombre, cv);
    setIsDirty(false);
    setShowPdfModal(true);
  };

  return (
    <div className="app-layout">
      <Sidebar avatar={<Scissors size={20} />} badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content" style={{ maxWidth: 720 }}>
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={22} /> Mi Hoja de Vida</h2>
            <p className="page-subtitle">Tu hoja de vida profesional. Guárdala una vez y úsala en todas tus postulaciones.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" onClick={handlePDF}>
              <Printer size={16} /> PDF
            </button>
            <button className="btn btn-primary" onClick={handleGuardar} disabled={!isDirty}>
              <Save size={16} /> {guardado ? '¡Guardado!' : 'Guardar CV'}
            </button>
          </div>
        </div>

        {/* ── Sección 1: Presentación ── */}
        <SeccionHeader num="1" titulo="Presentación" />
        <div className="form-group">
          <label className="form-label">Presentación profesional</label>
          <textarea className="form-control" rows={3} placeholder="Ej: Barbero con experiencia en cortes clásicos y degradados..."
            value={cv.presentacion} onChange={(e) => setField('presentacion', e.target.value)}
            style={{ resize: 'vertical' }} />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Nivel profesional</label>
            <select className="form-control" value={cv.nivel}
              onChange={(e) => setField('nivel', e.target.value)}>
              <option value="">Selecciona...</option>
              {NIVEL_PROFESIONAL.map((n) => (
                <option key={n.value} value={n.label}>{n.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Años de experiencia</label>
            <input className="form-control" placeholder="Ej: 3 años en BarberShop X"
              value={cv.anosExperiencia} onChange={(e) => setField('anosExperiencia', e.target.value)} />
          </div>
        </div>

        {/* ── Sección 2: Especialidades ── */}
        <SeccionHeader num="2" titulo="Especialidades" />
        <div className="form-group">
          <label className="form-label">
            Mis especialidades
            <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.75rem', marginLeft: 6 }}>(máx. 6)</span>
          </label>
          <SelectorTags opciones={ESPECIALIDADES_TAGS} seleccionados={cv.especialidades}
            onChange={(v) => setField('especialidades', v)} />
        </div>

        {/* ── Sección 3: Disponibilidad ── */}
        <SeccionHeader num="3" titulo="Disponibilidad" />
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Disponibilidad</label>
            <select className="form-control" value={cv.disponibilidad}
              onChange={(e) => setField('disponibilidad', e.target.value)}>
              <option value="">Selecciona...</option>
              {DISPONIBILIDAD_OPCIONES.map((o) => (
                <option key={o.value} value={o.label}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Modalidad preferida</label>
            <select className="form-control" value={cv.modalidad}
              onChange={(e) => setField('modalidad', e.target.value)}>
              <option value="">Selecciona...</option>
              {MODALIDAD_OPCIONES.map((o) => (
                <option key={o.value} value={o.label}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div onClick={() => setField('herramientasPropias', !cv.herramientasPropias)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 4,
            background: cv.herramientasPropias ? 'rgba(230,184,106,0.08)' : 'var(--surface2)',
            border: '1.5px solid', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
            borderColor: cv.herramientasPropias ? 'var(--gold)' : 'var(--border)',
          }}>
          <div style={{
            width: 20, height: 20, borderRadius: 4, border: '2px solid',
            borderColor: cv.herramientasPropias ? 'var(--gold)' : 'var(--border)',
            background: cv.herramientasPropias ? 'var(--gold)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {cv.herramientasPropias && <Check size={10} color="#000" />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}><Wrench size={14} /> Tengo mis propias herramientas</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>Máquina, tijeras, kit completo</div>
          </div>
        </div>

        {/* ── Sección 4: Experiencia laboral ── */}
        <SeccionHeader num="4" titulo="Experiencia laboral" />
        {cv.experienciaLaboral.map((exp, i) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, position: 'relative' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 10 }}>
              <Briefcase size={14} /> Experiencia {i + 1}
              {cv.experienciaLaboral.length > 1 && (
                <button onClick={() => eliminarExp(i)} style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--cobre-light)', cursor: 'pointer', fontSize: '0.72rem' }}>
                  <Trash2 size={12} /> Eliminar
                </button>
              )}
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Lugar</label>
                <input className="form-control" placeholder="Barbería o negocio" value={exp.lugar} onChange={(e) => setExp(i, 'lugar', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Cargo</label>
                <input className="form-control" placeholder="Ej: Barbero senior" value={exp.cargo} onChange={(e) => setExp(i, 'cargo', e.target.value)} />
              </div>
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Desde</label>
                <input className="form-control" placeholder="2022" value={exp.desde} onChange={(e) => setExp(i, 'desde', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Hasta</label>
                <input className="form-control" placeholder="2025 o vacío si es actual" value={exp.hasta} onChange={(e) => setExp(i, 'hasta', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Descripción</label>
              <textarea className="form-control" rows={2} placeholder="Breve descripción de tus funciones..." value={exp.descripcion} onChange={(e) => setExp(i, 'descripcion', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={agregarExp}>
          <Plus size={14} /> Agregar experiencia
        </button>

        {/* ── Sección 5: Certificados ── */}
        <SeccionHeader num="5" titulo="Certificados y cursos" />
        {cv.certificados.map((cert, i) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, position: 'relative' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 10 }}>
              <GraduationCap size={14} /> Certificado {i + 1}
              {cv.certificados.length > 1 && (
                <button onClick={() => eliminarCert(i)} style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--cobre-light)', cursor: 'pointer', fontSize: '0.72rem' }}>
                  <Trash2 size={12} /> Eliminar
                </button>
              )}
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Nombre del curso</label>
                <input className="form-control" placeholder="Ej: Curso de barbería profesional" value={cert.nombre} onChange={(e) => setCert(i, 'nombre', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Institución</label>
                <input className="form-control" placeholder="Ej: SENA" value={cert.institucion} onChange={(e) => setCert(i, 'institucion', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Año</label>
              <input className="form-control" placeholder="Ej: 2024" value={cert.anio} onChange={(e) => setCert(i, 'anio', e.target.value)} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label className="form-label">Imagen del certificado (opcional)</label>
              {cert.imagen ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <img src={cert.imagen} alt="certificado"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Imagen adjunta</span>
                  <button onClick={() => setCert(i, 'imagen', null)}
                    style={{ background: 'none', border: 'none', color: 'var(--cobre-light)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={12} /> Quitar
                  </button>
                </div>
              ) : (
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4,
                  padding: '8px 14px', borderRadius: 8, border: '1px dashed var(--border)',
                  cursor: 'pointer', fontSize: '0.82rem', color: 'var(--muted)',
                }}>
                  <ImageIcon size={14} /> Subir imagen
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => handleSubirImagenCert(i, e.target.files?.[0])} />
                </label>
              )}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={agregarCert}>
          <Plus size={14} /> Agregar certificado
        </button>

        {/* ── Sección 6: Reconocimientos ── */}
        <SeccionHeader num="6" titulo="Reconocimientos" />
        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 12 }}>
          Premios, diplomas, certificaciones especiales. Puedes subir una foto de cada reconocimiento.
        </div>
        {cv.reconocimientos.map((rec, i) => (
          <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px 16px', marginBottom: 10, position: 'relative' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 10 }}>
              <Award size={14} /> Reconocimiento {i + 1}
              {cv.reconocimientos.length > 1 && (
                <button onClick={() => eliminarRec(i)} style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--cobre-light)', cursor: 'pointer', fontSize: '0.72rem' }}>
                  <Trash2 size={12} /> Eliminar
                </button>
              )}
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Título</label>
                <input className="form-control" placeholder="Ej: 1er lugar concurso de fades" value={rec.titulo} onChange={(e) => setRec(i, 'titulo', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Institución / Evento</label>
                <input className="form-control" placeholder="Ej: ExpoBarber 2025" value={rec.institucion} onChange={(e) => setRec(i, 'institucion', e.target.value)} />
              </div>
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Fecha</label>
                <input className="form-control" placeholder="2025" value={rec.fecha} onChange={(e) => setRec(i, 'fecha', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Descripción (opcional)</label>
                <input className="form-control" placeholder="Breve descripción" value={rec.descripcion} onChange={(e) => setRec(i, 'descripcion', e.target.value)} />
              </div>
            </div>
            {/* Subir imagen del reconocimiento */}
            <div style={{ marginTop: 8 }}>
              <label className="form-label">Imagen del certificado / premio</label>
              {rec.imagen ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                  <img src={rec.imagen} alt="certificado"
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Imagen adjunta</span>
                  <button onClick={() => setRec(i, 'imagen', null)}
                    style={{ background: 'none', border: 'none', color: 'var(--cobre-light)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <X size={12} /> Quitar
                  </button>
                </div>
              ) : (
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4,
                  padding: '8px 14px', borderRadius: 8, border: '1px dashed var(--border)',
                  cursor: 'pointer', fontSize: '0.82rem', color: 'var(--muted)',
                  transition: 'all 0.2s',
                }}>
                  <ImageIcon size={14} /> Subir imagen
                  <input type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={(e) => handleSubirImagen(i, e.target.files?.[0])} />
                </label>
              )}
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-outline btn-sm" onClick={agregarRec} style={{ marginBottom: 16 }}>
          <Plus size={14} /> Agregar reconocimiento
        </button>

        {/* ── Sección 7: Mensaje ── */}
        <SeccionHeader num="7" titulo="Mensaje para la barbería" />
        <div className="form-group">
          <label className="form-label">Mensaje opcional (se incluirá en cada postulación)</label>
          <textarea className="form-control" rows={3} placeholder="Ej: Me apasiona el arte de la barbería y busco un lugar donde crecer profesionalmente..."
            value={cv.mensaje} onChange={(e) => setField('mensaje', e.target.value)}
            style={{ resize: 'vertical' }} />
        </div>

        {/* ── Botón guardar (abajo también) ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16, marginBottom: 40 }}>
          <button className="btn btn-outline" onClick={handlePDF}>
            <Printer size={16} /> Descargar PDF
          </button>
          <button className="btn btn-primary btn-lg" onClick={handleGuardar} disabled={!isDirty}>
            <Save size={16} /> {guardado ? '¡Guardado!' : 'Guardar CV'}
          </button>
        </div>
      </main>

      {showPdfModal && (
        <CVPreviewModal cv={cv} nombre={user?.nombre} onClose={() => setShowPdfModal(false)} />
      )}
    </div>
  );
}
