// src/pages/barbero/Precios.jsx
import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { preciosService, PRECIOS_MINIMOS, NOMBRES_SERVICIOS } from '../../services/preciosService.js';

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

  const [precios, setPrecios]       = useState(getPreciosInicial);
  const [preciosOk, setPreciosOk]   = useState(false);
  const [preciosError, setPreciosError] = useState('');

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

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
    setPreciosOk(true);
    setTimeout(() => setPreciosOk(false), 3000);
  };

  const navItems = [
    { icon: '🏠', label: 'Dashboard',    href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios', href: '/barbero/horarios' },
    { icon: '📋', label: 'Ofertas',      href: '/barbero/ofertas' },  // ← NUEVO
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
        <div className="page-header">
          <h2 className="page-title">💰 Mis precios</h2>
          <p className="page-subtitle">
            Define el valor de cada servicio. No puedes ir por debajo del mínimo establecido.
          </p>
        </div>

        <div className="card" style={{ maxWidth: 540 }}>
          {Object.entries(NOMBRES_SERVICIOS).map(([id, nombre]) => (
            <div key={id} className="form-group">
              <label className="form-label">
                {nombre}
                <span style={{ color: 'var(--muted)', marginLeft: 8, fontWeight: 400 }}>
                  (mínimo: {formatPrecio(PRECIOS_MINIMOS[id])})
                </span>
              </label>
              <input
                type="number"
                className="form-control"
                value={precios[id] || PRECIOS_MINIMOS[id]}
                min={PRECIOS_MINIMOS[id]}
                onChange={(e) => setPrecios({ ...precios, [id]: e.target.value })}
              />
            </div>
          ))}
          {preciosError && <div className="alert alert-error">{preciosError}</div>}
          <button className="btn btn-primary" onClick={handleGuardar}>
            💾 Guardar precios
          </button>
          {preciosOk && (
            <div className="alert alert-success" style={{ marginTop: 8 }}>
              ✅ Precios guardados.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}