// src/services/agendamientoService.js
// ─────────────────────────────────────────────────────────────
// Lógica de slots dinámicos basada en la duración del servicio.
// Compartida entre Agendar.jsx y PerfilBarbero.jsx.
//
// FUTURO: la generación de slots vendrá del backend
//   GET /api/slots?barbero=X&fecha=Y&duracion=Z
//   El servidor consultará las citas existentes y devolverá
//   solo los slots libres, con horaInicio y horaFin.
// ─────────────────────────────────────────────────────────────

// Duración en minutos de cada servicio
// FUTURO: vendrá de la tabla "servicios" en la BD
export const DURACION_SERVICIOS = {
  E001: 30,  // Corte a tijera
  E002: 25,  // Degradado / Fade
  E006: 20,  // Afeitado con navaja
  E008: 45,  // Corte + Barba
  E007: 40,  // Diseño en cabello
  E004: 35,  // Undercut
};

// Servicios que atiende cada barbero (por especialidadId)
// FUTURO: vendrá de la tabla "barberos" con relación a "servicios"
export const SERVICIOS_POR_BARBERO = {
  B001: ['E001', 'E004'],           // Juan — Corte a tijera, Undercut
  B002: ['E002', 'E006', 'E008'],   // Carlos — Fade, Afeitado, Corte+Barba
  B003: ['E007', 'E004', 'E001'],   // Miguel — Diseño, Undercut, Corte a tijera
};

/**
 * Convierte "HH:MM" en minutos totales desde medianoche.
 * Ejemplo: "09:30" → 570
 */
export const horaAMinutos = (hora) => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Convierte minutos totales en string "HH:MM".
 * Ejemplo: 570 → "09:30"
 */
export const minutosAHora = (minutos) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/**
 * Detecta si dos rangos de tiempo se solapan.
 * Fórmula estándar de detección de conflictos:
 *   nuevoInicio < existenteFin  Y  nuevoFin > existenteInicio
 *
 * FUTURO: esta lógica se moverá al backend para evitar race conditions
 *   (dos clientes agendando el mismo slot al mismo tiempo).
 *
 * @param {number} nuevoInicio  - minutos desde medianoche
 * @param {number} nuevoFin     - minutos desde medianoche
 * @param {Array}  citasExistentes - array de citas ya agendadas del barbero
 * @returns {boolean} true si hay conflicto
 */
export const hayConflicto = (nuevoInicio, nuevoFin, citasExistentes) => {
  return citasExistentes.some((cita) => {
    // Solo consideramos citas pendientes o en curso (no canceladas/completadas)
    if (cita.estado === 'cancelada' || cita.estado === 'completada') return false;

    const citaInicio = horaAMinutos(cita.horaInicio || cita.hora || '00:00');
    const citaFin    = horaAMinutos(cita.horaFin    || cita.hora || '00:00');

    return nuevoInicio < citaFin && nuevoFin > citaInicio;
  });
};

/**
 * Genera todos los slots disponibles para un barbero en un día específico.
 *
 * Pasos:
 * 1. Filtra los bloques de horario del barbero para ese día
 * 2. Para cada bloque, genera slots cada N minutos (duración del servicio)
 * 3. Marca como ocupados los slots que chocan con citas existentes
 *
 * @param {Object} params
 * @param {string} params.barberoNombre  - nombre completo del barbero
 * @param {string} params.diaNum         - número del día ("15")
 * @param {number} params.duracionMin    - duración del servicio en minutos
 * @param {Array}  params.horarios       - bloques de horario del barbero
 * @param {Array}  params.citasExistentes - citas ya agendadas del barbero ese día
 *
 * @returns {Array} slots con { horaInicio, horaFin, ocupado }
 *
 * FUTURO: reemplazar con:
 *   const res = await fetch(`/api/slots?barbero=${barberoNombre}&fecha=${fecha}&duracion=${duracionMin}`);
 *   return await res.json();
 */
export const generarSlots = ({
  barberoNombre,
  diaNum,
  duracionMin,
  horarios,
  citasExistentes = [],
}) => {
  // Bloques disponibles del barbero en ese día
  const bloquesDelDia = horarios.filter(
    (h) =>
      h.barberoNombre === barberoNombre &&
      h.dia === diaNum &&
      h.estado === 'disponible'
  );

  if (bloquesDelDia.length === 0) return [];

  const slots = [];

  bloquesDelDia.forEach((bloque) => {
    const inicioBloque = horaAMinutos(bloque.horaInicio);
    const finBloque    = horaAMinutos(bloque.horaFin);

    let cursor = inicioBloque;

    // Generamos slots del tamaño exacto del servicio
    while (cursor + duracionMin <= finBloque) {
      const slotInicio = cursor;
      const slotFin    = cursor + duracionMin;

      // ¿Este slot choca con alguna cita existente?
      const ocupado = hayConflicto(slotInicio, slotFin, citasExistentes);

      slots.push({
        horaInicio: minutosAHora(slotInicio),
        horaFin:    minutosAHora(slotFin),
        ocupado,
      });

      // Avanzamos exactamente la duración del servicio
      cursor += duracionMin;
    }
  });

  return slots;
};

/**
 * Filtra los barberos que atienden un servicio específico.
 * FUTURO: GET /api/barberos?servicioId=E001
 *
 * @param {Array}  barberos   - lista de todos los barberos
 * @param {string} servicioId - ID del servicio (ej: "E001")
 * @returns {Array} barberos que atienden ese servicio
 */
export const filtrarBarberosPorServicio = (barberos, servicioId) => {
  if (!servicioId) return barberos;
  return barberos.filter((b) => {
    const serviciosDelBarbero = SERVICIOS_POR_BARBERO[b.id] || [b.especialidadId];
    return serviciosDelBarbero.includes(servicioId);
  });
};