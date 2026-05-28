// src/pages/barbero/HistorialBarbero.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { preciosService } from '../../services/preciosService.js';

export default function HistorialBarbero() {
  const { user } = useAuth();
  const { citas, cargarCitas } = useCitas();
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    if (user?.nombre) cargarCitas(user.nombre);
  }, [user, cargarCitas]);

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  const badgePorEstado = {
    pendiente:  <span className="badge badge-gold">Pendiente</span>,
    completada: <span className="badge badge-green">Completada</span>,
    cancelada:  <span className="badge badge-muted">Cancelada</span>,
  };

  const citasHistorial = citas.filter(
    (c) => c.barbero?.name === user?.nombre && c.estado !== 'pendiente'
  );

  const historialFiltrado = filtroFecha
    ? citasHistorial.filter((c) => {
        const [anio, , dia] = filtroFecha.split('-');
        return c.fechaDia === String(Number(dia)) && c.fechaAnio === anio;
      })
    : citasHistorial;

  const navItems = [
    { icon: '🏠', label: 'Dashboard',     href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios',  href: '/barbero/horarios' },
    { icon: '✂',  label: 'Mis servicios', href: '/barbero/precios' },
    { icon: '📋', label: 'Ofertas',       href: '/barbero/ofertas' },
    { icon: '📖', label: 'Historial',     href: '/barbero/historial' },
    { icon: '📊', label: 'Reportes',      href: '/barbero/reportes' },
  ];

  const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">📖 Historial de citas</h2>
          <p className="page-subtitle">Todas tus citas finalizadas o canceladas</p>
        </div>

        {/* Filtro por fecha */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
              Filtrar por fecha:
            </span>
            <input
              type="date"
              className="form-control"
              style={{ maxWidth: 200 }}
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
            {filtroFecha && (
              <button className="btn btn-ghost btn-sm" onClick={() => setFiltroFecha('')}>
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="card">
          {historialFiltrado.length === 0 ? (
            <div className="alert alert-info">
              {filtroFecha
                ? 'No hay citas para la fecha seleccionada.'
                : 'Aún no tienes citas en el historial.'}
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th><th>Hora</th><th>Cliente</th>
                    <th>Servicio</th><th>Valor</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historialFiltrado].reverse().map((c) => (
                    <tr key={c.id}>
                      <td>{c.fechaDia} {c.fechaMes} {c.fechaAnio}</td>
                      <td>{c.hora}</td>
                      <td>{c.clienteNombre}</td>
                      <td>{c.servicio?.name}</td>
                      <td>
                        {c.estado === 'completada'
                          ? formatPrecio(preciosService.getPrecioServicio(user.nombre, c.servicio?.id))
                          : '—'}
                      </td>
                      <td>{badgePorEstado[c.estado]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}