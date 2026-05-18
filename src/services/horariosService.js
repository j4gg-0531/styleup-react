// src/services/horariosService.js
// ─────────────────────────────────────────────────────────────
// CAPA DE DATOS — Hoy usa sessionStorage.
// Cuando conectes el backend solo cambias estas funciones.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'styleup_horarios';

const leerHorarios = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const guardarHorarios = (horarios) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(horarios));
};

export const horariosService = {

  // Obtener horarios de un barbero específico
  // FUTURO: return await fetch(`/api/horarios?barbero=${nombre}`)
  getHorariosByBarbero: (barberoNombre) => {
    const horarios = leerHorarios();
    return horarios.filter((h) => h.barberoNombre === barberoNombre);
  },

  // Agregar un nuevo bloque de horario
  // FUTURO: return await fetch('/api/horarios', { method: 'POST', body: ... })
  agregarHorario: (datos) => {
    const horarios = leerHorarios();
    const nuevo = {
      ...datos,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    guardarHorarios([...horarios, nuevo]);
    return nuevo;
  },

  // Eliminar un bloque de horario
  // FUTURO: return await fetch(`/api/horarios/${id}`, { method: 'DELETE' })
  eliminarHorario: (id) => {
    const horarios = leerHorarios();
    const actualizados = horarios.filter((h) => h.id !== id);
    guardarHorarios(actualizados);
    return actualizados;
  },
};