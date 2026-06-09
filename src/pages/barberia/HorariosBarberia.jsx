import { useState, useEffect, useCallback } from 'react';
import { Home, Scissors, ClipboardList, Clock, BarChart3, Building2, Lightbulb, Bell } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useToast } from '../../context/useToast.js';
import { horariosService } from '../../services/horariosService.js';
import { barberiaService } from '../../services/barberiaService.js';
import { barberosService } from '../../services/barberosService.js';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function HorariosBarberia() {
  const { user } = useAuth();
  const toast = useToast();
  const [propuestas, setPropuestas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [horariosPorBarbero, setHorariosPorBarbero] = useState({});

  useEffect(() => {
    if (!user?.barberiaId) return;
    const load = async () => {
      try {
        const [props, empleados] = await Promise.all([
          horariosService.getPropuestasByBarberia(user.barberiaId),
          barberosService.getTodos(),
        ]);
        setPropuestas(props);

        const barberia = await barberiaService.getByNombre(user.nombre);
        const idsBarberos = barberia?.barberoIds || [];
        const filtrados = empleados.filter((b) => idsBarberos.includes(b.id));
        setBarberos(filtrados);

        const map = {};
        for (const b of filtrados) {
          try {
            const h = await horariosService.getHorarioAdmin(b.id);
            map[b.id] = h;
          } catch { map[b.id] = {}; }
        }
        setHorariosPorBarbero(map);
      } catch { /* silent */ }
    };
    load();
  }, [user]);

  const cargarPropuestas = useCallback(async () => {
    if (!user?.barberiaId) return;
    try {
      const props = await horariosService.getPropuestasByBarberia(user.barberiaId);
      setPropuestas(props);
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    cargarPropuestas();
  }, [cargarPropuestas]);

  const handleAceptar = async (id) => {
    try {
      const result = await horariosService.aceptarPropuesta(id);
      if (result) {
        toast.success(`Horario aceptado — ${result.barberoNombre}`);
        cargarPropuestas();
      }
    } catch { /* silent */ }
  };

  const handleRechazar = async (id) => {
    try {
      const result = await horariosService.rechazarPropuesta(id);
      if (result) {
        toast.info(`Propuesta rechazada — ${result.barberoNombre}`);
        cargarPropuestas();
      }
    } catch { /* silent */ }
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

  const getHorarioTexto = (barberoId, diaIdx) => {
    const h = horariosPorBarbero[barberoId];
    if (!h) return '—';
    const diaNum = (() => {
      const hoy = new Date();
      const lunes = new Date(hoy);
      lunes.setDate(hoy.getDate() - (hoy.getDay() === 0 ? 6 : hoy.getDay() - 1));
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + diaIdx);
      return dia.getDate();
    })();
    return h[diaNum] || '—';
  };

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
                    Aceptar
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleRechazar(p.id)} style={{ borderColor: '#e74c3c', color: '#e74c3c' }}>
                    Rechazar
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
                {barberos.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                      No hay barberos registrados en tu barbería.
                    </td>
                  </tr>
                ) : (
                  barberos.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.nombre} {b.apellido}</strong></td>
                      {DIAS.map((_, idx) => {
                        const texto = getHorarioTexto(b.id, idx);
                        return (
                          <td key={idx}>
                            <span style={{
                              color: texto === '—' ? 'var(--muted)' : 'var(--gold)',
                              fontSize: '0.8rem'
                            }}>
                              {texto}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
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
