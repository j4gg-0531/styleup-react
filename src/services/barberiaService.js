import { api } from './api.js';

const STORAGE_KEY = 'styleup_barberias';

const mapearBarberia = (b) => ({
  id: b.id,
  nombre: b.nombre,
  nombreDueno: b.nombre_dueno,
  direccion: b.direccion,
  ciudad: b.ciudad,
  telefono: b.telefono,
  descripcion: b.descripcion,
  calificacion: Number(b.calificacion || 0),
  totalCalificaciones: b.total_calificaciones || 0,
  lat: b.lat ? Number(b.lat) : null,
  lng: b.lng ? Number(b.lng) : null,
  logoUrl: b.logo_url,
  nit: b.nit,
  correo: b.correo,
  numTrabajadores: b.num_trabajadores,
  fechaRegistro: b.fecha_registro,
  barberoIds: (b.barberia_barberos || []).map((r) => r.barbero?.cedula_barbero).filter(Boolean),
  barberiaBarberos: (b.barberia_barberos || []).map((r) => ({
    id: r.id,
    activo: r.activo,
    fechaIngreso: r.fecha_ingreso,
    barbero: r.barbero ? {
      cedula: r.barbero.cedula_barbero,
      nombre: r.barbero.nombre,
      apellido: r.barbero.apellido,
      telefono: r.barbero.telefono,
      correo: r.barbero.correo,
      calificacion: r.barbero.calificacion ? Number(r.barbero.calificacion) : null,
      totalCalificaciones: r.barbero.total_calificaciones,
      avatarUrl: r.barbero.avatar_url,
      disponibleHoy: r.barbero.disponible_hoy,
      especialidad: r.barbero.especialidades?.especialidad,
      especialidadId: r.barbero.especialidades?.id_especialidad,
    } : null,
  })),
});

function leer() {
  const d = sessionStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : [];
}

function guardar(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const barberiaService = {
  async getTodas() {
    try {
      const data = await api.get('/barberias');
      if (data) {
        const mapped = data.map(mapearBarberia);
        guardar(data);
        return mapped;
      }
    } catch {}
    const cache = leer();
    return cache.length ? cache.map(mapearBarberia) : [];
  },

  async getParaMapa() {
    const todas = await barberiaService.getTodas();
    return todas.filter((b) => b.lat != null && b.lng != null);
  },

  async registrar(datos) {
    const body = {
      nombre: datos.nombre,
      nombre_dueno: datos.nombreDueno || datos.nombre_dueno,
      direccion: datos.direccion,
      ciudad: datos.ciudad,
      telefono: datos.telefono,
      descripcion: datos.descripcion,
      nit: datos.nit,
      correo: datos.correo,
      num_trabajadores: datos.numTrabajadores || datos.num_trabajadores || 1,
      lat: datos.lat,
      lng: datos.lng,
    };
    const response = await api.post('/barberias', body);
    const result = response?.barberia || response;
    if (result) {
      const cache = leer();
      guardar([...cache, result]);
    }
    return mapearBarberia(result || body);
  },

  async getByNombre(nombreDueno) {
    if (!nombreDueno) return null;
    try {
      const data = await api.get(`/barberias/owner/${encodeURIComponent(nombreDueno)}`);
      if (data) {
        const cache = leer();
        const idx = cache.findIndex((b) => b.id === data.id);
        if (idx >= 0) cache[idx] = data;
        else cache.push(data);
        guardar(cache);
        return mapearBarberia(data);
      }
    } catch {}
    const cache = leer();
    const found = cache.find((b) => b.nombre_dueno === nombreDueno);
    return found ? mapearBarberia(found) : null;
  },

  async getById(id) {
    if (!id) return null;
    try {
      const data = await api.get(`/barberias/${id}`);
      if (data) {
        const cache = leer();
        const idx = cache.findIndex((b) => b.id === data.id);
        if (idx >= 0) cache[idx] = data;
        else cache.push(data);
        guardar(cache);
        return mapearBarberia(data);
      }
    } catch {}
    const cache = leer();
    const found = cache.find((b) => b.id === parseInt(id) || b.id === id);
    return found ? mapearBarberia(found) : null;
  },
};
