import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Scissors, ClipboardList, Clock, BarChart3, Building2, Bell } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { ofertasService } from '../../services/ofertasService.js';
import { barberiaService } from '../../services/barberiaService.js';
import { citasService } from '../../services/citasService.js';

const fmtPrecio = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function DashboardBarberia() {
  const { user } = useAuth();
  const barberiaId = user?.barberiaId;
  const [ofertas, setOfertas] = useState([]);
  const [barberia, setBarberia] = useState(null);
  const [citas, setCitas] = useState([]);
  const ofertasActivas = ofertas.filter((o) => o.estado === 'activa').length;
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split('T')[0];

  useEffect(() => {
    if (!barberiaId) return;
    const fetchData = async () => {
      const [ofertasData, barberiaData, citasData] = await Promise.all([
        ofertasService.getOfertasByBarberia(barberiaId),
        barberiaService.getById(barberiaId),
        citasService.getCitasByBarberia(barberiaId, hoy.getMonth() + 1, hoy.getFullYear()),
      ]);
      setOfertas(ofertasData);
      setBarberia(barberiaData);
      setCitas(citasData);
    };
    fetchData();
  }, [barberiaId]);

  const barberos = barberia?.barberiaBarberos || [];
  const barberosActivos = barberos.filter((b) => b.activo).length;
  const citasEsteMes = citas.length;
  const pendientesHoy = citas.filter((c) => c.estado === 'pendiente' && c.fecha === hoyStr).length;

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
        <div className="welcome-banner">
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>¡Hola, {user?.nombre}!</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginTop: 4 }}>
              Panel de gestión de tu barbería
            </p>
          </div>
          <Link to="/barberia/ofertas" className="btn btn-primary">
            <ClipboardList size={16} /> Nueva oferta
          </Link>
        </div>

        <div className="stats-grid">
          {[
            [String(barberosActivos), 'Barberos activos',  'var(--gold)'],
            [String(ofertasActivas),  'Ofertas activas',   'var(--cobre-light)'],
            [String(citasEsteMes),    'Citas este mes',     '#2ecc71'],
            [String(pendientesHoy),   'Pendientes hoy',     'var(--muted)'],
          ].map(([v, l, c]) => (
            <div key={l} className="stat-card">
              <div className="stat-value" style={{ color: c }}>{v}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Scissors size={18} /> Barberos empleados</div>
            {barberos.slice(0, 5).map((b) => (
              <div key={b.id} className="cita-row">
                <div style={{ fontSize: '1.5rem' }}><Scissors size={24} /></div>
                <div className="cita-detail">
                  <div className="cita-client">{b.barbero?.nombre} {b.barbero?.apellido}</div>
                  <div className="cita-service-label">{b.barbero?.especialidad || 'Sin especialidad'}</div>
                </div>
                <span className={`badge ${b.activo ? 'badge-green' : 'badge-muted'}`}>
                  {b.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
            {barberos.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No hay barberos registrados</p>
            )}
            <Link to="/barberia/barberos" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
              Ver todos →
            </Link>
          </div>

          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ClipboardList size={18} /> Ofertas recientes</div>
            {ofertas.slice(0, 2).map((o) => (
              <div key={o.id} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{o.titulo}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 6 }}>{o.fecha}</div>
                <span className={`badge ${o.estado === 'activa' ? 'badge-green' : 'badge-muted'}`}>
                  {o.estado === 'activa' ? 'Activa' : 'Cerrada'}
                </span>
              </div>
            ))}
            {ofertas.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No hay ofertas aún</p>
            )}
            <Link to="/barberia/ofertas" className="btn btn-outline btn-sm" style={{ marginTop: 12 }}>
              Ver todas →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
