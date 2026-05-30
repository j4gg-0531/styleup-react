// src/services/horariosService.js
// ─────────────────────────────────────────────────────────────
// CAPA DE DATOS — Hoy usa sessionStorage.
// Cuando conectes el backend solo cambias estas funciones.
//
// HORARIOS_MOCK: horarios precargados para los 3 barberos de prueba.
// Cubren la semana actual (lunes a sábado) con distintos turnos
// para que puedas probar el agendamiento sin base de datos.
// FUTURO: vendrán de GET /api/horarios?barbero=X
// ─────────────────────────────────────────────────────────────

import { notificacionesService } from './notificacionesService.js';
import { barberosService } from './barberosService.js';
import { barberiaService } from './barberiaService.js';

const STORAGE_KEY = 'styleup_horarios';

// ── Calcula el número de día real de cada día de la semana actual ──────────
// Necesario porque los horarios se filtran por h.dia === "27" (número del mes),
// no por nombre del día.
const getDiasSemanActual = () => {
  const hoy      = new Date();
  const diaSem   = hoy.getDay(); // 0=Dom, 1=Lun...
  const lunes    = new Date(hoy);
  lunes.setDate(hoy.getDate() - (diaSem === 0 ? 6 : diaSem - 1));

  // Devuelve un objeto { lun, mar, mie, jue, vie, sab } con el número de día
  return {
    lun: String(lunes.getDate()),
    mar: String(lunes.getDate() + 1),
    mie: String(lunes.getDate() + 2),
    jue: String(lunes.getDate() + 3),
    vie: String(lunes.getDate() + 4),
    sab: String(lunes.getDate() + 5),
  };
};

// ── Genera los horarios mock para un barbero ──────────────────────────────
// Cada entrada es un "bloque" de disponibilidad:
//   - dia:        número del día del mes (string) → "27"
//   - mes:        nombre corto del día → "Lun" (se usa solo para mostrar)
//   - horaInicio: "09:00"
//   - horaFin:    "13:00"
//   - estado:     "disponible" | "descanso"
//   - semanaOffset: 0 (semana actual)
//
// FUTURO: estos datos vendrán de la tabla "horarios" en la BD:
//   SELECT * FROM horarios WHERE barbero_id = ? AND semana = ?
const generarMockBarbero = (barberoNombre, turnosConfig) => {
  const dias = getDiasSemanActual();
  const NOMBRES_DIA = { lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb' };

  return turnosConfig.flatMap((turno, idx) =>
    turno.dias.map((clave, i) => ({
      id:            `mock-${barberoNombre.replace(/\s/g, '')}-${idx}-${i}`,
      barberoNombre,
      dia:           dias[clave],
      mes:           NOMBRES_DIA[clave],
      horaInicio:    turno.inicio,
      horaFin:       turno.fin,
      rango:         `${turno.inicio} — ${turno.fin}`,
      estado:        turno.estado || 'disponible',
      semanaOffset:  0,
      esMock:        true, // marca para distinguirlos de los horarios reales
    }))
  );
};

// ── Configuración de turnos por barbero ───────────────────────────────────
//
// Juan Pérez — turno mañana lunes a viernes + sábado medio día
const mockJuan = generarMockBarbero('Juan Pérez', [
  { dias: ['lun', 'mar', 'mie', 'jue', 'vie'], inicio: '08:00', fin: '13:00' },
  { dias: ['lun', 'mar', 'mie', 'jue', 'vie'], inicio: '14:00', fin: '18:00' },
  { dias: ['sab'],                              inicio: '09:00', fin: '13:00' },
]);

// Carlos López — turno tarde lunes a viernes + sábado completo
const mockCarlos = generarMockBarbero('Carlos López', [
  { dias: ['lun', 'mar', 'jue', 'vie'], inicio: '13:00', fin: '20:00' },
  { dias: ['mie'],                      inicio: '13:00', fin: '20:00' },
  { dias: ['sab'],                      inicio: '09:00', fin: '17:00' },
]);

// Miguel Torres — horario especial: solo martes, jueves y sábado
const mockMiguel = generarMockBarbero('Miguel Torres', [
  { dias: ['mar', 'jue'], inicio: '10:00', fin: '19:00' },
  { dias: ['sab'],        inicio: '10:00', fin: '15:00' },
]);

// Array unificado de todos los mocks
// FUTURO: reemplazar con la llamada a la API
const HORARIOS_MOCK = [...mockJuan, ...mockCarlos, ...mockMiguel];

// ── Helpers internos ──────────────────────────────────────────────────────

const leerHorarios = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const guardarHorarios = (horarios) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(horarios));
};

