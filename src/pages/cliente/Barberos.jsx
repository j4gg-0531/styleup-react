// src/pages/cliente/Barberos.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { barberosService } from '../../services/barberosService.js';
import Estrellas from '../../components/Estrellas.jsx';

// Especialidades disponibles para el filtro
// FUTURO: vendrán de /api/especialidades
const ESPECIALIDADES = [
  { value: '', label: 'Todas las especialidades' },
  { value: 'Corte a tijera',    label: 'Corte a tijera' },
  { value: 'Afeitado / Fade',   label: 'Afeitado / Fade' },
  { value: 'Diseño / Undercut', label: 'Diseño / Undercut' },
];

export default function Barberos() {
  const navigate = useNavigate();
  const [barberos] = useState(() => barberosService.getTodos());
  const [busqueda, setBusqueda]             = useState('');
  const [especialidadFiltro, setEspecialidadFiltro] = useState('');

  // Filtra por nombre, ID y especialidad
  // FUTURO: /api/barberos?q=busqueda&especialidad=filtro
  const barberosFiltrados = barberos.filter((b) => {
    const coincideBusqueda =
      `${b.nombre} ${b.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      b.id.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEspecialidad =
      especialidadFiltro === '' ||
      b.especialidad === especialidadFiltro;

    return coincideBusqueda && coincideEspecialidad;
  });

  const navItems = [
    { icon: '🏠', label: 'Dashboard',        href: '/cliente' },
    { icon: '💈', label: 'Barberos',          href: '/cliente/barberos' },
    { icon: '📖', label: 'Mi historial',      href: '/cliente/historial' },
    { icon: '✏️', label: 'Mi perfil',         href: '/cliente/perfil' },
    { icon: '📱', label: 'Vincular Telegram', href: '/cliente/telegram' },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar="👤" badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">💈 Nuestros barberos</h2>
          <p className="page-subtitle">Elige tu barbero y agenda tu cita</p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
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
        </div>

        {/* Lista de barberos */}
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
                  <div
                    className="barbero-avatar"
                    style={{ fontSize: '1.8rem', flexShrink: 0 }}
                  >
                    {b.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 700 }}>
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
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/cliente/barberos/${b.id}`);
                    }}
                  >
                    Ver perfil y agendar →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}