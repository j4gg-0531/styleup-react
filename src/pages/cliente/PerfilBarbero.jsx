// src/pages/cliente/PerfilBarbero.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { useHorarios } from '../../context/useHorarios.js';
import { barberosService } from '../../services/barberosService.js';
import Estrellas from '../../components/Estrellas.jsx';

const SERVICIOS = [
  { id: 'E001', icon: '✂', name: 'Corte a tijera',      dur: '30 min' },
  { id: 'E002', icon: '💈', name: 'Degradado / Fade',   dur: '25 min' },
  { id: 'E006', icon: '🪒', name: 'Afeitado con navaja', dur: '20 min' },
  { id: 'E008', icon: '🧔', name: 'Corte + Barba',      dur: '45 min' },
  { id: 'E007', icon: '🎨', name: 'Diseño en cabello',  dur: '40 min' },
  { id: 'E004', icon: '⚡', name: 'Undercut',           dur: '35 min' },
];

// FUTURO: estos días y horas vendrán del backend calculados dinámicamente
const DIAS = [
  { num: '11', dis: false }, { num: '12', dis: false }, { num: '13', dis: false },
  { num: '14', dis: false }, { num: '15', dis: false }, { num: '16', dis: false },
  { num: '17', dis: true  }, { num: '18', dis: false }, { num: '19', dis: false },
  { num: '20', dis: false },
];

