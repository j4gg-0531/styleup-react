import { useState, useEffect } from 'react';
import { Home, Scissors, ClipboardList, Clock, BarChart3, Building2, Bell } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { citasService } from '../../services/citasService.js';
import { preciosService } from '../../services/preciosService.js';

export default function ReportesBarberia() {
  const { user } = useAuth();
  const barberiaId = user?.barberiaId;

  const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                        'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const [mesFiltro, setMesFiltro]   = useState(new Date().getMonth() + 1);
  const [anioFiltro, setAnioFiltro] = useState(new Date().getFullYear());
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    if (!barberiaId) return;
    const fetchData = async () => {
      const data = await citasService.getCitasByBarberia(barberiaId, mesFiltro, anioFiltro);
      setCitas(data);
    };
    fetchData();
  }, [barberiaId, mesFiltro, anioFiltro]);

  const formatPrecio = (n) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

  const completadas = citas.filter((c) => c.estado === 'completada');
  const canceladas  = citas.filter((c) => c.estado === 'cancelada');
  const gananciasTotal = completadas.reduce((sum, c) => {
    const precio = preciosService.getPrecioServicio(c.barbero?.name, c.servicio?.id);
    return sum + (precio || 0);
  }, 0);

  const gananciasPorBarbero = {};
  completadas.forEach((c) => {
    const nombre = c.barbero?.name || 'Desconocido';
    if (!gananciasPorBarbero[nombre]) gananciasPorBarbero[nombre] = { nombre, ganancias: 0, citas: 0 };
    gananciasPorBarbero[nombre].citas++;
    gananciasPorBarbero[nombre].ganancias += preciosService.getPrecioServicio(c.barbero?.name, c.servicio?.id) || 0;
  });
  const gananciasArray = Object.values(gananciasPorBarbero).sort((a, b) => b.ganancias - a.ganancias);
  const barberoTop = gananciasArray.length > 0 ? gananciasArray[0].nombre : '—';

  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard',  href: '/barberia' },
    { icon: <Scissors size={18} />, label: 'Barberos',   href: '/barberia/barberos' },
    { icon: <ClipboardList size={18} />, label: 'Ofertas',    href: '/barberia/ofertas' },
    { icon: <Clock size={18} />, label: 'Horarios',   href: '/barberia/horarios' },
    { icon: <Scissors size={18} />, label: 'Servicios',  href: '/barberia/servicios' },
    { icon: <BarChart3 size={18} />, label: 'Reportes',   href: '/barberia/reportes' },
    { icon: <Bell size={18} />, label: 'Notificaciones', href: '/barberia/notificaciones', notificacionesBadge: true },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar={<Building2 size={20} />} badge="Barbería" badgeClass="badge-cobre" navItems={navItems} />
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={22} /> Reportes</h2>
          <p className="page-subtitle">Ganancias consolidadas de tu barbería</p>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>
              Filtrar por período:
            </span>
            <select className="form-control" style={{ maxWidth: 160 }} value={mesFiltro}
              onChange={(e) => setMesFiltro(Number(e.target.value))}>
              {mesesNombres.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select className="form-control" style={{ maxWidth: 120 }} value={anioFiltro}
              onChange={(e) => setAnioFiltro(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            [formatPrecio(gananciasTotal), 'Ganancias totales', 'var(--gold)'],
            [String(completadas.length), 'Citas completadas', '#2ecc71'],
            [String(canceladas.length), 'Canceladas', 'var(--muted)'],
            [barberoTop, 'Barbero top', 'var(--cobre-light)'],
          ].map(([v, l, c]) => (
            <div key={l} className="stat-card">
              <div className="stat-value" style={{ color: c, fontSize: '1.3rem' }}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={18} /> Ganancias por barbero</div>
          {gananciasArray.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: 16 }}>No hay datos para este período</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Barbero</th><th>Citas</th><th>Ganancias</th><th>%</th></tr>
                </thead>
                <tbody>
                  {gananciasArray.map((b) => (
                    <tr key={b.nombre}>
                      <td><strong>{b.nombre}</strong></td>
                      <td>{b.citas}</td>
                      <td style={{ color: 'var(--gold)' }}>{formatPrecio(b.ganancias)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3 }}>
                            <div style={{
                              height: '100%', borderRadius: 3, background: 'var(--cobre)',
                              width: `${gananciasTotal > 0 ? Math.round((b.ganancias / gananciasTotal) * 100) : 0}%`
                            }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--muted)', minWidth: 32 }}>
                            {gananciasTotal > 0 ? Math.round((b.ganancias / gananciasTotal) * 100) : 0}%
                          </span>
                        </div>
                      </td>
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
