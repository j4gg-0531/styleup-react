// src/pages/barberia/HorariosBarberia.jsx
import { Home, Scissors, ClipboardList, Clock, BarChart3, Building2, Lightbulb } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

const BARBEROS = ['Juan Pérez', 'Carlos López', 'Miguel Torres'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const HORARIOS_MOCK = {
  'Juan Pérez':    { Lun:'09:00-18:00', Mar:'09:00-18:00', Mié:'09:00-18:00', Jue:'09:00-18:00', Vie:'09:00-18:00', Sáb:'09:00-14:00' },
  'Carlos López':  { Lun:'12:00-20:00', Mar:'12:00-20:00', Mié:'Descanso',    Jue:'12:00-20:00', Vie:'12:00-20:00', Sáb:'10:00-16:00' },
  'Miguel Torres': { Lun:'Descanso',    Mar:'10:00-18:00', Mié:'10:00-18:00', Jue:'10:00-18:00', Vie:'10:00-18:00', Sáb:'Descanso' },
};

export default function HorariosBarberia() {
  const navItems = [
    { icon: <Home size={18} />, label: 'Dashboard',  href: '/barberia' },
    { icon: <Scissors size={18} />, label: 'Barberos',   href: '/barberia/barberos' },
    { icon: <ClipboardList size={18} />, label: 'Ofertas',    href: '/barberia/ofertas' },
    { icon: <Clock size={18} />, label: 'Horarios',   href: '/barberia/horarios' },
    { icon: <Scissors size={18} />, label: 'Servicios',  href: '/barberia/servicios' },
    { icon: <BarChart3 size={18} />, label: 'Reportes',   href: '/barberia/reportes' },
  ];

  return (
    <div className="app-layout">
      <Sidebar avatar={<Building2 size={20} />} badge="Barbería" badgeClass="badge-cobre" navItems={navItems} />
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={22} /> Horarios del equipo</h2>
          <p className="page-subtitle">Gestiona la disponibilidad semanal de tus barberos</p>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Barbero</th>
                  {DIAS.map((d) => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {BARBEROS.map((b) => (
                  <tr key={b}>
                    <td><strong>{b}</strong></td>
                    {DIAS.map((d) => {
                      const horario = HORARIOS_MOCK[b][d];
                      return (
                        <td key={d}>
                          <span style={{
                            color: horario === 'Descanso' ? 'var(--muted)' : 'var(--gold)',
                            fontSize: '0.8rem'
                          }}>
                            {horario}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="alert alert-info" style={{ marginTop: 16 }}>
          <Lightbulb size={16} /> Para modificar el horario de un barbero, ve a la sección de Barberos y selecciona el empleado.
          {/* FUTURO: editor inline de horarios por barbero */}
        </div>
      </main>
    </div>
  );
}