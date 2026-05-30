// src/services/ofertasService.js
// ─────────────────────────────────────────────────────────────
// Maneja ofertas de trabajo y aplicaciones de barberos.
// FUTURO: reemplazar con llamadas a /api/ofertas y /api/aplicaciones
// ─────────────────────────────────────────────────────────────

import { notificacionesService } from './notificacionesService.js';

const KEY_OFERTAS      = 'styleup_ofertas';
const KEY_APLICACIONES = 'styleup_aplicaciones';

// ── Ofertas mock iniciales ────────────────────────────────────
const OFERTAS_INICIALES = [
  {
    id: 'OF001',
    barberiaId: 'BAR001',
    barberiaNombre: 'BarberShop Style',
    titulo: 'Barbero especialista en degradados',
    descripcion: 'Buscamos barbero con experiencia en degradados y fade. Buen ambiente laboral, clientela fija.',
    tipoContratacion: 'comision',
    condicionEconomica: '60% para el barbero',
    horario: 'Lunes a sábado, 9am – 7pm',
    vacantes: 2,
    especialidadesBuscadas: ['Fade', 'Degradado'],
    experienciaRequerida: '2_anos',
    herramientasPropias: true,
    fechaLimite: '2026-06-30',
    estado: 'activa',
    fecha: '2026-05-20',
  },
  {
    id: 'OF002',
    barberiaId: 'BAR001',
    barberiaNombre: 'BarberShop Style',
    titulo: 'Barbero para turno de tarde',
    descripcion: 'Necesitamos barbero para cubrir turno de 2pm a 8pm de lunes a sábado.',
    tipoContratacion: 'salario_fijo',
    condicionEconomica: '$1.800.000 mensual',
    horario: 'Lunes a sábado, 2pm – 8pm',
    vacantes: 1,
    especialidadesBuscadas: ['Corte clásico', 'Tijera'],
    experienciaRequerida: '1_ano',
    herramientasPropias: false,
    fechaLimite: '2026-06-15',
    estado: 'activa',
    fecha: '2026-05-18',
  },
];

// ── Helpers internos ──────────────────────────────────────────

const leerOfertas = () => {
  const data = sessionStorage.getItem(KEY_OFERTAS);
  // Si no hay nada guardado aún, usamos los mocks
  return data ? JSON.parse(data) : OFERTAS_INICIALES;
};

const guardarOfertas = (ofertas) => {
  sessionStorage.setItem(KEY_OFERTAS, JSON.stringify(ofertas));
};

const leerAplicaciones = () => {
  const data = sessionStorage.getItem(KEY_APLICACIONES);
  return data ? JSON.parse(data) : [];
};

const guardarAplicaciones = (aplicaciones) => {
  sessionStorage.setItem(KEY_APLICACIONES, JSON.stringify(aplicaciones));
};

// ── Servicio exportado ────────────────────────────────────────

export const ofertasService = {

  // Obtener todas las ofertas activas (para barberos)
  // FUTURO: GET /api/ofertas?estado=activa
  getOfertasActivas: () => {
    return leerOfertas().filter((o) => o.estado === 'activa');
  },

  // Obtener ofertas de una barbería específica
  // FUTURO: GET /api/ofertas?barberiaId=X
  getOfertasByBarberia: (barberiaId) => {
    return leerOfertas().filter((o) => o.barberiaId === barberiaId);
  },

  // Crear nueva oferta
  // FUTURO: POST /api/ofertas
  crearOferta: (datos) => {
    const ofertas = leerOfertas();
    const nueva = {
      ...datos,
      id: `OF${Date.now()}`,
      estado: 'activa',
      fecha: new Date().toISOString().split('T')[0],
    };
    guardarOfertas([...ofertas, nueva]);
    return nueva;
  },

  // Cerrar una oferta
  // FUTURO: PATCH /api/ofertas/:id { estado: 'cerrada' }
  cerrarOferta: (ofertaId) => {
    const ofertas = leerOfertas().map((o) =>
      o.id === ofertaId ? { ...o, estado: 'cerrada' } : o
    );
    guardarOfertas(ofertas);
  },

  // ── Aplicaciones ─────────────────────────────────────────────

  // Barbero aplica a una oferta (adjunta su hoja de vida)
  // FUTURO: POST /api/aplicaciones
  aplicar: (ofertaId, barberoNombre, hojaDeVida) => {
    const aplicaciones = leerAplicaciones();

    // Evita aplicaciones duplicadas
    const yaAplicó = aplicaciones.some(
      (a) => a.ofertaId === ofertaId && a.barberoNombre === barberoNombre
    );
    if (yaAplicó) return null;

    const nueva = {
      id: `AP${Date.now()}`,
      ofertaId,
      barberoNombre,
      hojaDeVida,   // objeto completo con todas las secciones
      estado: 'pendiente',  // pendiente | aceptada | rechazada
      fecha: new Date().toISOString().split('T')[0],
    };
    guardarAplicaciones([...aplicaciones, nueva]);

    const oferta = leerOfertas().find((o) => o.id === ofertaId);
    if (oferta) {
      notificacionesService.crear({
        tipo: 'aplicacion_nueva',
        paraRol: 'barberia',
        paraNombre: oferta.barberiaNombre,
        deRol: 'barbero',
        deNombre: barberoNombre,
        mensaje: `${barberoNombre} aplicó a tu oferta "${oferta.titulo}"`,
        metadata: { ofertaId, aplicacionId: nueva.id },
      });
    }

    return nueva;
  },

  // Obtener aplicaciones de un barbero (para que vea el estado)
  // FUTURO: GET /api/aplicaciones?barbero=X
  getAplicacionesByBarbero: (barberoNombre) => {
    return leerAplicaciones().filter((a) => a.barberoNombre === barberoNombre);
  },

  // Obtener aplicaciones recibidas para una oferta (para la barbería)
  // FUTURO: GET /api/aplicaciones?ofertaId=X
  getAplicacionesByOferta: (ofertaId) => {
    return leerAplicaciones().filter((a) => a.ofertaId === ofertaId);
  },

  // Cambiar estado de una aplicación (barbería acepta o rechaza)
  // FUTURO: PATCH /api/aplicaciones/:id { estado }
  cambiarEstadoAplicacion: (aplicacionId, nuevoEstado) => {
    const aplicaciones = leerAplicaciones().map((a) =>
      a.id === aplicacionId ? { ...a, estado: nuevoEstado } : a
    );
    guardarAplicaciones(aplicaciones);

    const aplicacion = leerAplicaciones().find((a) => a.id === aplicacionId);
    if (aplicacion) {
      const oferta = leerOfertas().find((o) => o.id === aplicacion.ofertaId);
      const veredicto = nuevoEstado === 'aceptada' ? 'aceptada' : 'rechazada';
      notificacionesService.crear({
        tipo: nuevoEstado === 'aceptada' ? 'aplicacion_aceptada' : 'aplicacion_rechazada',
        paraRol: 'barbero',
        paraNombre: aplicacion.barberoNombre,
        deRol: 'barberia',
        deNombre: oferta?.barberiaNombre || 'Barbería',
        mensaje: nuevoEstado === 'aceptada'
          ? `¡Felicidades! Tu aplicación para "${oferta?.titulo || 'la oferta'}" fue ACEPTADA`
          : `Tu aplicación para "${oferta?.titulo || 'la oferta'}" fue RECHAZADA`,
        metadata: { ofertaId: aplicacion.ofertaId, aplicacionId },
      });
    }
  },
};