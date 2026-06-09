import { api } from './api.js';

const STORAGE_KEY = 'styleup_notificaciones';
const SYNCED_KEY = 'styleup_not_synced';

const mapearNotif = (n) => ({
  id: `notif_${n.id}`,
  tipo: n.tipo,
  paraRol: n.para_rol,
  paraNombre: n.para_nombre,
  deRol: n.de_rol,
  deNombre: n.de_nombre,
  mensaje: n.mensaje,
  leida: n.leida || false,
  fechaCreacion: n.fecha_creacion,
  metadata: n.metadata || {},
});

function leer() {
  const d = sessionStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : [];
}

function guardar(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function syncFromApi(rol, nombre) {
  try {
    const data = await api.get(`/notificaciones?rol=${encodeURIComponent(rol)}&nombre=${encodeURIComponent(nombre)}`);
    if (data) {
      guardar(data);
      const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
      synced[`${rol}_${nombre}`] = Date.now();
      sessionStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
    }
  } catch { /* silent */ }
}

export const notificacionesService = {

  crear(datos) {
    api.post('/notificaciones', {
      tipo: datos.tipo, paraRol: datos.paraRol,
      paraNombre: datos.paraNombre, deRol: datos.deRol,
      deNombre: datos.deNombre, mensaje: datos.mensaje,
      metadata: datos.metadata,
    }).then((result) => {
      const notif = result?.notificacion || result;
      if (notif) {
        const cache = leer();
        guardar([...cache, notif]);
      }
    }).catch(() => {});
    return mapearNotif({ ...datos, id: Date.now(), leida: false, fecha_creacion: new Date().toISOString() });
  },

  getByUsuario(rol, nombre) {
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    if (!synced[`${rol}_${nombre}`]) syncFromApi(rol, nombre);
    return leer().filter((n) => n.para_rol === rol && n.para_nombre === nombre).map(mapearNotif);
  },

  getNoLeidas(rol, nombre) {
    return notificacionesService.getByUsuario(rol, nombre).filter((n) => !n.leida);
  },

  getCountNoLeidas(rol, nombre) {
    return notificacionesService.getNoLeidas(rol, nombre).length;
  },

  marcarLeida(id) {
    const numId = id.replace(/^notif_/, '');
    const cache = leer();
    guardar(cache.map((n) =>
      String(n.id) === numId ? { ...n, leida: true } : n
    ));
    api.patch(`/notificaciones/${numId}/leer`).catch(() => {});
  },

  marcarTodasLeidas(rol, nombre) {
    const cache = leer();
    guardar(cache.map((n) =>
      n.para_rol === rol && n.para_nombre === nombre ? { ...n, leida: true } : n
    ));
    api.post('/notificaciones/leer-todas', { rol, nombre }).catch(() => {});
  },
};
