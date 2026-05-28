// src/services/preciosService.js
// ─────────────────────────────────────────────────────────────
// Maneja los servicios que cada barbero presta: precio, duración
// y si está activo o no.
// FUTURO: los mínimos y el catálogo vendrán de la API.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY        = 'styleup_precios';
const STORAGE_KEY_CONFIG = 'styleup_servicios_config'; // duración + activo por barbero

// ── Catálogo base del sistema ─────────────────────────────────────────────
// FUTURO: vendrá de GET /api/servicios (tabla servicios en BD)
export const PRECIOS_MINIMOS = {
  E001: 15000,
  E002: 12000,
  E006: 10000,
  E008: 25000,
  E007: 20000,
  E004: 18000,
  E009: 30000, // Domicilio — mínimo más alto por el desplazamiento
};

export const NOMBRES_SERVICIOS = {
  E001: 'Corte a tijera',
  E002: 'Degradado / Fade',
  E006: 'Afeitado con navaja',
  E008: 'Corte + Barba',
  E007: 'Diseño en cabello',
  E004: 'Undercut',
  E009: 'Domicilio',
};

// Duración por defecto del sistema para cada servicio (en minutos)
// El barbero puede ajustar su propio valor desde la pantalla de Mis Servicios
// FUTURO: duracion_min en tabla servicios; override en tabla barbero_servicios
export const DURACIONES_DEFAULT = {
  E001: 30,
  E002: 25,
  E006: 20,
  E008: 45,
  E007: 40,
  E004: 35,
  E009: 60, // Domicilio — más tiempo por traslado
};

export const ICONOS_SERVICIOS = {
  E001: '✂',
  E002: '💈',
  E006: '🪒',
  E008: '🧔',
  E007: '🎨',
  E004: '⚡',
  E009: '🏠',
};

// ── Helpers de almacenamiento ─────────────────────────────────────────────

const leerPrecios = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const guardarPrecios = (precios) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(precios));
};

// La "config" guarda duración personalizada y si está activo, por barbero
// Estructura: { "Juan Pérez": { E001: { duracion: 30, activo: true }, ... } }
const leerConfig = () => {
  const data = sessionStorage.getItem(STORAGE_KEY_CONFIG);
  return data ? JSON.parse(data) : {};
};

const guardarConfig = (config) => {
  sessionStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
};

// ── Servicio exportado ────────────────────────────────────────────────────

export const preciosService = {

  // Obtener precios configurados por un barbero
  // FUTURO: return await fetch(`/api/precios?barbero=${nombre}`)
  getPreciosByBarbero: (barberoNombre) => {
    const todos = leerPrecios();
    return todos[barberoNombre] || {};
  },

  // Guardar precios de un barbero (valida mínimos)
  // FUTURO: PUT /api/precios { barbero, precios }
  guardarPreciosBarbero: (barberoNombre, precios) => {
    const todos = leerPrecios();
    const preciosValidados = {};
    Object.entries(precios).forEach(([servicioId, precio]) => {
      const minimo = PRECIOS_MINIMOS[servicioId] || 0;
      preciosValidados[servicioId] = Math.max(Number(precio), minimo);
    });
    todos[barberoNombre] = preciosValidados;
    guardarPrecios(todos);
    return preciosValidados;
  },

  // Obtener precio de un servicio para un barbero
  // Si no lo ha configurado, usa el mínimo del sistema
  getPrecioServicio: (barberoNombre, servicioId) => {
    const precios       = leerPrecios();
    const preciosBarbero = precios[barberoNombre] || {};
    return preciosBarbero[servicioId] || PRECIOS_MINIMOS[servicioId] || 0;
  },

  // ── Configuración de servicios (duración + activo) ────────────────────

  // Obtener la config completa de servicios de un barbero
  // FUTURO: GET /api/barbero-servicios?barbero=${nombre}
  getConfigServicios: (barberoNombre) => {
    const config = leerConfig();
    return config[barberoNombre] || {};
  },

  // Guardar la config completa de servicios de un barbero
  // FUTURO: PUT /api/barbero-servicios { barbero, config }
  guardarConfigServicios: (barberoNombre, configServicios) => {
    const config = leerConfig();
    config[barberoNombre] = configServicios;
    guardarConfig(config);
    return configServicios;
  },

  // Obtener la duración real de un servicio para un barbero
  // Primero busca la personalizada, si no existe usa la del sistema
  // FUTURO: SELECT duracion FROM barbero_servicios WHERE barbero_id=? AND servicio_id=?
  getDuracionServicio: (barberoNombre, servicioId) => {
    const config        = leerConfig();
    const configBarbero = config[barberoNombre] || {};
    return configBarbero[servicioId]?.duracion ?? DURACIONES_DEFAULT[servicioId] ?? 30;
  },

  // ¿El barbero tiene activo este servicio?
  // FUTURO: SELECT activo FROM barbero_servicios WHERE barbero_id=? AND servicio_id=?
  servicioActivo: (barberoNombre, servicioId) => {
    const config        = leerConfig();
    const configBarbero = config[barberoNombre] || {};
    // Si no hay config guardada, todos los servicios están activos por defecto
    if (!configBarbero[servicioId]) return true;
    return configBarbero[servicioId].activo !== false;
  },

  // Obtener solo los IDs de servicios activos de un barbero
  getServiciosActivos: (barberoNombre) => {
    return Object.keys(NOMBRES_SERVICIOS).filter(
      (id) => preciosService.servicioActivo(barberoNombre, id)
    );
  },
};