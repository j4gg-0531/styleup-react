import { api } from './api.js';

const OFERTAS_KEY = 'styleup_ofertas_cache';
const APLICACIONES_KEY = 'styleup_aplicaciones_cache';
const SYNCED_KEY = 'styleup_ofertas_synced';

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('su_user') || '{}'); } catch { return {}; }
}

const mapearOferta = (o) => ({
  id: `OF${String(o.id).padStart(3, '0')}`,
  barberiaId: o.barberia_id ?? o.barberiaId,
  barberiaNombre: o.barberia?.nombre || o.barberiaNombre,
  titulo: o.titulo,
  descripcion: o.descripcion,
  tipoContratacion: o.tipo_contratacion || o.tipoContratacion,
  condicionEconomica: o.condicion_economica || o.condicionEconomica,
  horario: o.horario,
  vacantes: o.vacantes,
  especialidadesBuscadas: o.especialidades_buscadas || o.especialidadesBuscadas || [],
  experienciaRequerida: o.experiencia_requerida || o.experienciaRequerida,
  herramientasPropias: o.herramientas_propias ?? o.herramientasPropias,
  fechaLimite: (o.fecha_limite || o.fechaLimite || '').split('T')[0],
  estado: o.estado,
  fecha: (o.fecha_creacion || '').split('T')[0],
});

const mapearAplicacion = (a) => ({
  id: `AP${String(a.id).padStart(3, '0')}`,
  ofertaId: a.oferta_id,
  barberoNombre: `${a.barbero?.nombre || ''} ${a.barbero?.apellido || ''}`.trim(),
  barberoCedula: a.cedula_barbero,
  hojaDeVida: a.hoja_de_vida,
  estado: a.estado,
  fecha: a.fecha_creacion?.split('T')[0],
});

function leer(key) {
  const d = sessionStorage.getItem(key);
  return d ? JSON.parse(d) : [];
}

function guardar(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

async function syncOfertas() {
  try {
    const data = await api.get('/ofertas?estado=activa');
    if (data) guardar(OFERTAS_KEY, data);
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    synced.ofertas = Date.now();
    sessionStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
  } catch { /* silent */ }
}

async function syncAplicaciones(cedula) {
  try {
    const data = await api.get(`/aplicaciones/barbero/${cedula}`);
    if (data) guardar(APLICACIONES_KEY, data);
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    synced.aplicaciones = Date.now();
    sessionStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
  } catch { /* silent */ }
}

export const ofertasService = {

  getOfertasActivas() {
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    if (!synced.ofertas) syncOfertas();
    return leer(OFERTAS_KEY).map(mapearOferta);
  },

  getOfertasByBarberia(barberiaId) {
    const todas = ofertasService.getOfertasActivas();
    return todas.filter((o) => o.barberiaId === barberiaId);
  },

  crearOferta(datos) {
    const body = {
      barberiaId: datos.barberiaId, titulo: datos.titulo,
      descripcion: datos.descripcion, tipoContratacion: datos.tipoContratacion,
      condicionEconomica: datos.condicionEconomica, horario: datos.horario,
      vacantes: datos.vacantes, especialidadesBuscadas: datos.especialidadesBuscadas,
      experienciaRequerida: datos.experienciaRequerida,
      herramientasPropias: datos.herramientasPropias, fechaLimite: datos.fechaLimite,
    };
    api.post('/ofertas', body).then((result) => {
      const oferta = result?.oferta || result;
      if (oferta) {
        const cache = leer(OFERTAS_KEY);
        guardar(OFERTAS_KEY, [...cache, oferta]);
      }
    }).catch(() => {});
    const temp = { ...body, id: Date.now(), estado: 'activa' };
    return mapearOferta(temp);
  },

  cerrarOferta(ofertaId) {
    const id = ofertaId.replace(/^OF/, '');
    const cache = leer(OFERTAS_KEY);
    guardar(OFERTAS_KEY, cache.map((o) =>
      String(o.id) === id ? { ...o, estado: 'cerrada' } : o
    ));
    api.patch(`/ofertas/${id}/cerrar`).catch(() => {});
  },

  aplicar(ofertaId, barberoNombre, hojaDeVida) {
    const id = ofertaId.replace(/^OF/, '');
    const user = getUser();
    api.post('/aplicaciones', {
      ofertaId: id, cedulaBarbero: user.cedula || '', hojaDeVida,
    }).then((result) => {
      if (result) {
        const cache = leer(APLICACIONES_KEY);
        guardar(APLICACIONES_KEY, [...cache, result?.aplicacion || result]);
      }
    }).catch(() => {});
    const temp = {
      id: Date.now(), oferta_id: parseInt(id), cedula_barbero: user.cedula,
      hoja_de_vida: hojaDeVida, estado: 'pendiente',
    };
    return mapearAplicacion(temp);
  },

  getAplicacionesByBarbero(cedulaBarbero) {
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    if (!synced.aplicaciones) syncAplicaciones(cedulaBarbero);
    const todas = leer(APLICACIONES_KEY);
    return todas
      .filter((a) => a.cedula_barbero === cedulaBarbero)
      .map(mapearAplicacion);
  },

  getAplicacionesByOferta(ofertaId) {
    const id = ofertaId.replace(/^OF/, '');
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    if (!synced.aplicaciones) syncAplicaciones(getUser().cedula);
    return leer(APLICACIONES_KEY)
      .filter((a) => String(a.oferta_id) === id)
      .map(mapearAplicacion);
  },

  cambiarEstadoAplicacion(aplicacionId, nuevoEstado) {
    const id = aplicacionId.replace(/^AP/, '');
    const cache = leer(APLICACIONES_KEY);
    guardar(APLICACIONES_KEY, cache.map((a) =>
      String(a.id) === id ? { ...a, estado: nuevoEstado } : a
    ));
    api.patch(`/aplicaciones/${id}/estado`, { estado: nuevoEstado }).catch(() => {});
  },
};
