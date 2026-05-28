// src/pages/barbero/Horarios.jsx
import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useHorarios } from '../../context/useHorarios.js';
import { barberiaService } from '../../services/barberiaService.js';

// ── Calcula los 6 días laborales (Lun–Sáb) de la semana indicada ──
// offset = 0 (semana actual), -1 (semana pasada), 1 (próxima semana)…
const getDiasSemana = (offset = 0) => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0=Dom, 1=Lun…
  // Lunes de la semana actual
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1) + offset * 7);

  return Array.from({ length: 6 }, (_, i) => {
    const dia = new Date(lunes);
    dia.setDate(lunes.getDate() + i);
    return {
      name: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i],
      // num como string para que coincida con lo que guarda horariosService
      num: String(dia.getDate()),
      fecha: dia,
    };
  });
};

// Formatea "19 May" a partir de un Date
const fmtFecha = (d) =>
  d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });

// Formatea "Mayo 2026"
const fmtMesAnio = (d) =>
  d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });

export default function Horarios() {
  const { user } = useAuth();
  const { horarios, cargarHorarios, agregarHorario, eliminarHorario } = useHorarios();

  // ¿El barbero trabaja en una barbería? Si sí, modo solo lectura
  const barberia = barberiaService.getTodas().find(
    (b) => b.barberos?.includes(user?.nombre)
  ) ?? null;
  const soloLectura = !!barberia;

  const [tab, setTab]               = useState('ver');
  const [semanaOffset, setSemanaOffset] = useState(0); // 0 = semana actual
  const [diasSel, setDiasSel]       = useState([]);
  const [estadoSel, setEstadoSel]   = useState('disponible');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin]       = useState('13:00');
  const [msgNuevo, setMsgNuevo]     = useState(null);
  const [msgElim, setMsgElim]       = useState(false);

  // Recalcula los días cada vez que cambia la semana seleccionada
  const DIAS_SEMANA = useMemo(() => getDiasSemana(semanaOffset), [semanaOffset]);

  useEffect(() => {
    if (user?.nombre) cargarHorarios(user.nombre);
  }, [user, cargarHorarios]);

  const navItems = [
    { icon: '🏠', label: 'Dashboard',     href: '/barbero' },
    { icon: '⏰', label: 'Mis horarios',  href: '/barbero/horarios' },
    { icon: '✂',  label: 'Mis servicios', href: '/barbero/precios' },
    { icon: '📋', label: 'Ofertas',       href: '/barbero/ofertas' },
    { icon: '📖', label: 'Historial',     href: '/barbero/historial' },
    { icon: '📊', label: 'Reportes',      href: '/barbero/reportes' },
    { icon: '✏️', label: 'Mi perfil',     href: '/barbero/perfil' },
  ];

  const toggleDia = (num) =>
    setDiasSel((prev) =>
      prev.includes(num) ? prev.filter((d) => d !== num) : [...prev, num]
    );

  const handleEliminar = (id) => {
    if (soloLectura) return;
    eliminarHorario(id);
    setMsgElim(true);
    setTimeout(() => setMsgElim(false), 2000);
  };

  const handleGuardar = () => {
    if (soloLectura) return;
    if (diasSel.length === 0) {
      setMsgNuevo({ tipo: 'error', texto: 'Selecciona al menos un día.' });
      return;
    }
    if (horaInicio >= horaFin) {
      setMsgNuevo({ tipo: 'error', texto: 'La hora de fin debe ser mayor a la de inicio.' });
      return;
    }
    diasSel.forEach((diaNum) => {
      const diaInfo = DIAS_SEMANA.find((d) => d.num === diaNum);
      agregarHorario({
        barberoNombre: user.nombre,
        dia: diaNum,
        mes: diaInfo?.name || '',
        // Guardamos la semana para poder filtrar por semana luego
        semanaOffset,
        rango: `${horaInicio} — ${horaFin}`,
        horaInicio,
        horaFin,
        estado: estadoSel,
      });
    });
    setMsgNuevo({ tipo: 'success', texto: '✅ Horario guardado correctamente.' });
    setTimeout(() => { setMsgNuevo(null); setTab('ver'); setDiasSel([]); }, 1500);
  };

  const badgeClase = { disponible: 'badge-green', descanso: 'badge-muted' };
  const badgeTxt   = { disponible: 'Disponible', descanso: 'Descanso' };
  const colorBorde = { disponible: '#2ecc71', descanso: 'var(--muted)' };

  // Filtra los horarios de la semana visible en pantalla
  const horariosDeEstaSemana = horarios.filter(
    (h) => h.semanaOffset === semanaOffset
  );

  // Agrupa por número de día
  const horariosPorDia = DIAS_SEMANA.reduce((acc, dia) => {
    const bloques = horariosDeEstaSemana.filter((h) => h.dia === dia.num);
    if (bloques.length > 0) acc.push({ dia, bloques });
    return acc;
  }, []);

  // Etiqueta de la semana que se muestra en pantalla
  const primerDia = DIAS_SEMANA[0].fecha;
  const ultimoDia = DIAS_SEMANA[5].fecha;
  const etiquetaSemana = `${fmtFecha(primerDia)} – ${fmtFecha(ultimoDia)}`;
  const etiquetaMes    = fmtMesAnio(primerDia);
  const esHoy          = semanaOffset === 0;

  const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">⏰ Mis horarios</h2>
          <p className="page-subtitle">
            {soloLectura
              ? `Tus horarios los gestiona ${barberia.nombre}. Contacta a tu barbería para cambios.`
              : 'Configura tu disponibilidad semanal'}
          </p>
        </div>

        {soloLectura && (
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            🏪 Trabajas en <strong>{barberia.nombre}</strong>. Solo la barbería puede
            modificar los horarios. Si necesitas un cambio, coordínalo con ellos.
          </div>
        )}

        {/* ── Navegador de semana ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '14px 20px', marginBottom: 24,
          flexWrap: 'wrap', gap: 12,
        }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { setSemanaOffset((o) => o - 1);
              setDiasSel([]); // ← limpia aquí directamente
            }}
          >
            ← Semana anterior
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.1rem', fontWeight: 700,
            }}>
              {etiquetaSemana}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>
              {etiquetaMes}
              {esHoy && (
                <span className="badge badge-gold" style={{ marginLeft: 8, fontSize: '0.7rem' }}>
                  Semana actual
                </span>
              )}
            </div>
          </div>

          <button
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSemanaOffset((o) => o + 1);
              setDiasSel([]); // ← limpia aquí directamente
            }}
          >
            Semana siguiente →
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="hor-tabs">
          <div className={`hor-tab ${tab === 'ver' ? 'active' : ''}`} onClick={() => setTab('ver')}>
            Ver horarios
          </div>
          <div className={`hor-tab ${tab === 'nuevo' ? 'active' : ''}`} onClick={() => !soloLectura && setTab('nuevo')}
            style={{ opacity: soloLectura ? 0.4 : 1, cursor: soloLectura ? 'not-allowed' : 'pointer' }}
            title={soloLectura ? `Bloqueado — tu barbería gestiona los horarios` : ''}>
            + Agregar horario
          </div>
        </div>

        {/* ── TAB: VER ── */}
        {tab === 'ver' && (
          <div>
            {/* Mini-calendario de la semana (solo visual, no seleccionable) */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 8, marginBottom: 20,
            }}>
              {DIAS_SEMANA.map((d) => {
                const tieneHorario = horariosDeEstaSemana.some((h) => h.dia === d.num);
                const esHoyDia = new Date().getDate() === Number(d.num)
                              && semanaOffset === 0;
                return (
                  <div
                    key={d.num}
                    style={{
                      padding: '10px 4px', textAlign: 'center',
                      borderRadius: 8, border: '1.5px solid',
                      borderColor: esHoyDia
                        ? 'var(--gold)'
                        : tieneHorario ? '#2ecc71' : 'var(--border)',
                      background: esHoyDia
                        ? 'rgba(230,184,106,0.08)'
                        : tieneHorario ? 'rgba(63,185,80,0.06)' : 'var(--surface)',
                    }}
                  >
                    <div style={{ fontSize: '0.68rem', color: 'var(--muted)', textTransform: 'uppercase' }}>
                      {d.name}
                    </div>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: '1.1rem', fontWeight: 700, marginTop: 2,
                      color: esHoyDia ? 'var(--gold)' : 'var(--text)',
                    }}>
                      {d.num}
                    </div>
                    {/* Punto verde si tiene horario */}
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', margin: '4px auto 0',
                      background: tieneHorario ? '#2ecc71' : 'transparent',
                    }} />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                {horariosDeEstaSemana.length} bloques registrados esta semana
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: '0.78rem' }}>
                {[['#2ecc71', 'Disponible'], ['var(--muted)', 'Descanso']].map(([c, l]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 10, background: c, borderRadius: '50%', display: 'inline-block' }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {horariosPorDia.length === 0 ? (
              <div className="alert alert-info">
                No tienes horarios para esta semana.{' '}
                <span
                  style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setTab('nuevo')}
                >
                  ¡Agrega uno!
                </span>
              </div>
            ) : (
              horariosPorDia.map(({ dia, bloques }) => (
                <div key={dia.num}>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    margin: '16px 0 8px',
                  }}>
                    {dia.name} {dia.num}
                  </div>
                  {bloques.map((h) => (
                    <div
                      key={h.id}
                      className="horario-card"
                      style={{ borderLeft: `3px solid ${colorBorde[h.estado]}` }}
                    >
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
                        {!soloLectura && <button className="btn btn-outline btn-sm" onClick={() => handleEliminar(h.id)}>✕</button>}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
            {msgElim && <div className="alert alert-info" style={{ marginTop: 12 }}>Horario eliminado.</div>}
          </div>
        )}

        {/* ── TAB: NUEVO ── */}
        {tab === 'nuevo' && (
          <div className="nuevo-card">
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', marginBottom: 4 }}>
              Nuevo bloque — semana del {etiquetaSemana}
            </h3>
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
              Selecciona los días, el rango horario y el estado.
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
              {/* Domingo — siempre deshabilitado */}
              <div className="week-day" style={{ opacity: 0.3, cursor: 'not-allowed' }}>
                <div className="wday-name">Dom</div>
                <div className="wday-num">
                  {/* Calcula el domingo de esta semana */}
                  {(() => {
                    const dom = new Date(DIAS_SEMANA[5].fecha);
                    dom.setDate(dom.getDate() + 1);
                    return dom.getDate();
                  })()}
                </div>
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
              {[
                { val: 'disponible', dot: 'dot-disponible', label: 'Disponible' },
                { val: 'descanso',   dot: 'dot-descanso',   label: 'Descanso' },
              ].map((o) => (
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
            {!soloLectura && <button className="btn btn-primary" onClick={handleGuardar}>
              💾 Guardar horario
            </button>}
          </div>
        )}
      </main>
    </div>
  );
}