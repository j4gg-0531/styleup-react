// src/pages/barbero/Precios.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { preciosService, PRECIOS_MINIMOS, NOMBRES_SERVICIOS } from '../../services/preciosService.js';

// Iconos y duración por servicio para las tarjetas
const SERVICIOS_INFO = {
  E001: { icon: '✂',  dur: '30 min' },
  E002: { icon: '💈', dur: '25 min' },
  E006: { icon: '🪒', dur: '20 min' },
  E008: { icon: '🧔', dur: '45 min' },
  E007: { icon: '🎨', dur: '40 min' },
  E004: { icon: '⚡', dur: '35 min' },
};

export default function Precios() {
  const { user } = useAuth();

  const getPreciosInicial = () => {
    if (!user?.nombre) return Object.keys(PRECIOS_MINIMOS).reduce(
      (acc, id) => ({ ...acc, [id]: PRECIOS_MINIMOS[id] }), {}
    );
    const guardados = preciosService.getPreciosByBarbero(user.nombre);
    return Object.keys(PRECIOS_MINIMOS).reduce(
      (acc, id) => ({ ...acc, [id]: guardados[id] || PRECIOS_MINIMOS[id] }), {}
    );
  };

  const [precios, setPrecios]         = useState(getPreciosInicial);
  const [preciosOk, setPreciosOk]     = useState(false);
  const [preciosError, setPreciosError] = useState('');
  // Cuál tarjeta está en modo edición (-1 = ninguna)
  const [editando, setEditando]       = useState(null);

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency', currency: 'COP', minimumFractionDigits: 0,
    }).format(n);

  // Porcentaje del precio actual sobre el mínimo (para la barra visual)
  // Límite visual en 200% para que la barra no se desborde
  const getPorcentaje = (id) => {
    const actual = Number(precios[id]);
    const minimo = PRECIOS_MINIMOS[id];
    return Math.min(((actual - minimo) / minimo) * 100 + 50, 100);
  };

  const handleGuardar = () => {
    const invalidos = Object.entries(precios).filter(
      ([id, val]) => Number(val) < PRECIOS_MINIMOS[id]
    );
    if (invalidos.length > 0) {
      setPreciosError('Algunos precios están por debajo del mínimo permitido.');
      return;
    }
    preciosService.guardarPreciosBarbero(user.nombre, precios);
    setPreciosError('');
    setEditando(null);
    setPreciosOk(true);
    setTimeout(() => setPreciosOk(false), 3000);
  };

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

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="page-title">💰 Mis precios</h2>
            <p className="page-subtitle">
              Define el valor de cada servicio. El precio mínimo lo establece el sistema.
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleGuardar}>
            💾 Guardar todos los precios
          </button>
        </div>

        {preciosError && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>{preciosError}</div>
        )}
        {preciosOk && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            ✅ Precios actualizados correctamente.
          </div>
        )}

        {/* Resumen rápido */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--gold)', fontSize: '1.4rem' }}>
              {Object.keys(PRECIOS_MINIMOS).length}
            </div>
            <div className="stat-label">Servicios activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#3fb950', fontSize: '1.4rem' }}>
              {formatPrecio(Math.min(...Object.values(precios).map(Number)))}
            </div>
            <div className="stat-label">Precio más bajo</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--red-light)', fontSize: '1.4rem' }}>
              {formatPrecio(Math.max(...Object.values(precios).map(Number)))}
            </div>
            <div className="stat-label">Precio más alto</div>
          </div>
        </div>

        {/* Tarjetas de servicios */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {Object.entries(NOMBRES_SERVICIOS).map(([id, nombre]) => {
            const info     = SERVICIOS_INFO[id] || { icon: '✂', dur: '' };
            const minimo   = PRECIOS_MINIMOS[id];
            const actual   = Number(precios[id]);
            const porcentaje = getPorcentaje(id);
            const estaEditando = editando === id;
            const bajoDeMini = actual < minimo;

            return (
              <div
                key={id}
                className="card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  border: bajoDeMini
                    ? '1.5px solid var(--red-light)'
                    : estaEditando
                      ? '1.5px solid var(--gold)'
                      : '1px solid var(--border)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxShadow: estaEditando ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
                }}
              >
                {/* Cabecera de la tarjeta */}
                <div style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, var(--surface2) 0%, var(--surface) 100%)',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--red), var(--red-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', flexShrink: 0,
                    boxShadow: 'var(--shadow-red)',
                  }}>
                    {info.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                      ⏱ {info.dur}
                    </div>
                  </div>
                  {/* Badge de mínimo */}
                  <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>
                    min {formatPrecio(minimo)}
                  </span>
                </div>

                {/* Cuerpo */}
                <div style={{ padding: '16px 20px' }}>

                  {/* Precio actual — grande y legible */}
                  {estaEditando ? (
                    // Modo edición: input numérico
                    <div style={{ marginBottom: 14 }}>
                      <label style={{
                        fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        display: 'block', marginBottom: 6,
                      }}>
                        Precio (COP)
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--gold)', fontWeight: 700 }}>$</span>
                        <input
                          type="number"
                          className="form-control"
                          style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700 }}
                          value={precios[id]}
                          min={minimo}
                          autoFocus
                          onChange={(e) => setPrecios({ ...precios, [id]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && setEditando(null)}
                        />
                      </div>
                      {bajoDeMini && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--red-light)', marginTop: 4 }}>
                          ⚠ Mínimo permitido: {formatPrecio(minimo)}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Modo vista: precio grande
                    <div style={{ marginBottom: 14 }}>
                      <div style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.8rem', fontWeight: 700,
                        color: bajoDeMini ? 'var(--red-light)' : 'var(--gold)',
                      }}>
                        {formatPrecio(actual)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                        {actual > minimo
                          ? `${formatPrecio(actual - minimo)} sobre el mínimo`
                          : 'En el precio mínimo'}
                      </div>
                    </div>
                  )}

                  {/* Barra visual precio vs mínimo */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{
                      height: 5, background: 'var(--border)',
                      borderRadius: 4, overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${porcentaje}%`,
                        background: bajoDeMini
                          ? 'var(--red-light)'
                          : 'linear-gradient(90deg, var(--gold-dim), var(--gold))',
                        borderRadius: 4,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>

                  {/* Botón editar / listo */}
                  <button
                    className={estaEditando ? 'btn btn-success btn-sm' : 'btn btn-outline btn-sm'}
                    style={{ width: '100%' }}
                    onClick={() => setEditando(estaEditando ? null : id)}
                  >
                    {estaEditando ? '✓ Listo' : '✏️ Editar precio'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón guardar flotante al final */}
        <div style={{
          marginTop: 28, padding: '20px 24px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', gap: 16,
          flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
            💡 Los cambios no se guardan hasta que presiones el botón.
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleGuardar}>
            💾 Guardar todos los precios
          </button>
        </div>
      </main>
    </div>
  );
}