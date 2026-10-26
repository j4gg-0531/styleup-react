import { api } from './api.js';

const BARBEROS_KEY = 'styleup_barberos_cache';

const mapearBarbero = (b) => ({
  id: b.cedula_barbero,
  nombre: b.nombre,
  apellido: b.apellido,
  especialidad: b.especialidades?.especialidad || '',
  especialidadId: b.especialidades ? `E${String(b.especialidades.id_especialidad).padStart(3, '0')}` : '',
  direccion: b.direccion || '',
  ciudad: b.ciudad || '',
  telefono: b.telefono || '',
  calificacion: b.calificacion ? Number(b.calificacion) : 0,
  totalCalificaciones: b.total_calificaciones || 0,
  avatar: b.avatar_url || '💈',
  disponibleHoy: b.disponible_hoy ?? true,
  instagram: b.instagram || '',
  tiktok: b.tiktok || '',
  lat: b.lat ? Number(b.lat) : null,
  lng: b.lng ? Number(b.lng) : null,
});

function leer() {
  const d = sessionStorage.getItem(BARBEROS_KEY);
  return d ? JSON.parse(d) : [];
}

function guardar(data) {
  sessionStorage.setItem(BARBEROS_KEY, JSON.stringify(data));
}

let fetchPromise = null;

export const barberosService = {
  async getTodos(forceRefresh = false) {
    if (!forceRefresh && !fetchPromise) {
      fetchPromise = (async () => {
        try {
          const data = await api.get('/barberos');
          if (data) {
            const mapped = data.map(mapearBarbero);
            guardar(mapped);
            return mapped;
          }
        } catch {}
        return leer();
      })();
    }
    if (forceRefresh) {
      try {
        const data = await api.get('/barberos');
        if (data) {
          const mapped = data.map(mapearBarbero);
          guardar(mapped);
          return mapped;
        }
      } catch {}
    }
    const result = fetchPromise ? await fetchPromise : leer();
    return result.length ? result : [];
  },

  async getById(id) {
    try {
      const data = await api.get(`/barberos/${id}`);
      if (data) return mapearBarbero(data);
    } catch {}
    const cache = leer();
    return cache.find((b) => b.id === id) || null;
  },

  getDisponibilidad(barberoNombre, dia, horariosGuardados) {
    return horariosGuardados.filter(
      (h) => h.barberoNombre === barberoNombre &&
             h.dia === dia &&
             h.estado === 'disponible'
    );
  },
};
