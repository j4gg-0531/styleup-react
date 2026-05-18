// src/services/citasService.js
// ─────────────────────────────────────────────────────────────
// CAPA DE DATOS — Hoy usa sessionStorage para simular la base
// de datos. Cuando conectes el backend, solo cambias las
// funciones de aquí; los componentes no se tocan.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'styleup_citas';

// Lee todas las citas del almacenamiento
const leerCitas = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Guarda el arreglo completo de citas
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
  // FUTURO: return await fetch('/api/citas', { method: 'POST', body: ... })
  agregarCita: (datosCita) => {
    const citas = leerCitas();
    const nuevaCita = {
      ...datosCita,
      id: Date.now().toString(), // FUTURO: el id lo genera la base de datos
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

  // Completar una cita (solo el barbero lo hará, preparado para después)
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
};