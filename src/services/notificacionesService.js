const STORAGE_KEY = 'styleup_notificaciones';

const leer = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const guardar = (notificaciones) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(notificaciones));
};

export const notificacionesService = {
  crear: (datos) => {
    const notificaciones = leer();
    const nueva = {
      id: 'notif_' + Date.now().toString(),
      tipo: datos.tipo,
      paraRol: datos.paraRol,
      paraNombre: datos.paraNombre,
      deRol: datos.deRol,
      deNombre: datos.deNombre,
      mensaje: datos.mensaje,
      leida: false,
      fechaCreacion: new Date().toISOString(),
      metadata: datos.metadata || {},
    };
    guardar([nueva, ...notificaciones]);
    return nueva;
  },

  getByUsuario: (rol, nombre) => {
    const notificaciones = leer();
    return notificaciones.filter(
      (n) => n.paraRol === rol && n.paraNombre === nombre
    );
  },

  getNoLeidas: (rol, nombre) => {
    const notificaciones = leer();
    return notificaciones.filter(
      (n) => n.paraRol === rol && n.paraNombre === nombre && !n.leida
    );
  },

  getCountNoLeidas: (rol, nombre) => {
    const notificaciones = leer();
    return notificaciones.filter(
      (n) => n.paraRol === rol && n.paraNombre === nombre && !n.leida
    ).length;
  },

  marcarLeida: (id) => {
    const notificaciones = leer();
    const actualizadas = notificaciones.map((n) =>
      n.id === id ? { ...n, leida: true } : n
    );
    guardar(actualizadas);
  },

  marcarTodasLeidas: (rol, nombre) => {
    const notificaciones = leer();
    const actualizadas = notificaciones.map((n) =>
      n.paraRol === rol && n.paraNombre === nombre ? { ...n, leida: true } : n
    );
    guardar(actualizadas);
  },
};
