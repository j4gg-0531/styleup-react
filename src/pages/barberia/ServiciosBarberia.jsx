// src/pages/barberia/ServiciosBarberia.jsx
//
// La barbería administra los precios y duraciones globales
// de todos los servicios que ofrece el negocio.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
  barberiaServiciosService,
  PRECIOS_MINIMOS,
  NOMBRES_SERVICIOS,
  DURACIONES_DEFAULT,
  ICONOS_SERVICIOS,
} from '../../services/barberiaServiciosService.js';

const OPCIONES_DURACION = Array.from({ length: 23 }, (_, i) => (i + 2) * 5);

const navItems = [
  { icon: '🏠', label: 'Dashboard',  href: '/barberia' },
  { icon: '💈', label: 'Barberos',   href: '/barberia/barberos' },
  { icon: '📋', label: 'Ofertas',    href: '/barberia/ofertas' },
  { icon: '⏰', label: 'Horarios',   href: '/barberia/horarios' },
  { icon: '✂️', label: 'Servicios',  href: '/barberia/servicios' },
  { icon: '📊', label: 'Reportes',   href: '/barberia/reportes' },
];

const fmtPrecio = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export default function ServiciosBarberia() {
  const [servicios, setServicios] = useState(() =>
    barberiaServiciosService.getServicios('BAR001')
  );
  const [editando, setEditando]       = useState(null);
  const [guardadoOk, setGuardadoOk]     = useState(false);
  const [guardadoError, setGuardadoError] = useState('');

  const setField = (id, campo, valor) =>
    setServicios((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));

  const toggleActivo = (id) => {
    setServicios((prev) => ({
      ...prev,
      [id]: { ...prev[id], activo: !prev[id].activo },
    }));
  };

  const handleGuardar = () => {
    const invalidos = Object.entries(servicios).filter(
      ([id, s]) => s.activo && Number(s.precio) < PRECIOS_MINIMOS[id]
    );
    if (invalidos.length > 0) {
      setGuardadoError('Hay precios por debajo del mínimo permitido.');
      return;
    }

    barberiaServiciosService.guardarServicios('BAR001', servicios);
    setGuardadoError('');
    setEditando(null);
    setGuardadoOk(true);
    setTimeout(() => setGuardadoOk(false), 3000);
  };

  const activos = Object.values(servicios).filter((s) => s.activo);
  const preciosActivos = activos.map((s) => Number(s.precio));
  const precioMin = preciosActivos.length ? Math.min(...preciosActivos) : 0;
  const precioMax = preciosActivos.length ? Math.max(...preciosActivos) : 0;

  return (
    <div className="app-layout">
      <Sidebar avatar="🏪" badge="Barbería" badgeClass="badge-cobre" navItems={navItems} />

      <main className="main-content">
        <div className="page-header" style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h2 className="page-title">✂️ Servicios</h2>
            <p className="page-subtitle">
              Administra los precios y tiempos de cada servicio de tu barbería.
              Estos valores se usarán como referencia para todos los barberos.
            </p>
          </div>
        </div>

        {guardadoError && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            {guardadoError}
          </div>
        )}
        {guardadoOk && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            ✅ Servicios guardados correctamente.
          </div>
        )}

        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--gold)', fontSize: '1.4rem' }}>
              {activos.length}
            </div>
            <div className="stat-label">Servicios activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#3fb950', fontSize: '1.4rem' }}>
              {precioMin ? fmtPrecio(precioMin) : '—'}
            </div>
            <div className="stat-label">Precio más bajo</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--cobre-light)', fontSize: '1.4rem' }}>
              {precioMax ? fmtPrecio(precioMax) : '—'}
            </div>
            <div className="stat-label">Precio más alto</div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 110px 150px 120px 44px',
            gap: 0,
            padding: '10px 20px',
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--border)',
            fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <span>Servicio</span>
            <span style={{ textAlign: 'center' }}>Duración</span>
            <span style={{ textAlign: 'right' }}>Precio</span>
            <span style={{ textAlign: 'center' }}>Estado</span>
            <span />
          </div>

          {Object.entries(NOMBRES_SERVICIOS).map(([id, nombre], idx, arr) => {
            const s = servicios[id];
            const esEditando = editando === id;
            const minimo = PRECIOS_MINIMOS[id];
            const bajoDeMini = s.activo && Number(s.precio) < minimo;
            const esUltimo = idx === arr.length - 1;
            const esDomicilio = id === 'E009';

            return (
              <div key={id}>
                {esDomicilio && (
                  <div style={{
                    padding: '8px 20px',
                    background: 'rgba(230,184,106,0.04)',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '0.72rem', color: 'var(--gold)',
                    fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.06em', display: 'flex',
                    alignItems: 'center', gap: 6,
                  }}>
                    🏠 Servicio especial
                  </div>
                )}

                <div style={{
                  borderBottom: esUltimo ? 'none' : '1px solid var(--border)',
                  opacity: s.activo ? 1 : 0.45,
                  transition: 'opacity 0.2s, background 0.2s',
                  background: esEditando
                    ? 'rgba(230,184,106,0.04)'
                    : bajoDeMini ? 'rgba(192,57,43,0.04)' : 'transparent',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 110px 150px 120px 44px',
                    gap: 0,
                    padding: '14px 20px',
                    alignItems: 'center',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                        background: s.activo
                          ? 'linear-gradient(135deg, var(--cobre), var(--cobre-light))'
                          : 'var(--surface2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem',
                        boxShadow: s.activo ? 'var(--shadow-red)' : 'none',
                        transition: 'all 0.2s',
                      }}>
                        {ICONOS_SERVICIOS[id]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{nombre}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
                          min {fmtPrecio(minimo)}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      {esEditando ? (
                        <select
                          className="form-control"
                          style={{ fontSize: '0.85rem', padding: '6px 8px', textAlign: 'center' }}
                          value={s.duracion}
                          onChange={(e) => setField(id, 'duracion', Number(e.target.value))}
                        >
                          {OPCIONES_DURACION.map((d) => (
                            <option key={d} value={d}>{d} min</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: '0.88rem', color: 'var(--text)',
                          background: 'var(--surface2)',
                          padding: '4px 10px', borderRadius: 6,
                        }}>
                          ⏱ {s.duracion} min
                        </span>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {esEditando ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.9rem' }}>$</span>
                          <input
                            type="number"
                            className="form-control"
                            style={{
                              width: 110, textAlign: 'right',
                              fontFamily: "'Playfair Display', serif",
                              fontSize: '1rem', fontWeight: 700,
                              padding: '6px 10px',
                            }}
                            value={s.precio}
                            min={minimo}
                            autoFocus
                            onChange={(e) => setField(id, 'precio', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditando(null)}
                          />
                        </div>
                      ) : (
                        <div>
                          <div style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '1.1rem', fontWeight: 700,
                            color: bajoDeMini ? 'var(--cobre-light)' : 'var(--gold)',
                          }}>
                            {fmtPrecio(s.precio)}
                          </div>
                          {bajoDeMini && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--cobre-light)' }}>
                              ⚠ Bajo el mínimo
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleActivo(id)}
                        title={s.activo ? 'Desactivar servicio' : 'Activar servicio'}
                        style={{
                          width: 46, height: 26,
                          borderRadius: 13,
                          border: 'none', cursor: 'pointer',
                          background: s.activo
                            ? 'linear-gradient(135deg, #2ea043, #3fb950)'
                            : 'var(--surface2)',
                          position: 'relative',
                          transition: 'background 0.25s',
                          boxShadow: s.activo ? '0 0 8px rgba(63,185,80,0.4)' : 'none',
                        }}
                      >
                        <span style={{
                          position: 'absolute', top: 3,
                          left: s.activo ? 23 : 3,
                          width: 20, height: 20, borderRadius: '50%',
                          background: '#fff',
                          transition: 'left 0.25s',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        }} />
                      </button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setEditando(esEditando ? null : id)}
                        className={esEditando ? 'btn btn-success btn-sm' : 'btn btn-ghost btn-sm'}
                        style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                        title={esEditando ? 'Listo' : 'Editar'}
                      >
                        {esEditando ? '✓' : '✏️'}
                      </button>
                    </div>
                  </div>

                  {!esEditando && s.activo && (
                    <div style={{ padding: '0 20px 12px', marginTop: -4 }}>
                      <div style={{
                        height: 3, background: 'var(--border)', borderRadius: 4,
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 4,
                          width: `${Math.min(((Number(s.precio) - minimo) / minimo) * 100 + 50, 100)}%`,
                          background: bajoDeMini
                            ? 'var(--cobre-light)'
                            : 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 20, padding: '16px 20px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            💡 Los cambios no se guardan hasta que presiones el botón.
            Los servicios desactivados no estarán disponibles para agendar.
          </div>
          <button className="btn btn-primary" onClick={handleGuardar}>
            💾 Guardar cambios
          </button>
        </div>
      </main>
    </div>
  );
}
