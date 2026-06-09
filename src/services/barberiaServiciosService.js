import { api } from './api.js';
import { serviciosService } from './serviciosService.js';

const STORAGE_KEY = 'styleup_barberia_servicios';

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

function completarConDefaults(data) {
  const todos = serviciosService.getAll();
  return Object.keys(todos).reduce((acc, id) => {
    acc[id] = {
      precio: data[id]?.precio ?? serviciosService.getPrecioMinimo(id),
      duracion: data[id]?.duracion ?? serviciosService.getDuracion(id),
      activo: data[id]?.activo !== false,
    };
    return acc;
  }, {});
}

export const barberiaServiciosService = {
  async getServicios(barberiaId) {
    try {
      const bid = barberiaId || await getBarberiaId();
      if (bid) {
        const data = await api.get(`/precios/barberia/${bid}`);
        if (data && data.length) {
          const result = {};
          for (const p of data) {
            const key = serviciosService.getCodeById(p.id_especialidad);
            if (key) {
              result[key] = {
                precio: Number(p.precio),
                duracion: p.duracion || serviciosService.getDuracion(key),
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
            serviciosService.getIdByCode(sId),
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
