// src/pages/cliente/Historial.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';

export default function Historial() {
  const { user } = useAuth();
  const { citas, cargarCitas } = useCitas();
  const [filtroFecha, setFiltroFecha] = useState('');

  useEffect(() => {
    if (user?.nombre) cargarCitas(user.nombre);
  }, [user, cargarCitas]);

  const citasHistorial  = citas.filter((c) => c.estado !== 'pendiente');

  const badgePorEstado = {
    pendiente:  <span className="badge badge-gold">Pendiente</span>,
    completada: <span className="badge badge-green">Completada</span>,
    cancelada:  <span className="badge badge-muted">Cancelada</span>,
  };

  const historialFiltrado = filtroFecha
    ? citasHistorial.filter((c) => {
        const [anio, , dia] = filtroFecha.split('-');
        return c.fechaDia === String(Number(dia)) && c.fechaAnio === anio;
      })
    : citasHistorial;

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

        {/* Historial */}
        <div className="page-header">
          <h2 className="page-title">📖 Mi historial</h2>
          <p className="page-subtitle">Todas tus citas registradas</p>
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
                    <th>Fecha</th><th>Hora</th><th>Servicio</th>
                    <th>Barbero</th><th>Duración</th><th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {[...historialFiltrado].reverse().map((c) => (
                    <tr key={c.id}>
                      <td>{c.fechaDia} {c.fechaMes} {c.fechaAnio}</td>
                      <td>{c.hora}</td>
                      <td>{c.servicio?.icon} {c.servicio?.name}</td>
                      <td>{c.barbero?.name}</td>
                      <td>{c.servicio?.dur}</td>
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