// src/services/agendamientoService.js
// ─────────────────────────────────────────────────────────────
// Lógica de slots dinámicos basada en la duración del servicio.
// Compartida entre Agendar.jsx y PerfilBarbero.jsx.
//
// Las duraciones vienen de especialidades.tiempo_estimado a
// través de serviciosService (cache API-first).
//
// FUTURO: la generación de slots vendrá del backend
//   GET /api/slots?barbero=X&fecha=Y&duracion=Z
//   El servidor consultará las citas existentes y devolverá
//   solo los slots libres, con horaInicio y horaFin.
// ─────────────────────────────────────────────────────────────

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
    if (cita.estado === 'cancelada' || cita.estado === 'completada') return false;

    const citaInicio = horaAMinutos(cita.horaInicio || cita.hora || '00:00');
    const citaFin    = horaAMinutos(cita.horaFin    || cita.hora || '00:00');

    return nuevoInicio < citaFin && nuevoFin > citaInicio;
  });
};

/**
 * Genera todos los slots disponibles para un barbero en un día específico.
 *
 * @param {Object} params
 * @param {string} params.barberoNombre  - nombre completo del barbero
 * @param {string} params.diaNum         - número del día ("15")
 * @param {number} params.duracionMin    - duración del servicio en minutos
 * @param {Array}  params.horarios       - bloques de horario del barbero
 * @param {Array}  params.citasExistentes - citas ya agendadas del barbero ese día
 *
 * @returns {Array} slots con { horaInicio, horaFin, ocupado }
 */
export const generarSlots = ({
  barberoNombre,
  diaNum,
  duracionMin,
  horarios,
  citasExistentes = [],
}) => {
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

    while (cursor + duracionMin <= finBloque) {
      const slotInicio = cursor;
      const slotFin    = cursor + duracionMin;

      const ocupado = hayConflicto(slotInicio, slotFin, citasExistentes);

      slots.push({
        horaInicio: minutosAHora(slotInicio),
        horaFin:    minutosAHora(slotFin),
        ocupado,
      });

      cursor += duracionMin;
    }
  });

  return slots;
};

/**
 * Filtra los barberos que atienden un servicio específico.
 * Usa la especialidad principal del barbero (especialidadId).
 *
 * @param {Array}  barberos   - lista de todos los barberos
 * @param {string} servicioId - ID del servicio (ej: "E001")
 * @returns {Array} barberos que atienden ese servicio
 */
export const filtrarBarberosPorServicio = (barberos, servicioId) => {
  if (!servicioId) return barberos;
  return barberos.filter((b) => b.especialidadId === servicioId);
};