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

const SYNCED_KEY = 'styleup_barberias_synced';

function leer() {
  const d = sessionStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : [];
}

function guardar(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function syncFromApi() {
  try {
    const data = await api.get('/barberias');
    if (data) {
      guardar(data);
      const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
      synced.all = Date.now();
      sessionStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
    }
  } catch { /* silent */ }
}

function ensureSynced() {
  const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
  if (!synced.all) {
    syncFromApi();
  }
}

export const barberiaService = {

  getTodas() {
    ensureSynced();
    const cache = leer();
    if (cache.length) return cache.map(mapearBarberia);
    return [];
  },

  getParaMapa() {
    return barberiaService.getTodas().filter((b) => b.lat != null && b.lng != null);
  },

  registrar(datos) {
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
    api.post('/barberias', body).then((result) => {
      const mapped = mapearBarberia(result?.barberia || result);
      const cache = leer();
      guardar([...cache, result?.barberia || result]);
      return mapped;
    }).catch(() => {});
    return { ...body, id: Date.now() };
  },

  getByNombre(nombreDueno) {
    if (!nombreDueno) return null;
    ensureSynced();
    const cache = leer();
    const found = cache.find((b) => b.nombre_dueno === nombreDueno);
    if (found) return mapearBarberia(found);
    api.get(`/barberias/owner/${encodeURIComponent(nombreDueno)}`).then((data) => {
      if (data) {
        const cache = leer();
        const idx = cache.findIndex((b) => b.id === data.id);
        if (idx >= 0) cache[idx] = data;
        else cache.push(data);
        guardar(cache);
      }
    }).catch(() => {});
    return {
      id: null, nombre: nombreDueno, nombreDueno,
      direccion: '', ciudad: '', telefono: '', descripcion: '',
      calificacion: 0, totalCalificaciones: 0,
      lat: null, lng: null, logoUrl: null,
      nit: '', correo: '', numTrabajadores: 0, fechaRegistro: null,
      barberoIds: [], barberiaBarberos: [],
    };
  },

  getById(id) {
    if (!id) return null;
    ensureSynced();
    const cache = leer();
    const found = cache.find((b) => b.id === parseInt(id) || b.id === id);
    if (found) return mapearBarberia(found);
    api.get(`/barberias/${id}`).then((data) => {
      if (data) {
        const cache = leer();
        const idx = cache.findIndex((b) => b.id === data.id);
        if (idx >= 0) cache[idx] = data;
        else cache.push(data);
        guardar(cache);
      }
    }).catch(() => {});
    return null;
  },
};
