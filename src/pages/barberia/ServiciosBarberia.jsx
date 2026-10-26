// src/pages/barberia/ServiciosBarberia.jsx
//
// La barbería administra los precios y duraciones globales
// de todos los servicios que ofrece el negocio.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Home, Scissors, ClipboardList, Clock, BarChart3, Building2, Check, Pencil, Save, AlertTriangle, CheckCircle, Bell } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import {
  barberiaServiciosService,
} from '../../services/barberiaServiciosService.js';
import { serviciosService } from '../../services/serviciosService.js';

const OPCIONES_DURACION = Array.from({ length: 23 }, (_, i) => (i + 2) * 5);

const navItems = [
  { icon: <Home size={18} />, label: 'Dashboard',  href: '/barberia' },
  { icon: <Scissors size={18} />, label: 'Barberos',   href: '/barberia/barberos' },
  { icon: <ClipboardList size={18} />, label: 'Ofertas',    href: '/barberia/ofertas' },
  { icon: <Clock size={18} />, label: 'Horarios',   href: '/barberia/horarios' },
  { icon: <Scissors size={18} />, label: 'Servicios',  href: '/barberia/servicios' },
  { icon: <BarChart3 size={18} />, label: 'Reportes',   href: '/barberia/reportes' },
  { icon: <Bell size={18} />, label: 'Notificaciones', href: '/barberia/notificaciones', notificacionesBadge: true },
];

const fmtPrecio = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export default function ServiciosBarberia() {
  const { user } = useAuth();
  const barberiaId = user?.barberiaId;
  const [servicios, setServicios] = useState(
    Object.entries(serviciosService.getAll()).reduce((acc, [id, svc]) => {
      acc[id] = { precio: serviciosService.getPrecioMinimo(id), duracion: svc.duracion, activo: true };
      return acc;
    }, {})
  );

  useEffect(() => {
    if (!barberiaId) return;
    const fetchData = async () => {
      const data = await barberiaServiciosService.getServicios(barberiaId);
      setServicios(data);
    };
    fetchData();
  }, [barberiaId]);
  const [editando, setEditando]       = useState(null);
  const [guardadoOk, setGuardadoOk]     = useState(false);
  const [guardadoError, setGuardadoError] = useState('');
  const [esMobile, setEsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const actualizar = () => setEsMobile(window.innerWidth < 600);
    window.addEventListener('resize', actualizar);
    actualizar();
    return () => window.removeEventListener('resize', actualizar);
  }, []);

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

  const handleGuardar = async () => {
    const invalidos = Object.entries(servicios).filter(
      ([id, s]) => s.activo && Number(s.precio) < serviciosService.getPrecioMinimo(id)
    );
    if (invalidos.length > 0) {
      setGuardadoError('Hay precios por debajo del mínimo permitido.');
      setTimeout(() => setGuardadoError(''), 4000);
      return;
    }

    await barberiaServiciosService.guardarServicios(barberiaId, servicios);
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
      <Sidebar avatar={<Building2 size={20} />} badge="Barbería" badgeClass="badge-cobre" navItems={navItems} />

      <main className="main-content">
        <div className="page-header" style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Scissors size={22} /> Servicios</h2>
            <p className="page-subtitle">
              Administra los precios y tiempos de cada servicio de tu barbería.
              Estos valores se usarán como referencia para todos los barberos.
            </p>
          </div>
        </div>

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

        <div className="card" style={{ padding: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: esMobile ? '1fr' : '1fr 1fr',
            gap: 16,
          }}>
            {Object.entries(serviciosService.getAll()).map(([id, svc], idx, arr) => {
              const s = servicios[id];
              const esEditando = editando === id;
              const minimo = serviciosService.getPrecioMinimo(id);
              const bajoDeMini = s.activo && Number(s.precio) < minimo;
              const esDomicilio = id === 'E009';

              return (
                <div
                  key={id}
                  className="card-hover"
                  style={{
                    padding: 16,
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    background: esEditando
                      ? 'rgba(230,184,106,0.04)'
                      : bajoDeMini
                        ? 'rgba(192,57,43,0.04)'
                        : 'var(--surface)',
                    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                    opacity: s.activo ? 1 : 0.5,
                  }}
                >
                  {esDomicilio && (
                    <div style={{
                      marginBottom: 8,
                      fontSize: '0.72rem', color: 'var(--gold)',
                      fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.06em', display: 'flex',
                      alignItems: 'center', gap: 6,
                    }}>
                      <Home size={14} /> Servicio especial
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{svc.nombre}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
                        min {fmtPrecio(minimo)}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditando(esEditando ? null : id)}
                      className={esEditando ? 'btn btn-success btn-sm' : 'btn btn-ghost btn-sm'}
                      style={{ padding: '5px 8px', fontSize: '0.8rem', flexShrink: 0 }}
                      title={esEditando ? 'Listo' : 'Editar'}
                    >
                      {esEditando ? <Check size={14} /> : <Pencil size={14} />}
                    </button>
                  </div>

                  <div style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    flexWrap: 'wrap',
                  }}>

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

                    <div style={esMobile ? {} : { marginLeft: 'auto' }}>
                      {esEditando ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
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
                              <AlertTriangle size={12} /> Bajo el mínimo
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={esMobile ? { marginLeft: 0 } : { marginLeft: 'auto' }}>
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

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          marginTop: 20, padding: '16px 20px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            Los cambios no se guardan hasta que presiones el botón.
            Los servicios desactivados no estarán disponibles para agendar.
          </div>
          <button className="btn btn-primary" onClick={handleGuardar}>
            <Save size={16} /> Guardar cambios
          </button>
        </div>

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
