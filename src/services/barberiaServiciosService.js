// src/services/barberiaServiciosService.js
// ─────────────────────────────────────────────────────────────
// Gestiona los precios y duraciones globales de los servicios
// que ofrece la barbería (sobreescribe los valores por defecto).
// FUTURO: los datos vendrán de /api/barberias/:id/servicios
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'styleup_barberia_servicios';

import {
  PRECIOS_MINIMOS,
  NOMBRES_SERVICIOS,
  DURACIONES_DEFAULT,
  ICONOS_SERVICIOS,
} from './preciosService.js';

const leerConfig = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const guardarConfig = (config) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const barberiaServiciosService = {

  // Obtener la config de servicios de una barbería
  // FUTURO: return await fetch(`/api/barberias/${barberiaId}/servicios`)
  getServicios: (barberiaId) => {
    const config = leerConfig();
    const data = config[barberiaId] || {};

    return Object.keys(NOMBRES_SERVICIOS).reduce((acc, id) => {
      acc[id] = {
        precio:   data[id]?.precio   ?? PRECIOS_MINIMOS[id],
        duracion: data[id]?.duracion ?? DURACIONES_DEFAULT[id],
        activo:   data[id]?.activo   !== false,
      };
      return acc;
    }, {});
  },

  // Guardar la config de servicios de una barbería
  // FUTURO: PUT /api/barberias/:id/servicios { servicios }
  guardarServicios: (barberiaId, servicios) => {
    const config = leerConfig();
    const data = {};
    Object.entries(servicios).forEach(([id, s]) => {
      data[id] = {
        precio:   Number(s.precio),
        duracion: Number(s.duracion),
        activo:   s.activo,
      };
    });
    config[barberiaId] = data;
    guardarConfig(config);
    return data;
  },

  // Obtener la configuración de un servicio específico
  // FUTURO: GET /api/barberias/:id/servicios/:servicioId
  getServicio: (barberiaId, servicioId) => {
    const servicios = barberiaServiciosService.getServicios(barberiaId);
    return servicios[servicioId] || null;
  },
};

export { PRECIOS_MINIMOS, NOMBRES_SERVICIOS, DURACIONES_DEFAULT, ICONOS_SERVICIOS };
