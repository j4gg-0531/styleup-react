import { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';

const HORARIOS_INICIALES = [
  { id:1, dia:'9', mes:'Lun', rango:'09:00 — 13:00', horas:'4 horas', estado:'disponible' },
  { id:2, dia:'9', mes:'Lun', rango:'13:00 — 14:00', horas:'1 hora',  estado:'descanso' },
  { id:3, dia:'9', mes:'Lun', rango:'14:00 — 18:00', horas:'4 horas', estado:'disponible' },
  { id:4, dia:'10', mes:'Mar', rango:'09:00 — 12:00', horas:'3 horas', estado:'disponible' },
  { id:5, dia:'10', mes:'Mar', rango:'14:00 — 16:00', horas:'2 horas', estado:'ocupado' },
];
const DIAS_SEMANA = [
  { name:'Lun', num:'9' }, { name:'Mar', num:'10' }, { name:'Mié', num:'11' },
  { name:'Jue', num:'12' }, { name:'Vie', num:'13' }, { name:'Sáb', num:'14' },
];

export default function Horarios() {
  const [tab, setTab] = useState('ver');
  const [horarios, setHorarios] = useState(HORARIOS_INICIALES);
  const [diasSel, setDiasSel] = useState([]);
  const [estadoSel, setEstadoSel] = useState('disponible');
  const [horaInicio, setHoraInicio] = useState('10:00');
  const [horaFin, setHoraFin] = useState('14:00');
  const [msgNuevo, setMsgNuevo] = useState(null);
  const [msgElim, setMsgElim] = useState(false);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',   href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios', href: '/barbero/horarios' },
  ];

  const toggleDia = (num) => setDiasSel((prev) => prev.includes(num) ? prev.filter((d) => d !== num) : [...prev, num]);

  const eliminar = (id) => {
    setHorarios((prev) => prev.filter((h) => h.id !== id));
    setMsgElim(true); setTimeout(() => setMsgElim(false), 2000);
  };

  const guardar = () => {
    if (diasSel.length === 0) { setMsgNuevo({ tipo: 'error', texto: 'Selecciona al menos un día.' }); return; }
    setMsgNuevo({ tipo: 'success', texto: '✅ Horario guardado correctamente.' });
    setTimeout(() => { setMsgNuevo(null); setTab('ver'); setDiasSel([]); }, 2000);
  };

  const badgeClase = { disponible: 'badge-green', ocupado: 'badge-red', descanso: 'badge-muted' };
  const badgeTxt   = { disponible: 'Disponible', ocupado: 'Ocupado', descanso: 'Descanso' };
  const colorEst   = { disponible: '#2ecc71', ocupado: 'var(--red-light)', descanso: 'var(--muted)' };

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">⏰ Mis horarios</h2>
          <p className="page-subtitle">Configura tu disponibilidad semanal</p>
        </div>

        {/* Tabs */}
        <div className="hor-tabs">
          <div className={`hor-tab ${tab === 'ver' ? 'active' : ''}`} onClick={() => setTab('ver')}>Ver horarios</div>
          <div className={`hor-tab ${tab === 'nuevo' ? 'active' : ''}`} onClick={() => setTab('nuevo')}>+ Agregar horario</div>
        </div>

        {/* TAB: VER */}
        {tab === 'ver' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Semana del 9 al 15 de junio · {horarios.length} bloques registrados</div>
              <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem' }}>
                {[['#2ecc71','Disponible'],['var(--red-light)','Ocupado'],['var(--muted)','Descanso']].map(([c,l]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, background: c, borderRadius: '50%', display: 'inline-block' }} /> {l}
                  </span>
                ))}
              </div>
            </div>

            {['9','10'].map((dia) => (
              <div key={dia}>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 8px' }}>
                  {dia === '9' ? 'Lunes 9' : 'Martes 10'}
                </div>
                {horarios.filter((h) => h.dia === dia).map((h) => (
                  <div key={h.id} className={`horario-card ${h.estado}`}>
                    <div className="horario-fecha">
                      <div className="h-day">{h.dia}</div>
                      <div className="h-month">{h.mes}</div>
                    </div>
                    <div className="horario-info">
                      <div className="horario-rango">{h.rango}</div>
                      <div className="horario-meta">{h.horas} · Estado: <span style={{ color: colorEst[h.estado] }}>{badgeTxt[h.estado]}</span></div>
                    </div>
                    <div className="horario-actions">
                      <span className={`badge ${badgeClase[h.estado]}`}>{badgeTxt[h.estado]}</span>
                      <button className="btn btn-outline btn-sm" onClick={() => eliminar(h.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {msgElim && <div className="alert alert-info" style={{ marginTop: 12 }}>Horario eliminado.</div>}
          </div>
        )}

        {/* TAB: NUEVO */}
        {tab === 'nuevo' && (
          <div className="nuevo-card">
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', marginBottom: 4 }}>Nuevo bloque de horario</h3>
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>Selecciona los días, horario y estado de disponibilidad.</p>

            <div className="form-label">Días de la semana</div>
            <div className="week-grid" style={{ marginBottom: 20 }}>
              {DIAS_SEMANA.map((d) => (
                <div key={d.num} className={`week-day ${diasSel.includes(d.num) ? 'selected' : ''}`} onClick={() => toggleDia(d.num)}>
                  <div className="wday-name">{d.name}</div>
                  <div className="wday-num">{d.num}</div>
                </div>
              ))}
              <div className="week-day" style={{ opacity: 0.3, cursor: 'not-allowed' }}>
                <div className="wday-name">Dom</div><div className="wday-num">15</div>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Hora de inicio</label>
                <select className="form-control" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)}>
                  {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00'].map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Hora de fin</label>
                <select className="form-control" value={horaFin} onChange={(e) => setHoraFin(e.target.value)}>
                  {['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'].map((h) => <option key={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div className="form-label">Estado</div>
            <div className="estado-options">
              {[{ val:'disponible', dot:'dot-disponible', label:'Disponible' },
                { val:'descanso',   dot:'dot-descanso',   label:'Descanso' }].map((o) => (
                <div key={o.val} className={`estado-opt ${estadoSel === o.val ? 'selected' : ''}`} onClick={() => setEstadoSel(o.val)}>
                  <span className={`dot ${o.dot}`} /> {o.label}
                </div>
              ))}
            </div>

            {msgNuevo && <div className={`alert alert-${msgNuevo.tipo === 'error' ? 'error' : 'success'}`}>{msgNuevo.texto}</div>}
            <button className="btn btn-primary" onClick={guardar}>💾 Guardar horario</button>
          </div>
        )}
      </main>
    </div>
  );
}