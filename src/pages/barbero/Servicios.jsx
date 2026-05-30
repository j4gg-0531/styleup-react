// src/pages/barbero/Servicios.jsx
// (antes Precios.jsx — renombrado a Mis Servicios)
//
// El barbero independiente puede:
//   - Activar / desactivar cada servicio
//   - Editar el precio (respetando el mínimo del sistema)
//   - Editar la duración en minutos
//
// El barbero que trabaja en una barbería NO puede editar nada:
//   los servicios los gestiona la barbería donde trabaja.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import {
  preciosService,
  PRECIOS_MINIMOS,
  NOMBRES_SERVICIOS,
  DURACIONES_DEFAULT,
  ICONOS_SERVICIOS,
} from '../../services/preciosService.js';
import { barberiaService } from '../../services/barberiaService.js';
import { barberosService } from '../../services/barberosService.js';

// Duraciones válidas (cada 5 min, de 10 a 120)
const OPCIONES_DURACION = Array.from({ length: 23 }, (_, i) => (i + 2) * 5); // 10,15,...,120

const navItems = [
  { icon: '🏠', label: 'Dashboard',     href: '/barbero' },
  { icon: '⏰', label: 'Mis horarios',  href: '/barbero/horarios' },
  { icon: '✂',  label: 'Mis servicios', href: '/barbero/precios' },
  { icon: '📋', label: 'Ofertas',       href: '/barbero/ofertas' },
  { icon: '📖', label: 'Historial',     href: '/barbero/historial' },
  { icon: '📊', label: 'Reportes',      href: '/barbero/reportes' },
];

const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

