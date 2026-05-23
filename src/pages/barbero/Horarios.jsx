// src/pages/barbero/Horarios.jsx
import { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useHorarios } from '../../context/useHorarios.js';

const DIAS_SEMANA = [
  { name: 'Lun', num: '9' }, { name: 'Mar', num: '10' },
  { name: 'Mié', num: '11' }, { name: 'Jue', num: '12' },
  { name: 'Vie', num: '13' }, { name: 'Sáb', num: '14' },
];

export default function Horarios() {
  const { user } = useAuth();
  const { horarios, cargarHorarios, agregarHorario, eliminarHorario } = useHorarios();

  const [tab, setTab]             = useState('ver');
  const [diasSel, setDiasSel]     = useState([]);
  const [estadoSel, setEstadoSel] = useState('disponible');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin]     = useState('13:00');
  const [msgNuevo, setMsgNuevo]   = useState(null);
  const [msgElim, setMsgElim]     = useState(false);

  // Carga los horarios del barbero al entrar
  useEffect(() => {
    if (user?.nombre) cargarHorarios(user.nombre);
  }, [user, cargarHorarios]);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',    href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios', href: '/barbero/horarios' },
    { icon: '📋', label: 'Ofertas',      href: '/barbero/ofertas' },  // ← NUEVO
    { icon: '📖', label: 'Historial',    href: '/barbero/historial' },
    { icon: '💰', label: 'Mis precios',  href: '/barbero/precios' },
    { icon: '📊', label: 'Reportes',     href: '/barbero/reportes' },
    { icon: '✏️', label: 'Mi perfil',    href: '/barbero/perfil' },
  ];

  const toggleDia = (num) =>
    setDiasSel((prev) =>
      prev.includes(num) ? prev.filter((d) => d !== num) : [...prev, num]
    );

  const handleEliminar = (id) => {
    eliminarHorario(id);
    setMsgElim(true);
    setTimeout(() => setMsgElim(false), 2000);
  };

  const handleGuardar = () => {
    if (diasSel.length === 0) {
      setMsgNuevo({ tipo: 'error', texto: 'Selecciona al menos un día.' });
      return;
    }
    if (horaInicio >= horaFin) {
      setMsgNuevo({ tipo: 'error', texto: 'La hora de fin debe ser mayor a la de inicio.' });
      return;
    }

    // Guarda un bloque por cada día seleccionado
    diasSel.forEach((dia) => {
      const diaInfo = DIAS_SEMANA.find((d) => d.num === dia);
      agregarHorario({
        barberoNombre: user.nombre,
        dia,
        mes: diaInfo?.name || '',
        rango: `${horaInicio} — ${horaFin}`,
        horaInicio,
        horaFin,
        estado: estadoSel,
      });
    });

    setMsgNuevo({ tipo: 'success', texto: '✅ Horario guardado correctamente.' });
    setTimeout(() => {
      setMsgNuevo(null);
      setTab('ver');
      setDiasSel([]);
    }, 1500);
  };

  const badgeClase = { disponible: 'badge-green', descanso: 'badge-muted' };
  const badgeTxt   = { disponible: 'Disponible', descanso: 'Descanso' };
  const colorBorde = { disponible: '#2ecc71', descanso: 'var(--muted)' };

  // Agrupa horarios por día para mostrarlos ordenados
  const horariosPorDia = DIAS_SEMANA.reduce((acc, dia) => {
    const del_dia = horarios.filter((h) => h.dia === dia.num);
    if (del_dia.length > 0) acc.push({ dia, bloques: del_dia });
    return acc;
  }, []);

  const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">⏰ Mis horarios</h2>
          <p className="page-subtitle">Configura tu disponibilidad semanal</p>
        </div>

        <div className="hor-tabs">
          <div className={`hor-tab ${tab === 'ver' ? 'active' : ''}`} onClick={() => setTab('ver')}>
            Ver horarios
          </div>
          <div className={`hor-tab ${tab === 'nuevo' ? 'active' : ''}`} onClick={() => setTab('nuevo')}>
            + Agregar horario
          </div>
        </div>

        {/* TAB: VER */}
        {tab === 'ver' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                {horarios.length} bloques registrados esta semana
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem' }}>
                {[['#2ecc71', 'Disponible'], ['var(--muted)', 'Descanso']].map(([c, l]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, background: c, borderRadius: '50%', display: 'inline-block' }} /> {l}
                  </span>
                ))}
              </div>
            </div>

            {horariosPorDia.length === 0 ? (
              <div className="alert alert-info">
                No tienes horarios configurados. ¡Agrega tu primer bloque!
              </div>
            ) : (
              horariosPorDia.map(({ dia, bloques }) => (
                <div key={dia.num}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 8px' }}>
                    {dia.name} {dia.num}
                  </div>
                  {bloques.map((h) => (
                    <div key={h.id} className="horario-card" style={{ borderLeft: `3px solid ${colorBorde[h.estado]}` }}>
                      <div className="horario-fecha">
                        <div className="h-day">{h.dia}</div>
                        <div className="h-month">{h.mes}</div>
                      </div>
                      <div className="horario-info">
                        <div className="horario-rango">{h.rango}</div>
                        <div className="horario-meta">
                          Estado: <span style={{ color: colorBorde[h.estado] }}>{badgeTxt[h.estado]}</span>
                        </div>
                      </div>
                      <div className="horario-actions">
                        <span className={`badge ${badgeClase[h.estado]}`}>{badgeTxt[h.estado]}</span>
                        <button className="btn btn-outline btn-sm" onClick={() => handleEliminar(h.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
            {msgElim && <div className="alert alert-info" style={{ marginTop: 12 }}>Horario eliminado.</div>}
          </div>
        )}

        {/* TAB: NUEVO */}
        {tab === 'nuevo' && (
          <div className="nuevo-card">
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', marginBottom: 4 }}>
              Nuevo bloque de horario
            </h3>
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
              Selecciona los días, horario y estado de disponibilidad.
            </p>

            <div className="form-label">Días de la semana</div>
            <div className="week-grid" style={{ marginBottom: 20 }}>
              {DIAS_SEMANA.map((d) => (
                <div
                  key={d.num}
                  className={`week-day ${diasSel.includes(d.num) ? 'selected' : ''}`}
                  onClick={() => toggleDia(d.num)}
                >
                  <div className="wday-name">{d.name}</div>
                  <div className="wday-num">{d.num}</div>
                </div>
              ))}
              <div className="week-day" style={{ opacity: 0.3, cursor: 'not-allowed' }}>
                <div className="wday-name">Dom</div>
                <div className="wday-num">15</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Hora de inicio</label>
                <select className="form-control" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}>
                  {['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'].map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hora de fin</label>
                <select className="form-control" value={horaFin} onChange={(e) => setHoraFin(e.target.value)}>
                  {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'].map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-label">Estado</div>
            <div className="estado-options">
              {[{ val: 'disponible', dot: 'dot-disponible', label: 'Disponible' },
                { val: 'descanso',   dot: 'dot-descanso',   label: 'Descanso' }].map((o) => (
                <div
                  key={o.val}
                  className={`estado-opt ${estadoSel === o.val ? 'selected' : ''}`}
                  onClick={() => setEstadoSel(o.val)}
                >
                  <span className={`dot ${o.dot}`} /> {o.label}
                </div>
              ))}
            </div>

            {msgNuevo && (
              <div className={`alert alert-${msgNuevo.tipo === 'error' ? 'error' : 'success'}`}>
                {msgNuevo.texto}
              </div>
            )}
            <button className="btn btn-primary" onClick={handleGuardar}>
              💾 Guardar horario
            </button>
          </div>
        )}
      </main>
    </div>
  );
}