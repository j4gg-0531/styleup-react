import { api } from './api.js';

export const PRECIOS_MINIMOS = {
  E001: 15000, E002: 12000, E006: 10000, E008: 25000,
  E007: 20000, E004: 18000, E009: 30000,
};

export const NOMBRES_SERVICIOS = {
  E001: 'Corte a tijera', E002: 'Degradado / Fade', E006: 'Afeitado con navaja',
  E008: 'Corte + Barba', E007: 'Diseño en cabello', E004: 'Undercut', E009: 'Domicilio',
};

export const DURACIONES_DEFAULT = {
  E001: 30, E002: 25, E006: 20, E008: 45, E007: 40, E004: 35, E009: 60,
};

export const ICONOS_SERVICIOS = {
  E001: '✂', E002: '💈', E006: '🪒', E008: '🧔', E007: '🎨', E004: '⚡', E009: '🏠',
};

const PRECIOS_KEY = 'styleup_precios';
const CONFIG_KEY = 'styleup_servicios_config';

const ID_A_SERVICIO = { 1: 'E001', 2: 'E002', 3: 'E004', 4: 'E006', 5: 'E007', 6: 'E008', 7: 'E009' };
const SERVICIO_A_ID = Object.fromEntries(Object.entries(ID_A_SERVICIO).map(([k, v]) => [v, Number(k)]));

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
            const key = ID_A_SERVICIO[p.id_especialidad];
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
      const minimo = PRECIOS_MINIMOS[servicioId] || 0;
      preciosValidados[servicioId] = Math.max(Number(precio), minimo);
    });
    const todos = leer(PRECIOS_KEY);
    todos[cedula] = preciosValidados;
    guardar(PRECIOS_KEY, todos);
    const config = leer(CONFIG_KEY);
    await api.put(`/precios/${cedula}/config`, {
      servicios: Object.fromEntries(
        Object.entries({ ...preciosValidados, ...(config[cedula] || {}) }).map(([sId]) => {
          const id = SERVICIO_A_ID[sId];
          if (!id) return [sId, {}];
          const cfg = (config[cedula] || {})[sId] || {};
          return [
            id,
            { precio: preciosValidados[sId] || PRECIOS_MINIMOS[sId], duracion: cfg.duracion || DURACIONES_DEFAULT[sId], activo: cfg.activo !== false },
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
    return p[servicioId] || PRECIOS_MINIMOS[servicioId] || 0;
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
            const key = ID_A_SERVICIO[p.id_especialidad];
            if (key) {
              configResult[key] = {
                duracion: p.duracion || DURACIONES_DEFAULT[key],
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
      return Object.keys(NOMBRES_SERVICIOS).reduce((acc, id) => {
        acc[id] = { duracion: DURACIONES_DEFAULT[id], activo: true };
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
          SERVICIO_A_ID[sId],
          { precio: Number((precios[cedula] || {})[sId] || PRECIOS_MINIMOS[sId]), duracion: Number(s.duracion), activo: s.activo },
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
    return cfg?.duracion ?? DURACIONES_DEFAULT[servicioId] ?? 30;
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
    return Object.keys(NOMBRES_SERVICIOS).filter((id) => config[id]?.activo !== false);
  },
};
