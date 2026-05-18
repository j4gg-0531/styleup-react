// src/services/preciosService.js
// ─────────────────────────────────────────────────────────────
// Maneja los precios que cada barbero define por servicio.
// Cada servicio tiene un precio mínimo para competencia justa.
// FUTURO: los mínimos vendrán de la API del administrador.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'styleup_precios';

// Precios mínimos definidos por el sistema (no los puede bajar el barbero)
// FUTURO: estos vendrán de una tabla de configuración en la base de datos
export const PRECIOS_MINIMOS = {
  E001: 15000, // Corte a tijera
  E002: 12000, // Degradado / Fade
  E006: 10000, // Afeitado con navaja
  E008: 25000, // Corte + Barba
  E007: 20000, // Diseño en cabello
  E004: 18000, // Undercut
};

export const NOMBRES_SERVICIOS = {
  E001: 'Corte a tijera',
  E002: 'Degradado / Fade',
  E006: 'Afeitado con navaja',
  E008: 'Corte + Barba',
  E007: 'Diseño en cabello',
  E004: 'Undercut',
};

const leerPrecios = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const guardarPrecios = (precios) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(precios));
};

export const preciosService = {

  // Obtener los precios configurados por un barbero
  // Retorna objeto: { E001: 18000, E002: 15000, ... }
  // FUTURO: return await fetch(`/api/precios?barbero=${nombre}`)
  getPreciosByBarbero: (barberoNombre) => {
    const todos = leerPrecios();
    return todos[barberoNombre] || {};
  },

  // Guardar los precios de un barbero
  // FUTURO: return await fetch('/api/precios', { method: 'PUT', body: ... })
  guardarPreciosBarbero: (barberoNombre, precios) => {
    const todos = leerPrecios();

    // Validar que ningún precio esté por debajo del mínimo
    const preciosValidados = {};
    Object.entries(precios).forEach(([servicioId, precio]) => {
      const minimo = PRECIOS_MINIMOS[servicioId] || 0;
      preciosValidados[servicioId] = Math.max(Number(precio), minimo);
    });

    todos[barberoNombre] = preciosValidados;
    guardarPrecios(todos);
    return preciosValidados;
  },

  // Obtener precio de un servicio específico para un barbero
  getPrecioServicio: (barberoNombre, servicioId) => {
    const precios = leerPrecios();
    const preciosBarbero = precios[barberoNombre] || {};
    // Si el barbero no ha definido precio, usa el mínimo
    return preciosBarbero[servicioId] || PRECIOS_MINIMOS[servicioId] || 0;
  },
};