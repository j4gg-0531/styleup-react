// src/services/citasService.js
// ─────────────────────────────────────────────────────────────
// CAPA DE DATOS — Hoy usa sessionStorage para simular la base
// de datos. Cuando conectes el backend, solo cambias las
// funciones de aquí; los componentes no se tocan.
//
// CAMBIOS v2:
// - agregarCita ahora guarda horaFin además de horaInicio
// - nuevo método: getSlotsBloqueados (para validación de conflictos)
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'styleup_citas';

const leerCitas = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const guardarCitas = (citas) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
};

export const citasService = {

  // Obtener citas de un cliente específico
  // FUTURO: return await fetch(`/api/citas?cliente=${nombre}`)
  getCitasByCliente: (clienteNombre) => {
    const citas = leerCitas();
    return citas.filter((c) => c.clienteNombre === clienteNombre);
  },

  // Agregar una nueva cita
  // Ahora guarda horaInicio y horaFin para validación de conflictos
  // FUTURO: return await fetch('/api/citas', { method: 'POST', body: ... })
  //   La BD guarda: fecha (DATE), hora_inicio (TIME), hora_fin (TIME)
  agregarCita: (datosCita) => {
    const citas = leerCitas();
    const { servicio, ...resto } = datosCita;
    const nuevaCita = {
      ...resto,
      servicio: servicio
        ? { id: servicio.id, name: servicio.name, dur: servicio.dur }
        : servicio,
      horaInicio: datosCita.horaInicio || datosCita.hora,
      id: Date.now().toString(),
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    };
    guardarCitas([...citas, nuevaCita]);
    return nuevaCita;
  },

  // Cancelar una cita (solo cambia el estado)
  // FUTURO: return await fetch(`/api/citas/${id}/cancelar`, { method: 'PATCH' })
  cancelarCita: (citaId) => {
    const citas = leerCitas();
    const actualizadas = citas.map((c) =>
      c.id === citaId ? { ...c, estado: 'cancelada' } : c
    );
    guardarCitas(actualizadas);
    return actualizadas;
  },

  // Completar una cita
  // FUTURO: return await fetch(`/api/citas/${id}/completar`, { method: 'PATCH' })
  completarCita: (citaId) => {
    const citas = leerCitas();
    const actualizadas = citas.map((c) =>
      c.id === citaId ? { ...c, estado: 'completada' } : c
    );
    guardarCitas(actualizadas);
    return actualizadas;
  },

  // Obtener citas asignadas a un barbero específico
  // FUTURO: return await fetch(`/api/citas?barbero=${nombre}`)
  getCitasByBarbero: (barberoNombre) => {
    const citas = leerCitas();
    return citas.filter((c) => c.barbero?.name === barberoNombre);
  },

  // Obtener citas de un barbero en un día específico
  // Usado para validar conflictos antes de mostrar los slots
  // FUTURO: return await fetch(`/api/citas?barbero=${nombre}&dia=${dia}`)
  getCitasBarberoEnDia: (barberoNombre, diaNum) => {
    const citas = leerCitas();
    return citas.filter(
      (c) =>
        c.barbero?.name === barberoNombre &&
        c.fechaDia === diaNum &&
        c.estado !== 'cancelada' &&
        c.estado !== 'completada'
    );
  },
};