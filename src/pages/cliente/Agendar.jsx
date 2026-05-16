import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';     // ← NUEVO
import { useCitas } from '../../context/useCitas.js';   // ← NUEVO

const SERVICIOS = [
  { id: 'E001', icon: '✂', name: 'Corte a tijera', dur: '30 min' },
  { id: 'E002', icon: '💈', name: 'Degradado / Fade', dur: '25 min' },
  { id: 'E006', icon: '🪒', name: 'Afeitado con navaja', dur: '20 min' },
  { id: 'E008', icon: '🧔', name: 'Corte + Barba', dur: '45 min' },
  { id: 'E007', icon: '🎨', name: 'Diseño en cabello', dur: '40 min' },
  { id: 'E004', icon: '⚡', name: 'Undercut', dur: '35 min' },
];
const BARBEROS = [
  { id: 'B001', icon: '💈', name: 'Juan Pérez', spec: '✂ Corte a tijera', avail: '● Disponible hoy', availColor: '#2ecc71' },
  { id: 'B002', icon: '✂', name: 'Carlos López', spec: '🪒 Afeitado / Fade', avail: '● Disponible hoy', availColor: '#2ecc71' },
  { id: 'B003', icon: '🧔', name: 'Miguel Torres', spec: '🎨 Diseño / Undercut', avail: '● Próximo disponible: mañana', availColor: 'var(--muted)' },
];
const HORAS = [
  { t: '09:00', ocupado: true }, { t: '09:30' }, { t: '10:00' }, { t: '10:30', ocupado: true },
  { t: '11:00' }, { t: '11:30' }, { t: '12:00', ocupado: true }, { t: '14:00' },
  { t: '14:30' }, { t: '15:00' }, { t: '15:30', ocupado: true }, { t: '16:00' },
];
const DIAS = [
  { num: '11', dis: false }, { num: '12', dis: false }, { num: '13', dis: false },
  { num: '14', dis: false }, { num: '15', dis: false }, { num: '16', dis: false }, { num: '17', dis: true },
  { num: '18', dis: false }, { num: '19', dis: false }, { num: '20', dis: false },
];

