// src/pages/cliente/Barberos.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Scissors, BookOpen, Smartphone, User } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { barberosService } from '../../services/barberosService.js';
import Estrellas from '../../components/Estrellas.jsx';
import MapaVista from './MapaVista.jsx';
import { barberiaService } from '../../services/barberiaService.js';

// Necesario: importar el CSS de Leaflet una sola vez en el componente que usa el mapa
// Sin esto el mapa aparece sin estilos (tiles superpuestos, controles rotos)
import 'leaflet/dist/leaflet.css';

const ESPECIALIDADES = [
  { value: '', label: 'Todas las especialidades' },
  { value: 'Corte a tijera',    label: 'Corte a tijera' },
  { value: 'Afeitado / Fade',   label: 'Afeitado / Fade' },
  { value: 'Diseño / Undercut', label: 'Diseño / Undercut' },
];

export default function Barberos() {
  const navigate = useNavigate();
  const [barberos] = useState(() => barberosService.getTodos());
  const [busqueda, setBusqueda]                     = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState('');
  // 'lista' | 'mapa' — controla qué vista se muestra
  const [vista, setVista]                           = useState('lista');
  const [barberias] = useState(() => barberiaService.getParaMapa());
  const [barberiaModal, setBarberiaModal] = useState(null);

  const barberosDeBarberia = barberiaModal
    ? barberos.filter((b) => barberiaModal.barberoIds.includes(b.id))
    : [];

  useEffect(() => {
    if (!barberiaModal) return;
    const handler = (e) => { if (e.key === 'Escape') setBarberiaModal(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [barberiaModal]);

  const barberosFiltrados = barberos.filter((b) => {
    const coincideBusqueda =
      `${b.nombre} ${b.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.id.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEspecialidad =
      especialidadFiltro === '' || b.especialidad === especialidadFiltro;
    return coincideBusqueda && coincideEspecialidad;
  });

  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard',        href: '/cliente' },
    { icon: <Scissors size={18} />, label: 'Barberos',          href: '/cliente/barberos' },
    { icon: <BookOpen size={18} />, label: 'Mi historial',      href: '/cliente/historial' },
    { icon: <Smartphone size={18} />, label: 'Vincular Telegram', href: '/cliente/telegram' },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar={<User size={20} />} badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">💈 Nuestros barberos</h2>
          <p className="page-subtitle">Elige tu barbero y agenda tu cita</p>
        </div>

        {/* ── Barra de filtros + botón toggle ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o ID..."
            style={{ maxWidth: 300 }}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="form-control"
            style={{ maxWidth: 240 }}
            value={especialidadFiltro}
            onChange={(e) => setEspecialidadFiltro(e.target.value)}
          >
            {ESPECIALIDADES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
          {(busqueda || especialidadFiltro) && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setBusqueda(''); setEspecialidadFiltro(''); }}
            >
              ✕ Limpiar filtros
            </button>
          )}

          {/* Separador visual que empuja el toggle al extremo derecho */}
          <div style={{ flex: 1 }} />

          {/* ── Botón toggle Lista / Mapa ── */}
          <div style={{
            display: 'flex',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}>
            <button
              onClick={() => setVista('lista')}
              style={{
                padding: '8px 18px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s',
                // Activo = fondo rojo, inactivo = transparente
                background: vista === 'lista'
                  ? 'linear-gradient(135deg, var(--cobre), var(--cobre-light))'
                  : 'transparent',
                color: vista === 'lista' ? '#fff' : 'var(--muted)',
              }}
            >
              ☰ Lista
            </button>
            <button
              onClick={() => setVista('mapa')}
              style={{
                padding: '8px 18px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s',
                background: vista === 'mapa'
                  ? 'linear-gradient(135deg, var(--cobre), var(--cobre-light))'
                  : 'transparent',
                color: vista === 'mapa' ? '#fff' : 'var(--muted)',
              }}
            >
              🗺️ Mapa
            </button>
          </div>
        </div>

        {/* ── Vista LISTA (igual que antes) ── */}
        {vista === 'lista' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {barberosFiltrados.length === 0 ? (
              <div className="alert alert-info">
                No se encontraron barberos con esos criterios.
              </div>
            ) : (
              barberosFiltrados.map((b) => (
                <div
                  key={b.id}
                  className="card"
                  style={{ cursor: 'pointer', padding: 24 }}
                  onClick={() => navigate(`/cliente/barberos/${b.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div className="barbero-avatar" style={{ fontSize: '1.8rem', flexShrink: 0 }}>
                      {b.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <div style={{ fontFamily: "'Cinzel',serif", fontSize: '1.1rem', fontWeight: 700 }}>
                          {b.nombre} {b.apellido}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                          ID: {b.id}
                        </span>
                        <span className={`badge ${b.disponibleHoy ? 'badge-green' : 'badge-muted'}`}>
                          {b.disponibleHoy ? '● Disponible' : '● No disponible'}
                        </span>
                      </div>
                      <div style={{ color: 'var(--gold)', fontSize: '0.85rem', marginBottom: 8 }}>
                        ✂ {b.especialidad}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        <span>📍 {b.direccion}, {b.ciudad}</span>
                        <Estrellas calificacion={b.calificacion} total={b.totalCalificaciones} />
                        <span>📞 {b.telefono}</span>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Vista MAPA ── */}
        {vista === 'mapa' && (
          <MapaVista barberos={barberosFiltrados} barberias={barberias} onVerBarberos={setBarberiaModal} todosBarberos={barberos} />
        )}
        {/* ── Modal de barberos de barbería ── */}
        {barberiaModal && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20,
            }}
            onClick={() => setBarberiaModal(null)}
          >
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                maxWidth: 500, width: '100%',
                maxHeight: '80vh', overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '1.1rem' }}>
                    🏪 {barberiaModal.nombre}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
                    {barberiaModal.barberoIds.length > 0
                      ? `${barberiaModal.barberoIds.length} barbero${barberiaModal.barberoIds.length !== 1 ? 's' : ''}`
                      : 'Sin barberos'}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setBarberiaModal(null)}
                  style={{ fontSize: '1.1rem', lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: 16 }}>
                {barberosDeBarberia.length === 0 ? (
                  <div className="alert alert-info" style={{ margin: 0 }}>
                    Esta barbería aún no tiene barberos registrados.
                  </div>
                ) : (
                  barberosDeBarberia.map((b) => (
                    <div
                      key={b.id}
                      className="card"
                      style={{ cursor: 'pointer', padding: 16, marginBottom: 8 }}
                      onClick={() => { setBarberiaModal(null); navigate(`/cliente/barberos/${b.id}`); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{b.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {b.nombre} {b.apellido}
                          </div>
                          <div style={{ color: 'var(--gold)', fontSize: '0.8rem', marginTop: 2 }}>
                            ✂ {b.especialidad}
                          </div>
                          <div style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: 1 }}>
                            📍 {b.ciudad}
                          </div>
                        </div>
                        <span className={`badge ${b.disponibleHoy ? 'badge-green' : 'badge-muted'}`} style={{ flexShrink: 0 }}>
                          {b.disponibleHoy ? '● Disponible' : '● No disponible'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}