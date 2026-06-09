import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Scissors, ClipboardList, Clock, BarChart3, Building2, Circle, ChevronRight, Bell } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { barberiaService } from '../../services/barberiaService.js';

export default function BarberosBarberia() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const barberiaId = user?.barberiaId;
  const [barberia, setBarberia] = useState(null);

  useEffect(() => {
    if (!barberiaId) return;
    const fetchData = async () => {
      const data = await barberiaService.getById(barberiaId);
      setBarberia(data);
    };
    fetchData();
  }, [barberiaId]);

  const barberos = barberia?.barberiaBarberos || [];

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
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Scissors size={22} /> Mis barberos</h2>
          <p className="page-subtitle">Haz clic en un barbero para ver su perfil completo</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {barberos.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', padding: 20 }}>No hay barberos empleados</p>
          )}
          {barberos.map((b) => {
            const bb = b.barbero || {};
            const nombreCompleto = `${bb.nombre || ''} ${bb.apellido || ''}`.trim();
            return (
              <div
                key={b.id}
                className="card"
                style={{ padding: 20, cursor: 'pointer' }}
                onClick={() => navigate(`/barberia/barberos/${bb.cedula || b.id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="barbero-avatar" style={{ fontSize: '1.5rem', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                    <Scissors size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                      {nombreCompleto || 'Sin nombre'}
                    </div>
                    <div style={{ color: 'var(--gold)', fontSize: '0.82rem' }}>
                      <Scissors size={14} /> {bb.especialidad || 'Sin especialidad'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: '1.3rem', color: 'var(--gold)',
                      }}>
                        {bb.calificacion ? bb.calificacion.toFixed(1) : '—'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>estrellas</div>
                    </div>
                    <span className={`badge ${b.activo ? 'badge-green' : 'badge-muted'}`}>
                      {b.activo
                        ? <><Circle size={8} fill="#3fb950" color="#3fb950" /> Activo</>
                        : <><Circle size={8} color="var(--muted)" /> Inactivo</>}
                    </span>
                    <ChevronRight size={18} color="var(--muted)" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
