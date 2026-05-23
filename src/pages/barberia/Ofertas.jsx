// src/pages/barberia/Ofertas.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { barberiaService } from '../../services/barberiaService.js';

export default function Ofertas() {
  const [ofertas, setOfertas] = useState(() => barberiaService.getOfertas('BAR001'));
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', requisitos: '' });
  const [ok, setOk] = useState(false);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',  href: '/barberia' },
    { icon: '💈', label: 'Barberos',   href: '/barberia/barberos' },
    { icon: '📋', label: 'Ofertas',    href: '/barberia/ofertas' },
    { icon: '⏰', label: 'Horarios',   href: '/barberia/horarios' },
    { icon: '📊', label: 'Reportes',   href: '/barberia/reportes' },
    { icon: '✏️', label: 'Mi perfil',  href: '/barberia/perfil' },
  ];

  const handlePublicar = () => {
    if (!form.titulo || !form.descripcion) return;
    const nueva = barberiaService.crearOferta({
      barberia_id: 'BAR001',
      titulo: form.titulo,
      descripcion: form.descripcion,
      requisitos: form.requisitos.split(',').map((r) => r.trim()).filter(Boolean),
    });
    setOfertas((prev) => [...prev, nueva]);
    setForm({ titulo: '', descripcion: '', requisitos: '' });
    setMostrarForm(false);
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  };

  const handleCerrar = (id) => {
    barberiaService.cerrarOferta(id);
    setOfertas((prev) => prev.map((o) => o.id === id ? { ...o, estado: 'cerrada' } : o));
  };

  return (
    <div className="app-layout">
      <Sidebar avatar="🏪" badge="Barbería" badgeClass="badge-red" navItems={navItems} />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="page-title">📋 Ofertas de trabajo</h2>
            <p className="page-subtitle">Publica y gestiona ofertas para barberos</p>
          </div>
          <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? '✕ Cancelar' : '+ Nueva oferta'}
          </button>
        </div>

        {/* Formulario nueva oferta */}
        {mostrarForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title">Nueva oferta de trabajo</div>
            <div className="form-group">
              <label className="form-label">Título *</label>
              <input
                className="form-control"
                placeholder="Ej: Barbero especialista en degradados"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Descripción *</label>
              <textarea
                className="form-control"
                placeholder="Describe el perfil que buscas..."
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Requisitos (separados por coma)</label>
              <input
                className="form-control"
                placeholder="Ej: 2 años experiencia, conocimiento en fade"
                value={form.requisitos}
                onChange={(e) => setForm({ ...form, requisitos: e.target.value })}
              />
            </div>
            <button className="btn btn-primary" onClick={handlePublicar}>
              📋 Publicar oferta
            </button>
          </div>
        )}

        {ok && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ Oferta publicada correctamente.</div>}

        {/* Lista de ofertas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ofertas.length === 0 ? (
            <div className="alert alert-info">No tienes ofertas publicadas.</div>
          ) : (
            ofertas.map((o) => (
              <div key={o.id} className="card" style={{ padding: 22 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{o.titulo}</div>
                      <span className={`badge ${o.estado === 'activa' ? 'badge-green' : 'badge-muted'}`}>
                        {o.estado === 'activa' ? 'Activa' : 'Cerrada'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 10 }}>
                      {o.descripcion}
                    </div>
                    {o.requisitos?.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {o.requisitos.map((r, i) => (
                          <span key={i} className="badge badge-gold">{r}</span>
                        ))}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 8 }}>
                      📅 Publicada: {o.fecha}
                    </div>
                  </div>
                  {o.estado === 'activa' && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--red-light)', borderColor: 'var(--red-light)', flexShrink: 0 }}
                      onClick={() => handleCerrar(o.id)}
                    >
                      Cerrar oferta
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}