// ── Formatos ──────────────────────────────────────────────────────────────
const fmtPrecio = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export default function Servicios() {
  const { user } = useAuth();

  // ¿El barbero trabaja en una barbería? Si sí, modo solo lectura
  const barberoActual = barberosService.getTodos().find(
    (b) => b.nombre?.toLowerCase() === user?.nombre?.toLowerCase()
  );
  const barberia = barberiaService.getTodas().find(
    (b) => b.barberoIds?.includes(barberoActual?.id)
  ) ?? null;
  const soloLectura = !!barberia;

  // ── Estado inicial ────────────────────────────────────────────────────
  const initState = () => {
    const preciosGuardados = preciosService.getPreciosByBarbero(user?.nombre || '');
    const configGuardada   = preciosService.getConfigServicios(user?.nombre || '');

    return Object.keys(NOMBRES_SERVICIOS).reduce((acc, id) => {
      acc[id] = {
        precio:   preciosGuardados[id]        || PRECIOS_MINIMOS[id],
        duracion: configGuardada[id]?.duracion ?? DURACIONES_DEFAULT[id],
        activo:   configGuardada[id]?.activo  !== false, // true por defecto
      };
      return acc;
    }, {});
  };

  const [servicios, setServicios] = useState(initState);
  const [editando, setEditando]   = useState(null); // id del servicio en edición
  const [guardadoOk, setGuardadoOk]     = useState(false);
  const [guardadoError, setGuardadoError] = useState('');

  // ── Helpers de edición ────────────────────────────────────────────────
  const setField = (id, campo, valor) =>
    setServicios((prev) => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor },
    }));

  const toggleActivo = (id) => {
    if (soloLectura) return;
    setServicios((prev) => ({
      ...prev,
      [id]: { ...prev[id], activo: !prev[id].activo },
    }));
  };

  // ── Guardar ───────────────────────────────────────────────────────────
  const handleGuardar = () => {
    if (soloLectura) return;

    // Validar precios mínimos solo en servicios activos
    const invalidos = Object.entries(servicios).filter(
      ([id, s]) => s.activo && Number(s.precio) < PRECIOS_MINIMOS[id]
    );
    if (invalidos.length > 0) {
      setGuardadoError('Hay precios por debajo del mínimo permitido.');
      return;
    }

    // Guardar precios (solo activos)
    const preciosActivos = {};
    Object.entries(servicios).forEach(([id, s]) => {
      if (s.activo) preciosActivos[id] = s.precio;
    });
    preciosService.guardarPreciosBarbero(user.nombre, preciosActivos);

    // Guardar config (duración + activo)
    const config = {};
    Object.entries(servicios).forEach(([id, s]) => {
      config[id] = { duracion: Number(s.duracion), activo: s.activo };
    });
    preciosService.guardarConfigServicios(user.nombre, config);

    setGuardadoError('');
    setEditando(null);
    setGuardadoOk(true);
    setTimeout(() => setGuardadoOk(false), 3000);
  };

  // ── Stats del resumen ─────────────────────────────────────────────────
  const activos       = Object.values(servicios).filter((s) => s.activo);
  const preciosActivos = activos.map((s) => Number(s.precio));
  const precioMin      = preciosActivos.length ? Math.min(...preciosActivos) : 0;
  const precioMax      = preciosActivos.length ? Math.max(...preciosActivos) : 0;

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">

        {/* ── Cabecera ── */}
        <div className="page-header" style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h2 className="page-title">✂ Mis servicios</h2>
            <p className="page-subtitle">
              {soloLectura
                ? `Los servicios los gestiona ${barberia.nombre}. Contacta a tu barbería para cambios.`
                : 'Activa, desactiva y configura el precio y duración de cada servicio.'}
            </p>
          </div>
        </div>

        {/* Aviso modo solo lectura */}
        {soloLectura && (
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            🏪 Trabajas en <strong>{barberia.nombre}</strong>. Solo la barbería puede
            modificar los servicios, precios y horarios.
          </div>
        )}

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

        {/* ── Stats rápidas ── */}
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

        {/* ── Tabla de servicios ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

          {/* Encabezado de columnas */}
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

          {/* Filas */}
          {Object.entries(NOMBRES_SERVICIOS).map(([id, nombre], idx, arr) => {
            const s          = servicios[id];
            const esEditando = editando === id;
            const minimo     = PRECIOS_MINIMOS[id];
            const bajoDeMini = s.activo && Number(s.precio) < minimo;
            const esUltimo   = idx === arr.length - 1;
            const esDomicilio = id === 'E009';

            return (
              <div key={id}>
                {/* Separador visual antes del Domicilio */}
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

                  {/* Fila principal */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 110px 150px 120px 44px',
                    gap: 0,
                    padding: '14px 20px',
                    alignItems: 'center',
                  }}>

                    {/* ── Nombre + icono ── */}
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

                    {/* ── Duración ── */}
                    <div style={{ textAlign: 'center' }}>
                      {esEditando && !soloLectura ? (
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

                    {/* ── Precio ── */}
                    <div style={{ textAlign: 'right' }}>
                      {esEditando && !soloLectura ? (
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

                    {/* ── Toggle activo ── */}
                    <div style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => toggleActivo(id)}
                        disabled={soloLectura}
                        title={s.activo ? 'Desactivar servicio' : 'Activar servicio'}
                        style={{
                          width: 46, height: 26,
                          borderRadius: 13,
                          border: 'none', cursor: soloLectura ? 'not-allowed' : 'pointer',
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

                    {/* ── Botón editar ── */}
                    <div style={{ textAlign: 'center' }}>
                      {!soloLectura && (
                        <button
                          onClick={() => setEditando(esEditando ? null : id)}
                          className={esEditando ? 'btn btn-success btn-sm' : 'btn btn-ghost btn-sm'}
                          style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                          title={esEditando ? 'Listo' : 'Editar'}
                        >
                          {esEditando ? '✓' : '✏️'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Barra visual precio vs mínimo — solo en modo vista */}
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

        {/* ── Pie de página ── */}
        {!soloLectura && (
          <div style={{
            marginTop: 20, padding: '16px 20px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              💡 Los cambios no se guardan hasta que presiones el botón.
              Los servicios desactivados no aparecerán en tu perfil público.
            </div>
            <button className="btn btn-primary" onClick={handleGuardar}>
              💾 Guardar cambios
            </button>
          </div>
        )}
      </main>
    </div>
  );
}