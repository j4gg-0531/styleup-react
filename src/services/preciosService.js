import { api } from './api.js';
import { serviciosService } from './serviciosService.js';

const PRECIOS_KEY = 'styleup_precios';
const CONFIG_KEY = 'styleup_servicios_config';

function leer(key) {
  const d = sessionStorage.getItem(key);
  return d ? JSON.parse(d) : {};
}

function guardar(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('su_user') || '{}'); } catch { return {}; }
}

export const preciosService = {
  async getPreciosByBarbero(barberoNombre) {
    const user = getUser();
    const cedula = user.cedula || barberoNombre;
    if (cedula && user.token) {
      try {
        const data = await api.get(`/precios/${cedula}`);
        if (data && data.length) {
          const result = {};
          for (const p of data) {
            const key = serviciosService.getCodeById(p.id_especialidad);
            if (key) result[key] = Number(p.precio);
          }
          const todosPrecios = leer(PRECIOS_KEY);
          todosPrecios[cedula] = result;
          guardar(PRECIOS_KEY, todosPrecios);
          return result;
        }
      } catch {}
    }
    const todos = leer(PRECIOS_KEY);
    return todos[cedula] || todos[barberoNombre] || {};
  },

  async guardarPreciosBarbero(barberoNombre, precios) {
    const user = getUser();
    const cedula = user.cedula || barberoNombre;
    const preciosValidados = {};
    Object.entries(precios).forEach(([servicioId, precio]) => {
      const minimo = serviciosService.getPrecioMinimo(servicioId);
      preciosValidados[servicioId] = Math.max(Number(precio), minimo);
    });
    const todos = leer(PRECIOS_KEY);
    todos[cedula] = preciosValidados;
    guardar(PRECIOS_KEY, todos);
    const config = leer(CONFIG_KEY);
    await api.put(`/precios/${cedula}/config`, {
      servicios: Object.fromEntries(
        Object.entries({ ...preciosValidados, ...(config[cedula] || {}) }).map(([sId]) => {
          const id = serviciosService.getIdByCode(sId);
          if (!id) return [sId, {}];
          const cfg = (config[cedula] || {})[sId] || {};
          return [
            id,
            { precio: preciosValidados[sId] || serviciosService.getPrecioMinimo(sId), duracion: cfg.duracion || serviciosService.getDuracion(sId), activo: cfg.activo !== false },
          ];
        })
      ),
    });
    return preciosValidados;
  },

  getPrecioServicio(barberoNombre, servicioId) {
    const precios = leer(PRECIOS_KEY);
    const user = getUser();
    const cedula = user.cedula || barberoNombre;
    const p = precios[cedula] || precios[barberoNombre] || {};
    return p[servicioId] || serviciosService.getPrecioMinimo(servicioId) || 0;
  },

  async getConfigServicios(barberoNombre) {
    const user = getUser();
    const cedula = user.cedula || barberoNombre;
    if (cedula && user.token) {
      try {
        const data = await api.get(`/precios/${cedula}`);
        if (data && data.length) {
          const configResult = {};
          for (const p of data) {
            const key = serviciosService.getCodeById(p.id_especialidad);
            if (key) {
              configResult[key] = {
                duracion: p.duracion || serviciosService.getDuracion(key),
                activo: p.activo !== false,
              };
            }
          }
          const todasConfig = leer(CONFIG_KEY);
          todasConfig[cedula] = configResult;
          guardar(CONFIG_KEY, todasConfig);
          return configResult;
        }
      } catch {}
    }
    const config = leer(CONFIG_KEY);
    const result = config[cedula] || config[barberoNombre] || {};
    if (Object.keys(result).length === 0) {
      const todos = serviciosService.getAll();
      return Object.keys(todos).reduce((acc, id) => {
        acc[id] = { duracion: todos[id].duracion, activo: true };
        return acc;
      }, {});
    }
    return result;
  },

  async guardarConfigServicios(barberoNombre, configServicios) {
    const user = getUser();
    const cedula = user.cedula || barberoNombre;
    const config = leer(CONFIG_KEY);
    config[cedula] = configServicios;
    guardar(CONFIG_KEY, config);
    const precios = leer(PRECIOS_KEY);
    await api.put(`/precios/${cedula}/config`, {
      servicios: Object.fromEntries(
        Object.entries(configServicios).map(([sId, s]) => [
          serviciosService.getIdByCode(sId),
          { precio: Number((precios[cedula] || {})[sId] || serviciosService.getPrecioMinimo(sId)), duracion: Number(s.duracion), activo: s.activo },
        ])
      ),
    });
    return configServicios;
  },

  getDuracionServicio(barberoNombre, servicioId) {
    const config = leer(CONFIG_KEY);
    const user = getUser();
    const cedula = user.cedula || barberoNombre;
    const cfg = (config[cedula] || config[barberoNombre] || {})[servicioId];
    return cfg?.duracion ?? serviciosService.getDuracion(servicioId);
  },

  servicioActivo(barberoNombre, servicioId) {
    const config = leer(CONFIG_KEY);
    const user = getUser();
    const cedula = user.cedula || barberoNombre;
    const cfg = (config[cedula] || config[barberoNombre] || {})[servicioId];
    if (!cfg) return true;
    return cfg.activo !== false;
  },

  async getServiciosActivos(barberoNombre) {
    const config = await preciosService.getConfigServicios(barberoNombre);
    const todos = serviciosService.getAll();
    return Object.keys(todos).filter((id) => config[id]?.activo !== false);
  },
};