export default function Agendar() {
  const [paso, setPaso] = useState(1);
  const [sel, setSel] = useState({ servicio: null, barbero: null, fecha: null, hora: null });
  const [msgs, setMsgs] = useState({});
  const [confirmado, setConfirmado] = useState(false);
  const navigate = useNavigate();

  const { user } = useAuth();       // ← NUEVO: para saber quién agenda
  const { agregarCita } = useCitas(); // ← NUEVO: para guardar la cita

  const ir = (n) => setPaso(n);

  const validar1 = () => { if (!sel.servicio) { setMsgs({ 1: true }); return; } setMsgs({}); ir(2); };
  const validar2 = () => { if (!sel.barbero)  { setMsgs({ 2: true }); return; } setMsgs({}); ir(3); };
  const validar3 = () => { if (!sel.fecha || !sel.hora) { setMsgs({ 3: true }); return; } setMsgs({}); ir(4); };
  const confirmar = () => {
    agregarCita({
      clienteNombre: user.nombre, // quién agenda
      servicio: sel.servicio,     // { id, name, dur, icon }
      barbero:  sel.barbero,      // { id, name }
      fechaDia: sel.fecha,        // número del día: "15"
      fechaMes: 'Jun',            // FUTURO: vendrá del calendario dinámico
      fechaAnio: '2025',
      hora: sel.hora,
    });
    setConfirmado(true);
    setTimeout(() => navigate('/cliente'), 2200);
  };

  return (
    <div style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(52,152,219,0.08) 0%, transparent 55%), var(--bg)', minHeight: '100vh' }}>
      <div className="wizard-wrap">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <Link to="/cliente" className="wizard-back">← Volver al panel</Link>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem' }}>✂ StyleUp</div>
        </div>

        {/* Steps */}
        <div className="steps mb-3">
          {['Servicio', 'Barbero', 'Fecha y hora', 'Confirmar'].map((l, i) => (
            <div key={l} className={`step ${paso === i+1 ? 'active' : paso > i+1 ? 'done' : ''}`}>
              <div className="step-circle">{paso > i+1 ? '✓' : i+1}</div>
              <div className="step-label">{l}</div>
            </div>
          ))}
        </div>

        {/* PASO 1 */}
        {paso === 1 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>¿Qué servicio deseas?</h2>
            <p className="text-muted mb-3">Selecciona el tipo de corte o servicio que necesitas.</p>
            <div className="option-grid">
              {SERVICIOS.map((s) => (
                <div key={s.id} className={`option-card ${sel.servicio?.id === s.id ? 'selected' : ''}`}
                  onClick={() => setSel({ ...sel, servicio: s })}>
                  <div className="option-icon">{s.icon}</div>
                  <div className="option-name">{s.name}</div>
                  <div className="option-sub">{s.dur}</div>
                </div>
              ))}
            </div>
            {msgs[1] && <div className="alert alert-error">Selecciona un servicio para continuar.</div>}
            <div className="nav-btns"><span /><button className="btn btn-primary" onClick={validar1}>Siguiente →</button></div>
          </div>
        )}

        {/* PASO 2 */}
        {paso === 2 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Elige tu barbero</h2>
            <p className="text-muted mb-3">Todos disponibles para tu servicio seleccionado.</p>
            <div className="barbero-grid">
              {BARBEROS.map((b) => (
                <div key={b.id} className={`barbero-card ${sel.barbero?.id === b.id ? 'selected' : ''}`}
                  onClick={() => setSel({ ...sel, barbero: b })}>
                  <div className="barbero-avatar">{b.icon}</div>
                  <div className="barbero-name">{b.name}</div>
                  <div className="barbero-spec">{b.spec}</div>
                  <div className="barbero-avail" style={{ color: b.availColor }}>{b.avail}</div>
                </div>
              ))}
            </div>
            {msgs[2] && <div className="alert alert-error">Selecciona un barbero para continuar.</div>}
            <div className="nav-btns">
              <button className="btn btn-outline" onClick={() => ir(1)}>← Anterior</button>
              <button className="btn btn-primary" onClick={validar2}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* PASO 3 */}
        {paso === 3 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Fecha y hora</h2>
            <p className="text-muted mb-3">Elige el día y horario que mejor te convenga.</p>
            <div className="card mb-2">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <button className="btn btn-ghost btn-sm">‹</button>
                <div style={{ fontFamily: "'Playfair Display',serif" }}>Junio 2025</div>
                <button className="btn btn-ghost btn-sm">›</button>
              </div>
              <div className="fecha-grid">
                {['L','M','M','J','V','S','D'].map((d, i) => (
                  <div key={i} className="fecha-day-name">{d}</div>
                ))}
                {[1,2,3,4].map((n) => <div key={`e${n}`} />)}
                {[{num:'8',dis:true},{num:'9',hoy:true},...DIAS].map((d) => (
                  <div key={d.num}
                    className={`fecha-day ${d.dis ? 'disabled' : ''} ${d.hoy ? 'today' : ''} ${sel.fecha === d.num ? 'selected' : ''}`}
                    onClick={() => !d.dis && setSel({ ...sel, fecha: d.num })}>
                    {d.num}
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>Horarios disponibles</p>
            <div className="hora-grid">
              {HORAS.map((h) => (
                <div key={h.t}
                  className={`hora-slot ${h.ocupado ? 'ocupado' : ''} ${sel.hora === h.t ? 'selected' : ''}`}
                  onClick={() => !h.ocupado && setSel({ ...sel, hora: h.t })}>
                  {h.t}
                </div>
              ))}
            </div>
            {msgs[3] && <div className="alert alert-error">Selecciona fecha y hora para continuar.</div>}
            <div className="nav-btns">
              <button className="btn btn-outline" onClick={() => ir(2)}>← Anterior</button>
              <button className="btn btn-primary" onClick={validar3}>Ver resumen →</button>
            </div>
          </div>
        )}

        {/* PASO 4 */}
        {paso === 4 && (
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Confirma tu cita</h2>
            <p className="text-muted mb-3">Revisa los detalles antes de confirmar.</p>
            <div className="card mb-3">
              {[['Servicio', sel.servicio?.name],['Barbero', sel.barbero?.name],['Fecha', `${sel.fecha} Jun 2025`],['Hora', sel.hora],['Duración', sel.servicio?.dur]].map(([l,v]) => (
                <div key={l} className="resumen-row">
                  <span className="resumen-label">{l}</span>
                  <span className="resumen-value">{v || '—'}</span>
                </div>
              ))}
            </div>
            <div className="alert alert-info mb-2">📱 Recibirás un recordatorio por Telegram 1 hora antes de tu cita.</div>
            {confirmado && <div className="alert alert-success">✅ ¡Cita agendada con éxito! Recibirás una notificación por Telegram.</div>}
            <div className="nav-btns">
              <button className="btn btn-outline" onClick={() => ir(3)}>← Modificar</button>
              <button className="btn btn-success btn-lg" onClick={confirmar}>✅ Confirmar cita</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}