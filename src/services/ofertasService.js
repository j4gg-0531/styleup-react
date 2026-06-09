import { api } from './api.js';

const OFERTAS_KEY = 'styleup_ofertas_cache';
const APLICACIONES_KEY = 'styleup_aplicaciones_cache';

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

export const ofertasService = {
  async getOfertasActivas() {
    try {
      const data = await api.get('/ofertas?estado=activa');
      if (data) {
        guardar(OFERTAS_KEY, data);
        return data.map(mapearOferta);
      }
    } catch {}
    return leer(OFERTAS_KEY).map(mapearOferta);
  },

  async getOfertasByBarberia(barberiaId) {
    const todas = await ofertasService.getOfertasActivas();
    return todas.filter((o) => o.barberiaId === barberiaId);
  },

  async crearOferta(datos) {
    const body = {
      barberiaId: datos.barberiaId,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      tipoContratacion: datos.tipoContratacion,
      condicionEconomica: datos.condicionEconomica,
      horario: datos.horario,
      vacantes: datos.vacantes,
      especialidadesBuscadas: datos.especialidadesBuscadas,
      experienciaRequerida: datos.experienciaRequerida,
      herramientasPropias: datos.herramientasPropias,
      fechaLimite: datos.fechaLimite,
    };
    const response = await api.post('/ofertas', body);
    const oferta = response?.oferta || response;
    if (oferta) {
      const cache = leer(OFERTAS_KEY);
      guardar(OFERTAS_KEY, [...cache, oferta]);
      return mapearOferta(oferta);
    }
    return mapearOferta(body);
  },

  async cerrarOferta(ofertaId) {
    const id = ofertaId.replace(/^OF/, '');
    await api.patch(`/ofertas/${id}/cerrar`);
    const cache = leer(OFERTAS_KEY);
    guardar(OFERTAS_KEY, cache.map((o) =>
      String(o.id) === id ? { ...o, estado: 'cerrada' } : o
    ));
  },

  async aplicar(ofertaId, barberoNombre, hojaDeVida) {
    const id = ofertaId.replace(/^OF/, '');
    const user = getUser();
    const response = await api.post('/aplicaciones', {
      ofertaId: id,
      cedulaBarbero: user.cedula || '',
      hojaDeVida,
    });
    if (response) {
      const cache = leer(APLICACIONES_KEY);
      const aplicacion = response?.aplicacion || response;
      guardar(APLICACIONES_KEY, [...cache, aplicacion]);
    }
    return mapearAplicacion({ id: Date.now(), oferta_id: parseInt(id), cedula_barbero: user.cedula, hoja_de_vida: hojaDeVida, estado: 'pendiente' });
  },

  async getAplicacionesByBarbero(cedulaBarbero) {
    try {
      const data = await api.get(`/aplicaciones/barbero/${cedulaBarbero}`);
      if (data) {
        guardar(APLICACIONES_KEY, data);
        return data.filter((a) => a.cedula_barbero === cedulaBarbero).map(mapearAplicacion);
      }
    } catch {}
    return leer(APLICACIONES_KEY).filter((a) => a.cedula_barbero === cedulaBarbero).map(mapearAplicacion);
  },

  async getAplicacionesByOferta(ofertaId) {
    const id = ofertaId.replace(/^OF/, '');
    try {
      const data = await api.get(`/aplicaciones/oferta/${id}`);
      if (data) {
        guardar(APLICACIONES_KEY, data);
        return data.filter((a) => String(a.oferta_id) === id).map(mapearAplicacion);
      }
    } catch {}
    return leer(APLICACIONES_KEY).filter((a) => String(a.oferta_id) === id).map(mapearAplicacion);
  },

  async cambiarEstadoAplicacion(aplicacionId, nuevoEstado) {
    const id = aplicacionId.replace(/^AP/, '');
    await api.patch(`/aplicaciones/${id}/estado`, { estado: nuevoEstado });
    const cache = leer(APLICACIONES_KEY);
    guardar(APLICACIONES_KEY, cache.map((a) =>
      String(a.id) === id ? { ...a, estado: nuevoEstado } : a
    ));
  },
};
