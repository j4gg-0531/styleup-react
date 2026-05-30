// src/services/barberiaService.js
const STORAGE_KEY = 'styleup_barberias';

const leerBarberias = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const guardarBarberias = (barberias) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(barberias));
};

// Barberías mock para desarrollo — simulan datos reales con ubicación
// FUTURO: vendrán de GET /api/barberias
const BARBERIAS_MOCK = [
  {
    id: 'BAR001',
    nombre: 'BarberShop Style',
    nombreDueno: 'styleup',
    direccion: 'Calle 16 #9-45',
    ciudad: 'Valledupar',
    telefono: '3001234567',
    descripcion: 'Barbería profesional en el centro de Valledupar.',
    calificacion: 4.5,
    totalCalificaciones: 38,
    lat: 10.4635,
    lng: -73.2518,
    // Barberos que trabajan aquí — por ID (relación BD futura: barberias_barberos)
    barberoIds: ['B001', 'B002'],
  },
  {
    id: 'BAR002',
    nombre: 'Classic Cuts',
    nombreDueno: 'classiccuts',
    direccion: 'Carrera 9 #13-22',
    ciudad: 'Valledupar',
    telefono: '3009876543',
    descripcion: 'Especialistas en cortes clásicos y afeitado tradicional.',
    calificacion: 4.2,
    totalCalificaciones: 22,
    lat: 10.4648,
    lng: -73.2540,
    barberoIds: ['B003'],
  },
  {
    id: 'BAR003',
    nombre: 'Urban Barber',
    nombreDueno: 'urbanbarber',
    direccion: 'Avenida Simón Bolívar #8-10',
    ciudad: 'Valledupar',
    telefono: '3157654321',
    descripcion: 'Estilo urbano y moderno para el hombre contemporáneo.',
    calificacion: 4.8,
    totalCalificaciones: 55,
    lat: 10.4620,
    lng: -73.2505,
    barberoIds: [],
  },
];

export const barberiaService = {

  // Obtener todas las barberías (mock + registradas en sesión)
  // FUTURO: GET /api/barberias
  getTodas: () => {
    const registradas = leerBarberias();
    return [...BARBERIAS_MOCK, ...registradas];
  },

  // Obtener solo las que tienen coordenadas (para el mapa)
  // FUTURO: GET /api/barberias?conUbicacion=true
  getParaMapa: () => {
    return barberiaService.getTodas().filter(
      (b) => b.lat != null && b.lng != null
    );
  },

  // Registrar una nueva barbería
  // FUTURO: POST /api/barberias
  registrar: (datos) => {
    const barberias = leerBarberias();
    const nueva = {
      ...datos,
      id: `BAR${Date.now()}`,
    barberoIds: [],
      calificacion: 0,
      totalCalificaciones: 0,
      fechaRegistro: new Date().toISOString(),
    };
    guardarBarberias([...barberias, nueva]);
    return nueva;
  },

  // Obtener barbería por nombre del dueño
  // FUTURO: GET /api/barberias?owner=nombre
  getByNombre: (nombreDueno) => {
    return barberiaService.getTodas().find(
      (b) => b.nombreDueno === nombreDueno
    ) || null;
  },

  // Obtener barbería por ID
  // FUTURO: GET /api/barberias/:id
  getById: (id) => {
    return barberiaService.getTodas().find((b) => b.id === id) || null;
  },

  // Ofertas
  getOfertas: (barberiaId) => {
    return OFERTAS_MOCK.filter((o) => o.barberia_id === barberiaId);
  },

  crearOferta: (datos) => {
    const nueva = {
      ...datos,
      id: `OF${Date.now()}`,
      estado: 'activa',
      fecha: new Date().toISOString().split('T')[0],
    };
    OFERTAS_MOCK.push(nueva);
    return nueva;
  },

  cerrarOferta: (ofertaId) => {
    const oferta = OFERTAS_MOCK.find((o) => o.id === ofertaId);
    if (oferta) oferta.estado = 'cerrada';
  },
};

const OFERTAS_MOCK = [
  {
    id: 'OF001',
    barberia_id: 'BAR001',
    titulo: 'Barbero especialista en degradados',
    descripcion: 'Buscamos barbero con experiencia en degradados y fade. Ofrecemos comisión del 60%.',
    estado: 'activa',
    fecha: '2026-05-20',
    requisitos: ['Mínimo 2 años de experiencia', 'Conocimiento en fade y degradado'],
  },
  {
    id: 'OF002',
    barberia_id: 'BAR001',
    titulo: 'Barbero para turno de tarde',
    descripcion: 'Necesitamos barbero para cubrir turno de 2pm a 8pm de lunes a sábado.',
    estado: 'activa',
    fecha: '2026-05-18',
    requisitos: ['Disponibilidad tarde', 'Experiencia en cortes clásicos'],
  },
];