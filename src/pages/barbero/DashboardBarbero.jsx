// src/pages/barbero/DashboardBarbero.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { citasService } from '../../services/citasService.js'; // ← AGREGAR
import { preciosService, PRECIOS_MINIMOS, NOMBRES_SERVICIOS } from '../../services/preciosService.js';

export default function DashboardBarbero() {
  const { user } = useAuth();
  const { citas, cargarCitas } = useCitas();

  // ✅ PRIMERO defines la función
  const getPreciosInicial = () => {
    if (!user?.nombre) {
      return Object.keys(PRECIOS_MINIMOS).reduce(
        (acc, id) => ({ ...acc, [id]: PRECIOS_MINIMOS[id] }), {}
      );
    }
    const guardados = preciosService.getPreciosByBarbero(user.nombre);
    return Object.keys(PRECIOS_MINIMOS).reduce(
      (acc, id) => ({ ...acc, [id]: guardados[id] || PRECIOS_MINIMOS[id] }), {}
    );
  };

  // ✅ DESPUÉS la usas en useState
  const [sec, setSec]           = useState('dashboard');
  const [saveOk, setSaveOk]     = useState(false);
  const [preciosOk, setPreciosOk] = useState(false);
  const [preciosError, setPreciosError] = useState('');
  const [precios, setPrecios]   = useState(getPreciosInicial);

  // Estados para el filtro de reportes
  const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [mesFiltro, setMesFiltro]   = useState(new Date().getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  const [filtroFecha, setFiltroFecha] = useState('');

  // useEffect va después de todos los useState
  useEffect(() => {
    if (user?.nombre) {
      cargarCitas(user.nombre);
    }
  }, [user, cargarCitas]);

  // Filtra citas de HOY para este barbero
  // FUTURO: el backend filtra por fecha real, aquí usamos el día guardado
  const hoy = new Date().getDate().toString();
  const citasHoy = citas.filter(
    (c) => c.barbero?.name === user?.nombre && c.fechaDia === hoy
  );

  // Citas filtradas por mes y año para reportes
  // FUTURO: /api/reportes?mes=mesFiltro&anio=anioFiltro&barbero=nombre
  const citasReportes = citas.filter((c) => {
    const mesesMap = {'Ene':1,'Feb':2,'Mar':3,'Abr':4,'May':5,'Jun':6,
                      'Jul':7,'Ago':8,'Sep':9,'Oct':10,'Nov':11,'Dic':12 };
    const mesCita  = mesesMap[c.fechaMes] || 0;
    const anioCita = Number(c.fechaAnio);
    return c.barbero?.name === user?.nombre &&
          mesCita  === mesFiltro &&
          anioCita === anioFiltro;
  });

  const gananciasReportes = citasReportes
    .filter((c) => c.estado === 'completada')
    .reduce((total, c) => {
      const precio = preciosService.getPrecioServicio(user.nombre, c.servicio?.id);
      return total + precio;
    }, 0);

  // Historial: todas las citas del barbero que NO son de hoy o ya tienen estado final
  const citasHistorial = citas.filter(
    (c) => c.barbero?.name === user?.nombre && c.estado !== 'pendiente'
  );

  // Estadísticas del dashboard
  const citasPendientesHoy  = citasHoy.filter((c) => c.estado === 'pendiente').length;
  const citasCompletadasHoy = citasHoy.filter((c) => c.estado === 'completada').length;

  // Ganancias del día de hoy
  const gananciasHoy = citasHoy
    .filter((c) => c.estado === 'completada')
    .reduce((total, c) => {
      const precio = preciosService.getPrecioServicio(user.nombre, c.servicio?.id);
      return total + precio;
    }, 0);

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  const handleCompletarCita = (citaId) => {
    citasService.completarCita(citaId);
    cargarCitas(user.nombre);
  };
  const handleGuardarPrecios = () => {
    // Valida que todos los precios sean mayores al mínimo
    const invalidos = Object.entries(precios).filter(
      ([id, val]) => Number(val) < PRECIOS_MINIMOS[id]
    );
    if (invalidos.length > 0) {
      setPreciosError(`Algunos precios están por debajo del mínimo permitido.`);
      return;
    }
    preciosService.guardarPreciosBarbero(user.nombre, precios);
    setPreciosError('');
    setPreciosOk(true);
    setTimeout(() => setPreciosOk(false), 3000);
  };

  const badgePorEstado = {
    pendiente:  <span className="badge badge-gold">Pendiente</span>,
    completada: <span className="badge badge-green">Completada</span>,
    cancelada:  <span className="badge badge-muted">Cancelada</span>,
  };

  const navItems = [
    { icon: '🏠', label: 'Dashboard',    href: '/barbero', onClick: () => setSec('dashboard') },
    { icon: '⏰', label: 'Mis horarios', href: '/barbero/horarios' },
    { icon: '📖', label: 'Historial',    onClick: () => setSec('historial') },
    { icon: '💰', label: 'Mis precios',  onClick: () => setSec('precios') },
    { icon: '📊', label: 'Reportes',     onClick: () => setSec('reportes') },
    { icon: '✏️', label: 'Mi perfil',    onClick: () => setSec('perfil') },
  ];

  const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">

        {/* ── DASHBOARD ── */}
        {sec === 'dashboard' && (
          <div>
            <div className="today-header">
              <div>
                <div className="today-date">
                  {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="today-sub">Tu agenda de hoy</div>
              </div>
              <Link to="/barbero/horarios" className="btn btn-outline btn-sm">⏰ Gestionar horarios</Link>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--gold)' }}>{citasHoy.length}</div>
                <div className="stat-label">Citas hoy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--red-light)' }}>{citasPendientesHoy}</div>
                <div className="stat-label">Pendientes</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#2ecc71' }}>{citasCompletadasHoy}</div>
                <div className="stat-label">Completadas hoy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: 'var(--gold)', fontSize: '1.3rem' }}>
                  {formatPrecio(gananciasHoy)}
                </div>
                <div className="stat-label">Ganancias de hoy</div>
              </div>
            </div>

            {/* Agenda del día */}
            <div className="card">
              <div className="card-title">📅 Agenda de hoy</div>
              {citasHoy.length === 0 ? (
                <div className="alert alert-info">No tienes citas para hoy.</div>
              ) : (
                citasHoy.map((c) => (
                  <div key={c.id} className="cita-row">
                    <div className="cita-hora">{c.hora}</div>
                    <div className={`cita-bar ${c.estado === 'completada' ? 'bar-completada' : 'bar-pendiente'}`} />
                    <div className="cita-detail">
                      <div className="cita-client">{c.clienteNombre}</div>
                      <div className="cita-service-label">{c.servicio?.name} · {c.servicio?.dur}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {badgePorEstado[c.estado]}
                      {c.estado === 'pendiente' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleCompletarCita(c.id)}>
                          ✓ Completar
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── HISTORIAL ── */}
{sec === 'historial' && (
  <div>
    <div className="page-header">
      <h2 className="page-title">📖 Historial de citas</h2>
      <p className="page-subtitle">Todas tus citas finalizadas o canceladas</p>
    </div>

    {/* Filtro por fecha */}
    {/* FUTURO: /api/citas?fecha=filtroFecha&barbero=nombre */}
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
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setFiltroFecha('')}
          >
            ✕ Limpiar filtro
          </button>
        )}
      </div>
    </div>

    <div className="card">
      {(() => {
        // Filtra historial por fecha si hay filtro activo
        // FUTURO: este filtro lo hará la BD directamente
        const historialFiltrado = filtroFecha
          ? citasHistorial.filter((c) => {
              const [anio, , dia] = filtroFecha.split('-');
              return c.fechaDia === String(Number(dia)) &&
                    c.fechaAnio === anio;
            })
          : citasHistorial;

        if (historialFiltrado.length === 0) {
          return (
            <div className="alert alert-info">
              {filtroFecha
                ? 'No hay citas para la fecha seleccionada.'
                : 'Aún no tienes citas en el historial.'}
            </div>
          );
        }

        return (
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
        );
      })()}
    </div>
  </div>
)}

        {/* ── MIS PRECIOS ── */}
        {sec === 'precios' && (
          <div>
            <div className="page-header">
              <h2 className="page-title">💰 Mis precios</h2>
              <p className="page-subtitle">Define el valor de cada servicio. No puedes ir por debajo del mínimo establecido.</p>
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
              <button className="btn btn-primary" onClick={handleGuardarPrecios}>
                💾 Guardar precios
              </button>
              {preciosOk && <div className="alert alert-success" style={{ marginTop: 8 }}>✅ Precios guardados.</div>}
            </div>
          </div>
        )}

        {/* ── REPORTES ── */}
        {sec === 'reportes' && (
          <div>
            <div className="page-header">
              <h2 className="page-title">📊 Reportes</h2>
              <p className="page-subtitle">Estadísticas y ganancias por período</p>
            </div>

            {/* Filtro mes/año */}
            {/* FUTURO: estos valores se enviarán como parámetros a la API */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
                  Filtrar por período:
                </span>
                <select
                  className="form-control"
                  style={{ maxWidth: 160 }}
                  value={mesFiltro}
                  onChange={(e) => setMesFiltro(Number(e.target.value))}
                >
                  {mesesNombres.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  className="form-control"
                  style={{ maxWidth: 120 }}
                  value={anioFiltro}
                  onChange={(e) => setAnioFiltro(Number(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  {citasReportes.length} citas encontradas
                </span>
              </div>
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-title">💰 Resumen del período</div>
                <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    [formatPrecio(gananciasReportes), 'Ganancias', 'var(--gold)'],
                    [citasReportes.filter((c) => c.estado === 'completada').length, 'Completadas', '#2ecc71'],
                    [citasReportes.filter((c) => c.estado === 'cancelada').length, 'Canceladas', 'var(--muted)'],
                    [citasReportes.length, 'Total agendadas', 'var(--red-light)'],
                  ].map(([v, l, c]) => (
                    <div key={l} className="stat-card" style={{ padding: 14 }}>
                      <div className="stat-value" style={{ fontSize: '1.3rem', color: c }}>{v}</div>
                      <div className="stat-label">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-title">✂ Servicios del período</div>
                {Object.entries(NOMBRES_SERVICIOS).map(([id, nombre]) => {
                  const cantidad = citasReportes.filter(
                    (c) => c.servicio?.id === id && c.estado === 'completada'
                  ).length;
                  const ganancia = cantidad * preciosService.getPrecioServicio(user.nombre, id);
                  const total = citasReportes.filter((c) => c.estado === 'completada').length;
                  return (
                    <div key={id} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                        <span>{nombre}</span>
                        <span className="text-gold">{cantidad} citas · {formatPrecio(ganancia)}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                        <div style={{
                          height: '100%',
                          width: total > 0 ? `${Math.min((cantidad / total) * 100, 100)}%` : '0%',
                          background: 'var(--red)', borderRadius: 3,
                          minWidth: cantidad > 0 ? '4px' : 0
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── PERFIL ── */}
        {sec === 'perfil' && (
          <div>
            <div className="page-header">
              <h2 className="page-title">✏️ Mi perfil</h2>
              <p className="page-subtitle">Datos personales y profesionales</p>
            </div>
            <div className="card" style={{ maxWidth: 540 }}>
              <div className="form-group">
                <label className="form-label">Cédula (no editable)</label>
                <input className="form-control" defaultValue="B001" readOnly style={{ opacity: 0.5 }} />
              </div>
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Nombres</label><input className="form-control" defaultValue={user?.nombre} /></div>
                <div className="form-group"><label className="form-label">Apellidos</label><input className="form-control" defaultValue="Pérez" /></div>
              </div>
              <div className="form-group"><label className="form-label">Correo</label><input className="form-control" defaultValue="barbero@correo.com" /></div>
              <div className="form-group"><label className="form-label">Teléfono</label><input className="form-control" defaultValue="3009876543" /></div>
              <div className="form-group">
                <label className="form-label">Especialidad</label>
                <select className="form-control">
                  <option>Corte a tijera (30 min)</option>
                  <option>Degradado / Fade (25 min)</option>
                  <option>Afeitado con navaja (20 min)</option>
                  <option>Corte + Barba (45 min)</option>
                </select>
              </div>
              <hr className="divider" />
              <div className="grid-2">
                <div className="form-group"><label className="form-label">Nueva contraseña</label><input type="password" className="form-control" placeholder="Dejar vacío" /></div>
                <div className="form-group"><label className="form-label">Confirmar</label><input type="password" className="form-control" /></div>
              </div>
              <button className="btn btn-primary" onClick={() => { setSaveOk(true); setTimeout(() => setSaveOk(false), 3000); }}>
                Guardar cambios
              </button>
              {saveOk && <div className="alert alert-success" style={{ marginTop: 8 }}>✅ Perfil actualizado.</div>}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}