import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Award, GraduationCap, Briefcase, Scissors } from 'lucide-react';

export default function CVPreviewModal({ cv, nombre, onClose, showPrintButton = true }) {

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  const content = (
    <div className="cv-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}>
      <div className="cv-modal"
        style={{
          width: '100%', maxWidth: 800, maxHeight: '90vh',
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
        }}>

        {/* Header */}
        <div className="cv-modal-header no-print"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderBottom: '1px solid #d0d7de',
            background: '#f6f8fa',
          }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2328' }}>
            <Scissors size={16} /> Vista previa de hoja de vida
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {showPrintButton && (
              <button onClick={handlePrint}
                className="no-print"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#c97b3a', color: '#fff', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600,
                }}>
                <Printer size={16} /> Imprimir / Guardar PDF
              </button>
            )}
            <button onClick={onClose}
              className="no-print"
              style={{
                width: 36, height: 36, borderRadius: 8, border: '1px solid #d0d7de',
                background: '#fff', color: '#656d76', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Print area — SOLO esto se imprime */}
        <div id="print-area" style={{
          padding: '48px 56px', overflowY: 'auto', flex: 1,
          fontFamily: "'Inter', sans-serif", color: '#1f2328', background: '#fff',
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center', marginBottom: 32, paddingBottom: 24,
            borderBottom: '3px solid #c97b3a',
          }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#1f2328' }}>
              {nombre || 'Barbero'}
            </h1>
            <div style={{
              marginTop: 8, display: 'flex', justifyContent: 'center',
              gap: 6, fontSize: '0.85rem', color: '#656d76',
            }}>
              <Scissors size={16} /> StyleUp · Hoja de vida profesional
            </div>
          </div>

          {/* Presentación */}
          {cv.presentacion && (
            <div style={{ marginBottom: 24, fontSize: '0.92rem', lineHeight: 1.6, color: '#444' }}>
              {cv.presentacion}
            </div>
          )}

          {/* Info grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px',
            marginBottom: 24, padding: 20, background: '#f6f8fa', borderRadius: 8,
          }}>
            {cv.nivel && (
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#656d76', marginBottom: 2 }}>Nivel profesional</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f2328' }}>{cv.nivel}</div>
              </div>
            )}
            {cv.anosExperiencia && (
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#656d76', marginBottom: 2 }}>Experiencia</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f2328' }}>{cv.anosExperiencia}</div>
              </div>
            )}
            {cv.disponibilidad && (
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#656d76', marginBottom: 2 }}>Disponibilidad</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f2328' }}>{cv.disponibilidad}</div>
              </div>
            )}
            {cv.modalidad && (
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#656d76', marginBottom: 2 }}>Modalidad</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f2328' }}>{cv.modalidad}</div>
              </div>
            )}
            {cv.herramientasPropias && (
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#656d76', marginBottom: 2 }}>Herramientas</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f2328' }}>Tiene herramientas propias</div>
              </div>
            )}
          </div>

          {/* Especialidades */}
          {cv.especialidades?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={sectionTitleStyle}>Especialidades</h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {cv.especialidades.map((e) => (
                  <span key={e} style={{
                    padding: '3px 12px', borderRadius: 12, fontSize: '0.82rem', fontWeight: 600,
                    background: '#f6f8fa', border: '1px solid #d0d7de', color: '#1f2328',
                  }}>{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Experiencia laboral */}
          {cv.experienciaLaboral?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={sectionTitleStyle}><Briefcase size={16} /> Experiencia laboral</h2>
              {cv.experienciaLaboral.map((exp, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f2328' }}>{exp.cargo} — {exp.lugar}</div>
                  <div style={{ fontSize: '0.8rem', color: '#656d76', marginTop: 1 }}>{exp.desde}{exp.hasta ? ` — ${exp.hasta}` : ' — Presente'}</div>
                  {exp.descripcion && <div style={{ fontSize: '0.85rem', color: '#444', marginTop: 4 }}>{exp.descripcion}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Certificados */}
          {cv.certificados?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={sectionTitleStyle}><GraduationCap size={16} /> Certificados y cursos</h2>
              {cv.certificados.map((cert, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f2328' }}>{cert.nombre}</div>
                  <div style={{ fontSize: '0.8rem', color: '#656d76', marginTop: 1 }}>{cert.institucion}{cert.anio ? ` — ${cert.anio}` : ''}</div>
                  {cert.imagen && (
                    <img src={cert.imagen} alt={cert.nombre}
                      style={{ maxWidth: 300, maxHeight: 200, marginTop: 8, borderRadius: 4, border: '1px solid #d0d7de' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reconocimientos */}
          {cv.reconocimientos?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={sectionTitleStyle}><Award size={16} /> Reconocimientos</h2>
              {cv.reconocimientos.map((rec, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1f2328' }}>{rec.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: '#656d76', marginTop: 1 }}>{rec.institucion}{rec.fecha ? ` — ${rec.fecha}` : ''}</div>
                  {rec.descripcion && <div style={{ fontSize: '0.85rem', color: '#444', marginTop: 4 }}>{rec.descripcion}</div>}
                  {rec.imagen && (
                    <img src={rec.imagen} alt={rec.titulo}
                      style={{ maxWidth: 300, maxHeight: 200, marginTop: 8, borderRadius: 4, border: '1px solid #d0d7de' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Mensaje */}
          {cv.mensaje && (
            <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid #d0d7de' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#656d76', marginBottom: 4 }}>Mensaje para la barbería</div>
              <div style={{ fontSize: '0.92rem', color: '#444', fontStyle: 'italic' }}>{cv.mensaje}</div>
            </div>
          )}
        </div>

        {/* Print CSS */}
        <style>{`
          @page { margin: 20mm 15mm; }
          @media print {
            body > *:not(.cv-modal-overlay) { display: none !important; }
            .cv-modal-overlay {
              background: none !important; position: static !important;
              display: block !important; padding: 0 !important;
              align-items: flex-start; height: auto;
            }
            .cv-modal {
              box-shadow: none !important; border: none !important;
              max-height: none !important; border-radius: 0 !important;
            }
            .cv-modal-header, .no-print { display: none !important; }
            #print-area {
              overflow: visible !important; padding: 40px !important;
              max-height: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

const sectionTitleStyle = {
  fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.06em', color: '#c97b3a',
  marginBottom: 10, paddingBottom: 4,
  borderBottom: '1px solid #d0d7de',
  display: 'flex', alignItems: 'center', gap: 6,
};