const findBarberiaByBarberoNombre = (barberoNombre) => {
  const todas = barberiaService.getTodas();
  for (const barberia of todas) {
    if (!barberia.barberoIds?.length) continue;
    for (const bid of barberia.barberoIds) {
      const barbero = barberosService.getById(bid);
      if (barbero && `${barbero.nombre} ${barbero.apellido}` === barberoNombre) {
        return barberia;
      }
    }
  }
  return null;
};

// ── Servicio exportado ────────────────────────────────────────────────────

export const horariosService = {

  // Obtener horarios de un barbero específico.
  // Combina los mocks con los horarios reales guardados en sessionStorage.
  // Así el barbero puede agregar/eliminar sus propios bloques y los mocks
  // siempre están disponibles de fondo.
  // FUTURO: return await fetch(`/api/horarios?barbero=${barberoNombre}`)
  getHorariosByBarbero: (barberoNombre) => {
    const guardados = leerHorarios();
    const reales    = guardados.filter((h) => h.barberoNombre === barberoNombre);
    const mocks     = HORARIOS_MOCK.filter((h) => h.barberoNombre === barberoNombre);

    // Los horarios reales tienen prioridad; los mocks completan los días vacíos.
    // Evitamos duplicar: si ya hay un bloque real para ese día, no mostramos el mock.
    const diasConReal = new Set(reales.map((h) => h.dia));
    const mocksFiltrados = mocks.filter((m) => !diasConReal.has(m.dia));

    return [...reales, ...mocksFiltrados];
  },

  // Agregar un nuevo bloque de horario (creado por el barbero en la UI)
  // FUTURO: return await fetch('/api/horarios', { method: 'POST', body: ... })
  agregarHorario: (datos) => {
    const horarios = leerHorarios();
    const nuevo = {
      ...datos,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    guardarHorarios([...horarios, nuevo]);

    const barberia = findBarberiaByBarberoNombre(datos.barberoNombre);
    if (barberia) {
      notificacionesService.crear({
        tipo: 'horario_modificado',
        paraRol: 'barberia',
        paraNombre: barberia.nombreDueno,
        deRol: 'barbero',
        deNombre: datos.barberoNombre,
        mensaje: `${datos.barberoNombre} modificó su horario (nuevo bloque: ${datos.rango})`,
        metadata: { horarioId: nuevo.id },
      });
    }

    return nuevo;
  },

  // Eliminar un bloque de horario
  // FUTURO: return await fetch(`/api/horarios/${id}`, { method: 'DELETE' })
  eliminarHorario: (id) => {
    const horarios = leerHorarios();
    const eliminado = horarios.find((h) => h.id === id);
    const actualizados = horarios.filter((h) => h.id !== id);
    guardarHorarios(actualizados);

    if (eliminado) {
      const barberia = findBarberiaByBarberoNombre(eliminado.barberoNombre);
      if (barberia) {
        notificacionesService.crear({
          tipo: 'horario_modificado',
          paraRol: 'barberia',
          paraNombre: barberia.nombreDueno,
          deRol: 'barbero',
          deNombre: eliminado.barberoNombre,
          mensaje: `${eliminado.barberoNombre} eliminó un bloque de horario (${eliminado.rango})`,
          metadata: { horarioId: id },
        });
      }
    }

    return actualizados;
  },
};