// src/services/barberiaService.js
// ─────────────────────────────────────────────────────────────
// CAPA DE DATOS — Hoy usa sessionStorage.
// FUTURO: return await fetch('/api/barberias')
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'styleup_barberias';

const leerBarberias = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const guardarBarberias = (barberias) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(barberias));
};

// Ofertas simuladas
// FUTURO: vendrán de la tabla ofertas en la BD
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

export const barberiaService = {

  // Registrar una nueva barbería
  // FUTURO: POST /api/barberias
  registrar: (datos) => {
    const barberias = leerBarberias();
    const nueva = {
      ...datos,
      id: `BAR${Date.now()}`,
      fechaRegistro: new Date().toISOString(),
    };
    guardarBarberias([...barberias, nueva]);
    return nueva;
  },

  // Obtener barbería por nombre (dueño)
  // FUTURO: GET /api/barberias?owner=nombre
  getByNombre: (nombreDueno) => {
    const barberias = leerBarberias();
    return barberias.find((b) => b.nombreDueno === nombreDueno) || null;
  },

  // Obtener todas las ofertas activas
  // FUTURO: GET /api/ofertas?estado=activa
  getOfertas: (barberiaId) => {
    return OFERTAS_MOCK.filter((o) => o.barberia_id === barberiaId);
  },

  // Crear una nueva oferta
  // FUTURO: POST /api/ofertas
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

  // Cerrar una oferta
  // FUTURO: PATCH /api/ofertas/:id/cerrar
  cerrarOferta: (ofertaId) => {
    const oferta = OFERTAS_MOCK.find((o) => o.id === ofertaId);
    if (oferta) oferta.estado = 'cerrada';
  },
};