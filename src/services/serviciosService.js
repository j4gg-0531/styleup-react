import { api } from './api.js';

const STORAGE_KEY = 'styleup_servicios_cache';

const DEFAULTS = {
  E001: { nombre: 'Corte a tijera', duracion: 30 },
  E002: { nombre: 'Degradado / Fade', duracion: 25 },
  E003: { nombre: 'Barba clásica', duracion: 0 },
  E004: { nombre: 'Undercut', duracion: 35 },
  E005: { nombre: 'Corte infantil', duracion: 0 },
  E006: { nombre: 'Afeitado con navaja', duracion: 20 },
  E007: { nombre: 'Diseño en cabello', duracion: 40 },
  E008: { nombre: 'Corte + Barba', duracion: 45 },
  E009: { nombre: 'Domicilio', duracion: 60 },
};

const PRECIOS_MINIMOS = {
  E001: 15000, E002: 12000, E006: 10000, E008: 25000,
  E007: 20000, E004: 18000, E009: 30000,
};

const ID_A_SERVICIO = {
  1: 'E001', 2: 'E002', 3: 'E004', 4: 'E006',
  5: 'E007', 6: 'E008', 7: 'E009',
};

function leer() {
  try {
    const d = sessionStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : {};
  } catch { return {}; }
}

function guardar(data) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* silent */ }
}

export const serviciosService = {
  async init() {
    try {
      const data = await api.get('/especialidades');
      if (data && data.length) {
        const map = {};
        for (const e of data) {
          const key = ID_A_SERVICIO[e.id_especialidad];
          if (key) {
            map[key] = {
              nombre: e.especialidad,
              duracion: e.tiempo_estimado || DEFAULTS[key]?.duracion || 30,
            };
          }
        }
        guardar(map);
        return map;
      }
    } catch { /* silent */ }
    const cached = leer();
    if (Object.keys(cached).length) return cached;
    guardar(DEFAULTS);
    return DEFAULTS;
  },

  getDuracion(servicioId) {
    const cache = leer();
    return cache[servicioId]?.duracion ?? DEFAULTS[servicioId]?.duracion ?? 30;
  },

  getNombre(servicioId) {
    const cache = leer();
    return cache[servicioId]?.nombre ?? DEFAULTS[servicioId]?.nombre ?? servicioId;
  },

  getAll() {
    const cache = leer();
    return Object.keys(cache).length ? cache : DEFAULTS;
  },

  getPrecioMinimo(servicioId) {
    return PRECIOS_MINIMOS[servicioId] ?? 0;
  },

  getCodeById(numericId) {
    return ID_A_SERVICIO[numericId] ?? null;
  },

  getIdByCode(servicioCode) {
    const entry = Object.entries(ID_A_SERVICIO).find(([, v]) => v === servicioCode);
    return entry ? Number(entry[0]) : null;
  },
};
