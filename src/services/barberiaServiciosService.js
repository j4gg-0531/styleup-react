import { api } from './api.js';
import {
  PRECIOS_MINIMOS,
  NOMBRES_SERVICIOS,
  DURACIONES_DEFAULT,
  ICONOS_SERVICIOS,
} from './preciosService.js';

const STORAGE_KEY = 'styleup_barberia_servicios';

const SERVICIO_A_ID = { E001: 1, E002: 2, E004: 3, E006: 4, E007: 5, E008: 6, E009: 7 };

const leer = () => {
  const d = sessionStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : {};
};

const guardar = (data) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('su_user') || '{}'); } catch { return {}; }
}

async function getBarberiaId() {
  try {
    const user = getUser();
    const nombre = user.nombre || '';
    if (nombre) {
      const data = await api.get(`/barberias/owner/${encodeURIComponent(nombre)}`);
      return data?.id;
    }
  } catch {}
  return null;
}

export const barberiaServiciosService = {
  async getServicios(barberiaId) {
    try {
      const bid = barberiaId || await getBarberiaId();
      if (bid) {
        const data = await api.get(`/precios/barberia/${bid}`);
        if (data && data.length) {
          const ID_A_SERVICIO = { 1: 'E001', 2: 'E002', 3: 'E004', 4: 'E006', 5: 'E007', 6: 'E008', 7: 'E009' };
          const result = {};
          for (const p of data) {
            const key = ID_A_SERVICIO[p.id_especialidad];
            if (key) {
              result[key] = {
                precio: Number(p.precio),
                duracion: p.duracion || DURACIONES_DEFAULT[key],
                activo: p.activo !== false,
              };
            }
          }
          const config = leer();
          config[bid] = result;
          guardar(config);
          return completarConDefaults(result);
        }
      }
    } catch {}
    const config = leer();
    const data = config[barberiaId] || {};
    return completarConDefaults(data);
  },

  async guardarServicios(barberiaId, servicios) {
    const config = leer();
    const data = {};
    Object.entries(servicios).forEach(([id, s]) => {
      data[id] = { precio: Number(s.precio), duracion: Number(s.duracion), activo: s.activo };
    });
    config[barberiaId] = data;
    guardar(config);

    const bid = barberiaId || await getBarberiaId();
    if (bid) {
      await api.put(`/precios/barberia/${bid}`, {
        servicios: Object.fromEntries(
          Object.entries(data).map(([sId, s]) => [
            SERVICIO_A_ID[sId],
            { precio: Number(s.precio), duracion: Number(s.duracion), activo: s.activo },
          ])
        ),
      });
    }
    return data;
  },

  getServicio(barberiaId, servicioId) {
    const config = leer();
    const data = config[barberiaId] || {};
    return data[servicioId] || null;
  },
};

function completarConDefaults(data) {
  return Object.keys(NOMBRES_SERVICIOS).reduce((acc, id) => {
    acc[id] = {
      precio: data[id]?.precio ?? PRECIOS_MINIMOS[id],
      duracion: data[id]?.duracion ?? DURACIONES_DEFAULT[id],
      activo: data[id]?.activo !== false,
    };
    return acc;
  }, {});
}

export { PRECIOS_MINIMOS, NOMBRES_SERVICIOS, DURACIONES_DEFAULT, ICONOS_SERVICIOS };
