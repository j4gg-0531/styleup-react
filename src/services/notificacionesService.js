import { api } from './api.js';

const STORAGE_KEY = 'styleup_notificaciones';

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

export const notificacionesService = {
  async crear(datos) {
    const response = await api.post('/notificaciones', {
      tipo: datos.tipo,
      paraRol: datos.paraRol,
      paraNombre: datos.paraNombre,
      deRol: datos.deRol,
      deNombre: datos.deNombre,
      mensaje: datos.mensaje,
      metadata: datos.metadata,
    });
    const notif = response?.notificacion || response;
    if (notif) {
      const cache = leer();
      guardar([...cache, notif]);
      return mapearNotif(notif);
    }
    return mapearNotif({ ...datos, id: Date.now(), leida: false, fecha_creacion: new Date().toISOString() });
  },

  async getByUsuario(rol, nombre) {
    try {
      const data = await api.get(`/notificaciones?rol=${encodeURIComponent(rol)}&nombre=${encodeURIComponent(nombre)}`);
      if (data) {
        guardar(data);
        return data.filter((n) => n.para_rol === rol && n.para_nombre === nombre).map(mapearNotif);
      }
    } catch {}
    return leer().filter((n) => n.para_rol === rol && n.para_nombre === nombre).map(mapearNotif);
  },

  async getNoLeidas(rol, nombre) {
    const todas = await notificacionesService.getByUsuario(rol, nombre);
    return todas.filter((n) => !n.leida);
  },

  async getCountNoLeidas(rol, nombre) {
    const noLeidas = await notificacionesService.getNoLeidas(rol, nombre);
    return noLeidas.length;
  },

  async marcarLeida(id) {
    const numId = id.replace(/^notif_/, '');
    await api.patch(`/notificaciones/${numId}/leer`);
    const cache = leer();
    guardar(cache.map((n) =>
      String(n.id) === numId ? { ...n, leida: true } : n
    ));
  },

  async marcarTodasLeidas(rol, nombre) {
    await api.post('/notificaciones/leer-todas', { rol, nombre });
    const cache = leer();
    guardar(cache.map((n) =>
      n.para_rol === rol && n.para_nombre === nombre ? { ...n, leida: true } : n
    ));
  },
};
