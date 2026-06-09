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

import { useState, useEffect } from 'react';
import { Home, Clock, Scissors, ClipboardList, BookOpen, BarChart3, Building2, Check, Pencil, Save, CheckCircle, Bell, FileText, AlertTriangle } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import {
  preciosService,
} from '../../services/preciosService.js';
import { serviciosService } from '../../services/serviciosService.js';
import { barberiaService } from '../../services/barberiaService.js';
import { barberosService } from '../../services/barberosService.js';

const OPCIONES_DURACION = Array.from({ length: 23 }, (_, i) => (i + 2) * 5);

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

const fmtPrecio = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export default function Servicios() {
  const { user } = useAuth();

  // ¿El barbero trabaja en una barbería? Si sí, modo solo lectura
  const [soloLectura, setSoloLectura] = useState(false);
  const [barberia, setBarberia] = useState(null);

  useEffect(() => {
    const fetchRelaciones = async () => {
      const [todosBarberos, todasBarberias] = await Promise.all([
        barberosService.getTodos(),
        barberiaService.getTodas(),
      ]);
      const barberoActual = todosBarberos.find(
        (b) => b.nombre?.toLowerCase() === user?.nombre?.toLowerCase()
      );
      const barb = todasBarberias.find(
        (b) => b.barberoIds?.includes(barberoActual?.id)
      ) ?? null;
      setBarberia(barb);
      setSoloLectura(!!barb);
    };
    fetchRelaciones();
  }, [user?.nombre]);

  // ── Estado inicial ────────────────────────────────────────────────────
  const [servicios, setServicios] = useState(
    Object.entries(serviciosService.getAll()).reduce((acc, [id, svc]) => {
      acc[id] = { precio: serviciosService.getPrecioMinimo(id), duracion: svc.duracion, activo: true };
      return acc;
    }, {})
  );

  useEffect(() => {
    const fetchData = async () => {
      const [preciosGuardados, configGuardada] = await Promise.all([
        preciosService.getPreciosByBarbero(user?.nombre || ''),
        preciosService.getConfigServicios(user?.nombre || ''),
      ]);
      setServicios(
        Object.entries(serviciosService.getAll()).reduce((acc, [id, svc]) => {
          acc[id] = {
            precio: preciosGuardados[id] || serviciosService.getPrecioMinimo(id),
            duracion: configGuardada[id]?.duracion ?? svc.duracion,
            activo: configGuardada[id]?.activo !== false,
          };
          return acc;
        }, {})
      );
    };
    if (user?.nombre) fetchData();
  }, [user?.nombre]);
  const [editando, setEditando]   = useState(null);
  const [guardadoOk, setGuardadoOk]     = useState(false);
  const [guardadoError, setGuardadoError] = useState('');
  const [esMobile, setEsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setEsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  const handleGuardar = async () => {
    if (soloLectura) return;

    // Validar precios mínimos solo en servicios activos
    const invalidos = Object.entries(servicios).filter(
      ([id, s]) => s.activo && Number(s.precio) < serviciosService.getPrecioMinimo(id)
    );
    if (invalidos.length > 0) {
      setGuardadoError('Hay precios por debajo del mínimo permitido.');
      setTimeout(() => setGuardadoError(''), 3000);
      return;
    }

    // Guardar precios (solo activos)
    const preciosActivos = {};
    Object.entries(servicios).forEach(([id, s]) => {
      if (s.activo) preciosActivos[id] = s.precio;
    });
    await preciosService.guardarPreciosBarbero(user.nombre, preciosActivos);

    // Guardar config (duración + activo)
    const config = {};
    Object.entries(servicios).forEach(([id, s]) => {
      config[id] = { duracion: Number(s.duracion), activo: s.activo };
    });
    await preciosService.guardarConfigServicios(user.nombre, config);

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
      <Sidebar avatar={<Scissors size={20} />} badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">

        {/* ── Cabecera ── */}
        <div className="page-header" style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Scissors size={22} /> Mis servicios</h2>
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
            <Building2 size={16} /> Trabajas en <strong>{barberia.nombre}</strong>. Solo la barbería puede
            modificar los servicios, precios y horarios.
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

        {/* ── Servicios en cards ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: esMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 16,
            alignItems: 'stretch',
            padding: 16,
          }}>
          {Object.entries(serviciosService.getAll()).map(([id, svc]) => {
            const s          = servicios[id];
            const esEditando = editando === id;
            const minimo     = serviciosService.getPrecioMinimo(id);
            const bajoDeMini = s.activo && Number(s.precio) < minimo;

            return (
              <div key={id} style={{
                background: esEditando
                  ? 'rgba(230,184,106,0.04)'
                  : bajoDeMini ? 'rgba(192,57,43,0.04)' : 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '16px 18px',
                minHeight: 120,
                opacity: s.activo ? 1 : 0.45,
                transition: 'opacity 0.2s, background 0.2s',
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 48px',
                  gap: 12,
                  alignItems: 'center',
                }}>
                  {/* ── Izquierda: Nombre + min ── */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{svc.nombre}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
                      min {fmtPrecio(minimo)}
                    </div>
                  </div>

                  {/* ── Centro: Duración + Precio ── */}
                  <div style={{ textAlign: 'right' }}>
                    {esEditando && !soloLectura ? (
                      <div>
                        <select
                          className="form-control"
                          style={{ fontSize: '0.85rem', padding: '6px 8px', textAlign: 'center', width: '100%' }}
                          value={s.duracion}
                          onChange={(e) => setField(id, 'duracion', Number(e.target.value))}
                        >
                          {OPCIONES_DURACION.map((d) => (
                            <option key={d} value={d}>{d} min</option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
                          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.9rem' }}>$</span>
                          <input
                            type="number"
                            className="form-control"
                            style={{
                              width: 100, textAlign: 'right',
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
                      </div>
                    ) : (
                      <div>
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: '0.78rem', color: 'var(--muted)',
                          background: 'var(--surface2)', padding: '3px 8px', borderRadius: 6,
                          marginBottom: 4,
                        }}>
                          ⏱ {s.duracion} min
                        </div>
                        <div style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: '1.1rem', fontWeight: 700,
                          color: bajoDeMini ? 'var(--cobre-light)' : 'var(--gold)',
                        }}>
                          {fmtPrecio(s.precio)}
                        </div>
                        {bajoDeMini && (
                          <div style={{ fontSize: '0.65rem', color: 'var(--cobre-light)' }}>
                            <AlertTriangle size={12} /> Bajo el mínimo
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Derecha: Toggle + Editar ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
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
                    {!soloLectura && (
                      <button
                        onClick={() => setEditando(esEditando ? null : id)}
                        className={esEditando ? 'btn btn-success btn-sm' : 'btn btn-ghost btn-sm'}
                        style={{ padding: '5px 8px', fontSize: '0.8rem' }}
                        title={esEditando ? 'Listo' : 'Editar'}
                      >
                        {esEditando ? <Check size={14} /> : <Pencil size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>

        {/* ── Pie de página ── */}
        {!soloLectura && (
          <div style={{
            marginTop: 12, padding: '16px 20px',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', gap: 16,
            flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
              Los cambios no se guardan hasta que presiones el botón.
              Los servicios desactivados no aparecerán en tu perfil público.
            </div>
            <button className="btn btn-primary" onClick={handleGuardar}>
              <Save size={16} /> Guardar cambios
            </button>
          </div>
        )}

        {(guardadoOk || guardadoError) && (
          <div style={{
            position: 'fixed', bottom: 90, right: 24, zIndex: 9999,
            padding: '12px 20px', borderRadius: 10,
            background: guardadoOk
              ? 'rgba(46,160,67,0.95)'
              : 'rgba(192,57,43,0.95)',
            color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: '0.9rem', fontWeight: 600,
            animation: 'slideUp 0.25s ease',
          }}>
            {guardadoOk
              ? <CheckCircle size={18} />
              : <AlertTriangle size={18} />}
            {guardadoOk
              ? 'Servicios guardados correctamente.'
              : guardadoError}
          </div>
        )}
      </main>
    </div>
  );
}