export default function PerfilBarbero() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { agregarCita } = useCitas();
  const { horarios, cargarHorarios } = useHorarios();

  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [servicioSel, setServicioSel]         = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState(null);
  const [confirmado, setConfirmado]           = useState(false);
  const [paso, setPaso]                       = useState(1);

  const barberoData = barberosService.getById(id);
  const [barbero] = useState(() => barberoData || null);

  useEffect(() => {
    if (!barberoData) {
      navigate('/cliente/barberos');
      return;
    }
    cargarHorarios(`${barberoData.nombre} ${barberoData.apellido}`);
  }, [id, navigate, cargarHorarios, barberoData]);

  // Genera slots de 30 min a partir de los horarios del barbero
  // FUTURO: el backend filtrará también los slots ya ocupados por otras citas
  const bloquesDelDia = diaSeleccionado
    ? barberosService.getDisponibilidad(
        `${barbero?.nombre} ${barbero?.apellido}`,
        diaSeleccionado,
        horarios
      )
    : [];

  const generarSlots = (bloques) => {
    const slots = [];
    bloques.forEach((bloque) => {
      const [hIni, mIni] = bloque.horaInicio.split(':').map(Number);
      const [hFin, mFin] = bloque.horaFin.split(':').map(Number);
      let minutos = hIni * 60 + mIni;
      const fin   = hFin * 60 + mFin;
      while (minutos + 30 <= fin) {
        const h = String(Math.floor(minutos / 60)).padStart(2, '0');
        const m = String(minutos % 60).padStart(2, '0');
        slots.push(`${h}:${m}`);
        minutos += 30;
      }
    });
    return slots;
  };

  const slotsDisponibles = generarSlots(bloquesDelDia);

  const handleConfirmar = () => {
    if (!diaSeleccionado || !servicioSel || !horaSeleccionada) return;
    agregarCita({
      clienteNombre: user.nombre,
      servicio: servicioSel,
      barbero: { id: barbero.id, name: `${barbero.nombre} ${barbero.apellido}` },
      fechaDia:  diaSeleccionado,
      fechaMes:  'Jun',
      fechaAnio: '2025',
      hora: horaSeleccionada,
    });
    setConfirmado(true);
    setTimeout(() => navigate('/cliente'), 2000);
  };

  if (!barbero) return (
    <div style={{ padding: 40, color: 'var(--muted)' }}>Cargando...</div>
  );

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '32px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Botón volver */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: 24 }}
          onClick={() => navigate('/cliente/barberos')}
        >
          ← Volver a barberos
        </button>

        {/* Perfil del barbero */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="barbero-avatar" style={{ width: 72, height: 72, fontSize: '2rem' }}>
              {barbero.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem' }}>
                {barbero.nombre} {barbero.apellido}
              </h2>
              <div style={{ color: 'var(--gold)', fontSize: '0.88rem', marginTop: 4 }}>
                ✂ {barbero.especialidad}
              </div>
              <div style={{ marginTop: 6 }}>
                <Estrellas
                  calificacion={barbero.calificacion}
                  total={barbero.totalCalificaciones}
                  size="lg"
                />
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>📍 {barbero.direccion}, {barbero.ciudad}</span>
                <span>📞 {barbero.telefono}</span>
              </div>
            </div>
            <span className={`badge ${barbero.disponibleHoy ? 'badge-green' : 'badge-muted'}`}>
              {barbero.disponibleHoy ? '● Disponible hoy' : '● No disponible hoy'}
            </span>
          </div>
        </div>

        {/* PASO 1 — Calendario y hora */}
        <div className="card mb-2" style={{ marginBottom: 16 }}>
          <div className="card-title">📅 Paso 1 — Selecciona fecha y hora</div>

          {/* Calendario */}
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
            {[{ num:'8', dis:true }, { num:'9', hoy:true }, ...DIAS].map((d) => (
              <div
                key={d.num}
                className={`fecha-day ${d.dis ? 'disabled' : ''} ${d.hoy ? 'today' : ''} ${diaSeleccionado === d.num ? 'selected' : ''}`}
                onClick={() => {
                  if (!d.dis) {
                    setDiaSeleccionado(d.num);
                    setHoraSeleccionada(null);
                    setPaso(1);
                  }
                }}
              >
                {d.num}
              </div>
            ))}
          </div>

          {/* Slots de hora */}
          {diaSeleccionado && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 10 }}>
                Horarios disponibles
              </p>
              {slotsDisponibles.length === 0 ? (
                <div className="alert alert-info">
                  No hay horarios disponibles para este día.
                </div>
              ) : (
                <div className="hora-grid">
                  {slotsDisponibles.map((slot) => (
                    <div
                      key={slot}
                      className={`hora-slot ${horaSeleccionada === slot ? 'selected' : ''}`}
                      onClick={() => { setHoraSeleccionada(slot); setPaso(2); }}
                    >
                      {slot}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* PASO 2 — Seleccionar servicio */}
        {paso >= 2 && diaSeleccionado && horaSeleccionada && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title">✂ Paso 2 — Selecciona el servicio</div>
            <div className="option-grid">
              {SERVICIOS.map((s) => (
                <div
                  key={s.id}
                  className={`option-card ${servicioSel?.id === s.id ? 'selected' : ''}`}
                  onClick={() => { setServicioSel(s); setPaso(3); }}
                >
                  <div className="option-icon">{s.icon}</div>
                  <div className="option-name">{s.name}</div>
                  <div className="option-sub">{s.dur}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3 — Confirmar */}
        {paso >= 3 && servicioSel && (
          <div className="card">
            <div className="card-title">✅ Paso 3 — Confirma tu cita</div>
            <div style={{ marginBottom: 20 }}>
              {[
                ['Barbero',  `${barbero.nombre} ${barbero.apellido}`],
                ['Fecha',    `${diaSeleccionado} Jun 2025`],
                ['Hora',     horaSeleccionada],
                ['Servicio', servicioSel.name],
                ['Duración', servicioSel.dur],
              ].map(([l, v]) => (
                <div key={l} className="resumen-row">
                  <span className="resumen-label">{l}</span>
                  <span className="resumen-value">{v}</span>
                </div>
              ))}
            </div>
            <div className="alert alert-info" style={{ marginBottom: 16 }}>
              📱 Recibirás un recordatorio por Telegram 1 hora antes de tu cita.
            </div>
            {confirmado && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                ✅ ¡Cita agendada con éxito! Redirigiendo...
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-outline" onClick={() => setPaso(1)}>
                ← Modificar
              </button>
              <button
                className="btn btn-success btn-lg"
                onClick={handleConfirmar}
                disabled={confirmado}
              >
                ✅ Confirmar cita
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}