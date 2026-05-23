// src/pages/barbero/OfertasBarbero.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
//import { useAuth } from '../../context/useAuth.js';

// FUTURO: vendrán de /api/ofertas?estado=activa
const OFERTAS_DISPONIBLES = [
  {
    id: 'OF001',
    barberia: 'BarberShop Style',
    barberia_id: 'BAR001',
    titulo: 'Barbero especialista en degradados',
    descripcion: 'Buscamos barbero con experiencia en degradados y fade. Ofrecemos comisión del 60%.',
    requisitos: ['Mínimo 2 años de experiencia', 'Conocimiento en fade y degradado'],
    fecha: '2026-05-20',
    cuposDisponibles: 2,
  },
  {
    id: 'OF002',
    barberia: 'Classic Cuts',
    barberia_id: 'BAR002',
    titulo: 'Barbero para turno de tarde',
    descripcion: 'Necesitamos barbero para cubrir turno de 2pm a 8pm de lunes a sábado.',
    requisitos: ['Disponibilidad tarde', 'Experiencia en cortes clásicos'],
    fecha: '2026-05-18',
    cuposDisponibles: 1,
  },
  {
    id: 'OF003',
    barberia: 'Urban Barber',
    barberia_id: 'BAR003',
    titulo: 'Barbero independiente con local',
    descripcion: 'Ofrecemos puesto de trabajo equipado. Ideal para barbero que quiere empezar.',
    requisitos: ['Certificación en barbería', 'Actitud de servicio'],
    fecha: '2026-05-15',
    cuposDisponibles: 3,
  },
];

export default function OfertasBarbero() {
  // const { user } = useAuth();
  const [aplicaciones, setAplicaciones] = useState({});
  const [filtro, setFiltro] = useState('');

  const navItems = [
    { icon: '🏠', label: 'Dashboard',    href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios', href: '/barbero/horarios' },
    { icon: '📋', label: 'Ofertas',      href: '/barbero/ofertas' },
    { icon: '📖', label: 'Historial',    href: '/barbero/historial' },
    { icon: '💰', label: 'Mis precios',  href: '/barbero/precios' },
    { icon: '📊', label: 'Reportes',     href: '/barbero/reportes' },
    { icon: '✏️', label: 'Mi perfil',    href: '/barbero/perfil' },
  ];

  const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

  const ofertasFiltradas = OFERTAS_DISPONIBLES.filter((o) =>
    `${o.titulo} ${o.barberia}`.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleAplicar = (ofertaId) => {
    // FUTURO: POST /api/aplicaciones { oferta_id, barbero_id }
    setAplicaciones((prev) => ({ ...prev, [ofertaId]: 'pendiente' }));
  };

  const estadoAplicacion = {
    pendiente:  <span className="badge badge-gold">Aplicación enviada</span>,
    aceptada:   <span className="badge badge-green">Aceptada</span>,
    rechazada:  <span className="badge badge-muted">Rechazada</span>,
  };

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">📋 Ofertas de trabajo</h2>
          <p className="page-subtitle">Encuentra oportunidades en barberías de tu ciudad</p>
        </div>

        {/* Buscador */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por título o barbería..."
            style={{ maxWidth: 400 }}
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {/* Lista de ofertas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {ofertasFiltradas.length === 0 ? (
            <div className="alert alert-info">No se encontraron ofertas.</div>
          ) : (
            ofertasFiltradas.map((o) => (
              <div key={o.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{ fontSize: '1.5rem' }}>🏪</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{o.titulo}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--gold)' }}>{o.barberia}</div>
                      </div>
                    </div>

                    {/* Descripción */}
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 12 }}>
                      {o.descripcion}
                    </div>

                    {/* Requisitos */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {o.requisitos.map((r, i) => (
                        <span key={i} className="badge badge-gold">{r}</span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', gap: 16 }}>
                      <span>📅 Publicada: {o.fecha}</span>
                      <span style={{ color: o.cuposDisponibles > 0 ? '#2ecc71' : 'var(--muted)' }}>
                        👥 {o.cuposDisponibles} cupo{o.cuposDisponibles !== 1 ? 's' : ''} disponible{o.cuposDisponibles !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Acción */}
                  <div style={{ flexShrink: 0 }}>
                    {aplicaciones[o.id] ? (
                      estadoAplicacion[aplicaciones[o.id]]
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAplicar(o.id)}
                        disabled={o.cuposDisponibles === 0}
                      >
                        Aplicar →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}