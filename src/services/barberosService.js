// src/services/barberosService.js
// ─────────────────────────────────────────────────────────────
// CAPA DE DATOS — Hoy usa datos estáticos simulados.
// FUTURO: return await fetch('/api/barberos')
// ─────────────────────────────────────────────────────────────

const BARBEROS_MOCK = [
  {
    id: 'B001',
    nombre: 'Juan',
    apellido: 'Pérez',
    especialidad: 'Corte a tijera',
    especialidadId: 'E001',
    direccion: 'Calle 10 #5-32',
    ciudad: 'Valledupar',
    telefono: '3009876543',
    // FUTURO: calificacion y totalCalificaciones vendrán calculados desde la BD
    calificacion: 4.5,
    totalCalificaciones: 28,
    avatar: '💈',
    disponibleHoy: true,
    instagram: '@juanperez.barber',
    tiktok: '@juanperez.barber',
    lat: 10.4631,
    lng: -73.2532,
  },
  {
    id: 'B002',
    nombre: 'Carlos',
    apellido: 'López',
    especialidad: 'Afeitado / Fade',
    especialidadId: 'E002',
    direccion: 'Carrera 7 #12-45',
    ciudad: 'Valledupar',
    telefono: '3001234567',
    calificacion: 3.5,
    totalCalificaciones: 15,
    avatar: '✂',
    disponibleHoy: true,
    instagram: '@carloslopez.fades',
    tiktok: '@carloslopez.fades',
    lat: 10.4618,
    lng: -73.2548,
  },
  {
    id: 'B003',
    nombre: 'Miguel',
    apellido: 'Torres',
    especialidad: 'Diseño / Undercut',
    especialidadId: 'E007',
    direccion: 'Avenida 15 #8-20',
    ciudad: 'Valledupar',
    telefono: '3157654321',
    calificacion: 5.0,
    totalCalificaciones: 42,
    avatar: '🧔',
    disponibleHoy: false,
    instagram: '@migueltorres.design',
    tiktok: '@migueltorres.design',
    lat: 10.4652,
    lng: -73.2510,
  },
];

export const barberosService = {
  getTodos: () => BARBEROS_MOCK,

  getById: (id) => BARBEROS_MOCK.find((b) => b.id === id) || null,

  getDisponibilidad: (barberoNombre, dia, horariosGuardados) => {
    return horariosGuardados.filter(
      (h) => h.barberoNombre === barberoNombre &&
             h.dia === dia &&
             h.estado === 'disponible'
    );
  },
};