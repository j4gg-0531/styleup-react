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
const PROPUESTAS_KEY = 'styleup_propuestas';
const STORAGE_KEY_ADMIN = 'styleup_barberia_horarios_admin';

// Mock de horarios para el admin de barbería (PerfilBarberoAdmin)
const HORARIO_ADMIN_MOCK = {
  'Juan Pérez':    { Lun:'09:00–18:00', Mar:'09:00–18:00', Mié:'09:00–18:00', Jue:'09:00–18:00', Vie:'09:00–18:00', Sáb:'09:00–14:00', Dom:'—' },
  'Carlos López':  { Lun:'12:00–20:00', Mar:'12:00–20:00', Mié:'Descanso',    Jue:'12:00–20:00', Vie:'12:00–20:00', Sáb:'10:00–16:00', Dom:'—' },
  'Miguel Torres': { Lun:'Descanso',    Mar:'10:00–18:00', Mié:'10:00–18:00', Jue:'10:00–18:00', Vie:'10:00–18:00', Sáb:'Descanso',    Dom:'—' },
};

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
      esMock:        true,
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

const leerPropuestas = () => {
  const data = sessionStorage.getItem(PROPUESTAS_KEY);
  return data ? JSON.parse(data) : [];
};

const guardarPropuestas = (propuestas) => {
  sessionStorage.setItem(PROPUESTAS_KEY, JSON.stringify(propuestas));
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
  getHorariosByBarbero: (barberoNombre) => {
    const guardados = leerHorarios();
    const reales    = guardados.filter((h) => h.barberoNombre === barberoNombre);
    const mocks     = HORARIOS_MOCK.filter((h) => h.barberoNombre === barberoNombre);

    const diasConReal = new Set(reales.map((h) => h.dia));
    const mocksFiltrados = mocks.filter((m) => !diasConReal.has(m.dia));

    return [...reales, ...mocksFiltrados];
  },

  // Agregar un nuevo bloque de horario
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

  // ── Propuestas de horario (Fase 2) ──────────────────────────────────────

  // Barbero crea una propuesta → notifica a la barbería
  crearPropuesta: (datos) => {
    const propuestas = leerPropuestas();
    const nueva = {
      id: 'prop_' + Date.now().toString(),
      origen: 'barbero',
      barberoNombre: datos.barberoNombre,
      dias: datos.dias,
      nombresDia: datos.nombresDia,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      rango: datos.rango,
      semanaOffset: datos.semanaOffset,
      estado: datos.estado,
      estadoPropuesta: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      fechaRespuesta: null,
    };
    guardarPropuestas([...propuestas, nueva]);

    const barberia = findBarberiaByBarberoNombre(datos.barberoNombre);
    if (barberia) {
      notificacionesService.crear({
        tipo: 'propuesta_horario',
        paraRol: 'barberia',
        paraNombre: barberia.nombreDueno,
        deRol: 'barbero',
        deNombre: datos.barberoNombre,
        mensaje: `${datos.barberoNombre} propuso un nuevo horario (${datos.rango})`,
        metadata: { propuestaId: nueva.id },
      });
    }

    return nueva;
  },

  // Propuestas de un barbero específico
  getPropuestasByBarbero: (barberoNombre) => {
    return leerPropuestas().filter((p) => p.barberoNombre === barberoNombre && p.origen === 'barbero');
  },

  // Propuestas pendientes para una barbería (por nombreDueno)
  getPropuestasByBarberia: (nombreDueno) => {
    const barberia = barberiaService.getByNombre(nombreDueno);
    if (!barberia) return [];
    const barberoNombres = (barberia.barberoIds || [])
      .map((id) => {
        const b = barberosService.getById(id);
        return b ? `${b.nombre} ${b.apellido}` : null;
      })
      .filter(Boolean);

    return leerPropuestas().filter(
      (p) => barberoNombres.includes(p.barberoNombre) && p.estadoPropuesta === 'pendiente' && p.origen === 'barbero'
    );
  },

  // Barbería acepta una propuesta → crea bloques de horario + notifica barbero
  aceptarPropuesta: (propuestaId) => {
    const propuestas = leerPropuestas();
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;

    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;

    propuesta.estadoPropuesta = 'aceptada';
    propuesta.fechaRespuesta = new Date().toISOString();
    guardarPropuestas(propuestas);

    const horarios = leerHorarios();
    const nuevos = propuesta.dias.map((dia, i) => ({
      id: Date.now().toString() + '_' + i,
      barberoNombre: propuesta.barberoNombre,
      dia,
      mes: propuesta.nombresDia[i] || '',
      semanaOffset: propuesta.semanaOffset,
      rango: propuesta.rango,
      horaInicio: propuesta.horaInicio,
      horaFin: propuesta.horaFin,
      estado: propuesta.estado,
      fechaCreacion: new Date().toISOString(),
    }));
    guardarHorarios([...horarios, ...nuevos]);

    const barberia = findBarberiaByBarberoNombre(propuesta.barberoNombre);
    if (barberia) {
      notificacionesService.crear({
        tipo: 'propuesta_aceptada',
        paraRol: 'barbero',
        paraNombre: propuesta.barberoNombre,
        deRol: 'barberia',
        deNombre: barberia.nombreDueno,
        mensaje: `Tu propuesta de horario (${propuesta.rango}) fue aceptada por la barbería`,
        metadata: { propuestaId },
      });
    }

    return { ...propuesta, horariosCreados: nuevos };
  },

  // Barbería rechaza una propuesta → notifica barbero
  rechazarPropuesta: (propuestaId) => {
    const propuestas = leerPropuestas();
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;

    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;

    propuesta.estadoPropuesta = 'rechazada';
    propuesta.fechaRespuesta = new Date().toISOString();
    guardarPropuestas(propuestas);

    const barberia = findBarberiaByBarberoNombre(propuesta.barberoNombre);
    if (barberia) {
      notificacionesService.crear({
        tipo: 'propuesta_rechazada',
        paraRol: 'barbero',
        paraNombre: propuesta.barberoNombre,
        deRol: 'barberia',
        deNombre: barberia.nombreDueno,
        mensaje: `Tu propuesta de horario (${propuesta.rango}) fue rechazada. Edítala y vuelve a enviarla`,
        metadata: { propuestaId },
      });
    }

    return propuesta;
  },

  // ── Propuestas desde la barbería al barbero (Fase 2) ─────────────────

  // Obtiene el horario admin de un barbero (desde storage o mock)
  getHorarioAdmin: (barberoNombre) => {
    const guardado = sessionStorage.getItem(STORAGE_KEY_ADMIN);
    if (guardado) {
      const data = JSON.parse(guardado);
      if (data[barberoNombre]) return data[barberoNombre];
    }
    return { ...(HORARIO_ADMIN_MOCK[barberoNombre] || {}) };
  },

  // Barbería crea una propuesta de horario para un barbero
  crearPropuestaAdmin: (datos) => {
    const propuestas = leerPropuestas();
    const nueva = {
      id: 'prop_admin_' + Date.now().toString(),
      origen: 'barberia',
      barberoNombre: datos.barberoNombre,
      barberiaNombreDueno: datos.barberiaNombreDueno,
      barberiaNombre: datos.barberiaNombre,
      horario: datos.horario,
      estadoPropuesta: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      fechaRespuesta: null,
    };
    guardarPropuestas([...propuestas, nueva]);

    notificacionesService.crear({
      tipo: 'propuesta_admin',
      paraRol: 'barbero',
      paraNombre: datos.barberoNombre,
      deRol: 'barberia',
      deNombre: datos.barberiaNombreDueno,
      mensaje: `${datos.barberiaNombre} te ha enviado una propuesta de horario. Revísala`,
      metadata: { propuestaId: nueva.id },
    });

    return nueva;
  },

  // Propuestas de la barbería (origen: 'barberia') para un barbero
  getPropuestasAdminByBarbero: (barberoNombre) => {
    return leerPropuestas().filter(
      (p) => p.barberoNombre === barberoNombre && p.origen === 'barberia'
    );
  },

  // Barbero acepta la propuesta de la barbería
  aceptarPropuestaAdmin: (propuestaId) => {
    const propuestas = leerPropuestas();
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;

    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;

    propuesta.estadoPropuesta = 'aceptada';
    propuesta.fechaRespuesta = new Date().toISOString();
    guardarPropuestas(propuestas);

    const guardado = sessionStorage.getItem(STORAGE_KEY_ADMIN);
    const data = guardado ? JSON.parse(guardado) : {};
    data[propuesta.barberoNombre] = propuesta.horario;
    sessionStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(data));

    const barberia = findBarberiaByBarberoNombre(propuesta.barberoNombre);
    if (barberia) {
      notificacionesService.crear({
        tipo: 'propuesta_admin_aceptada',
        paraRol: 'barberia',
        paraNombre: barberia.nombreDueno,
        deRol: 'barbero',
        deNombre: propuesta.barberoNombre,
        mensaje: `${propuesta.barberoNombre} aceptó tu propuesta de horario`,
        metadata: { propuestaId },
      });
    }

    return propuesta;
  },

  // Barbero rechaza la propuesta de la barbería
  rechazarPropuestaAdmin: (propuestaId) => {
    const propuestas = leerPropuestas();
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;

    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;

    propuesta.estadoPropuesta = 'rechazada';
    propuesta.fechaRespuesta = new Date().toISOString();
    guardarPropuestas(propuestas);

    const barberia = findBarberiaByBarberoNombre(propuesta.barberoNombre);
    if (barberia) {
      notificacionesService.crear({
        tipo: 'propuesta_admin_rechazada',
        paraRol: 'barberia',
        paraNombre: barberia.nombreDueno,
        deRol: 'barbero',
        deNombre: propuesta.barberoNombre,
        mensaje: `${propuesta.barberoNombre} rechazó tu propuesta de horario`,
        metadata: { propuestaId },
      });
    }

    return propuesta;
  },
};
