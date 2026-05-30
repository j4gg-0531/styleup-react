// src/pages/barberia/HorariosBarberia.jsx
import { useState, useEffect } from 'react';
import { Home, Scissors, ClipboardList, Clock, BarChart3, Building2, Lightbulb, Bell } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useToast } from '../../context/useToast.js';
import { horariosService } from '../../services/horariosService.js';

const BARBEROS = ['Juan Pérez', 'Carlos López', 'Miguel Torres'];
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const HORARIOS_MOCK = {
  'Juan Pérez':    { Lun:'09:00-18:00', Mar:'09:00-18:00', Mié:'09:00-18:00', Jue:'09:00-18:00', Vie:'09:00-18:00', Sáb:'09:00-14:00' },
  'Carlos López':  { Lun:'12:00-20:00', Mar:'12:00-20:00', Mié:'Descanso',    Jue:'12:00-20:00', Vie:'12:00-20:00', Sáb:'10:00-16:00' },
  'Miguel Torres': { Lun:'Descanso',    Mar:'10:00-18:00', Mié:'10:00-18:00', Jue:'10:00-18:00', Vie:'10:00-18:00', Sáb:'Descanso' },
};

export default function HorariosBarberia() {
  const { user } = useAuth();
  const toast = useToast();
  const [propuestas, setPropuestas] = useState([]);

  const cargarPropuestas = () => {
    if (user?.nombre) {
      setPropuestas(horariosService.getPropuestasByBarberia(user.nombre));
    }
  };

  useEffect(() => {
    cargarPropuestas();
  }, [user]);

  const handleAceptar = (id) => {
    const result = horariosService.aceptarPropuesta(id);
    if (result) {
      toast.success(`Horario aceptado — ${result.barberoNombre}`);
      cargarPropuestas();
    }
  };

  const handleRechazar = (id) => {
    const result = horariosService.rechazarPropuesta(id);
    if (result) {
      toast.info(`Propuesta rechazada — ${result.barberoNombre}`);
      cargarPropuestas();
    }
  };
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
          <h2 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={22} /> Horarios del equipo</h2>
          <p className="page-subtitle">Gestiona la disponibilidad semanal de tus barberos</p>
        </div>

        {propuestas.length > 0 && (
          <div className="card" style={{ marginBottom: 20, borderLeft: '3px solid #f1c40f' }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem', marginBottom: 12 }}>
              Propuestas pendientes ({propuestas.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {propuestas.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'rgba(241,196,15,0.04)',
                  }}
                >
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <strong>{p.barberoNombre}</strong> propone{' '}
                    <span style={{ fontWeight: 600 }}>{p.rango}</span>
                    <span style={{ color: 'var(--muted)', marginLeft: 8 }}>
                      ({p.dias.length} día{p.dias.length > 1 ? 's' : ''})
                    </span>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleAceptar(p.id)} style={{ background: '#2ecc71' }}>
                    <CheckCircle size={14} /> Aceptar
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleRechazar(p.id)} style={{ borderColor: '#e74c3c', color: '#e74c3c' }}>
                    <XCircle size={14} /> Rechazar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
          <Lightbulb size={16} /> Los barberos pueden enviar propuestas de horario desde su panel. Revísalas y
          acéptalas o recházalas aquí mismo.
        </div>
      </main>
    </div>
  );
}