import { api } from './api.js';

function mapearHorarioApi(h) {
  const fecha = h.fecha ? new Date(h.fecha) : null;
  return {
    id: `api-${h.id_horario || h.id}`,
    barberoNombre: `${h.barberos?.nombre || ''} ${h.barberos?.apellido || ''}`.trim(),
    barberoCedula: h.cedula_barbero,
    dia: fecha ? String(fecha.getDate()) : h.dia,
    mes: fecha ? fecha.toLocaleDateString('es-CO', { weekday: 'short' }) : '',
    horaInicio: h.hora_inicio?.split(':').slice(0, 2).join(':'),
    horaFin: h.hora_fin?.split(':').slice(0, 2).join(':'),
    rango: `${h.hora_inicio?.split(':').slice(0, 2).join(':')} — ${h.hora_fin?.split(':').slice(0, 2).join(':')}`,
    estado: h.estados?.estado?.toLowerCase() || 'disponible',
  };
}

function mapearPropuestaApi(p) {
  return {
    id: p.id?.toString(),
    origen: p.origen,
    barberoNombre: `${p.barbero?.nombre || ''} ${p.barbero?.apellido || ''}`.trim(),
    barberoCedula: p.cedula_barbero,
    barberiaNombre: p.barberia?.nombre || '',
    dias: p.dias || [],
    horaInicio: p.hora_inicio,
    horaFin: p.hora_fin,
    rango: `${p.hora_inicio || ''} — ${p.hora_fin || ''}`,
    estadoPropuesta: p.estado_propuesta || 'pendiente',
    fechaCreacion: p.fecha_creacion,
    fechaRespuesta: p.fecha_respuesta,
  };
}

function fechaDesdeDia(dia) {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export const horariosService = {

  async getHorariosByCedula(cedula) {
    const data = await api.get(`/horarios/${cedula}`);
    return (data || []).map(mapearHorarioApi);
  },

  async agregarHorario(datos, cedula) {
    const fecha = fechaDesdeDia(datos.dia);
    const res = await api.post('/horarios', {
      cedula_barbero: cedula,
      fecha,
      hora_inicio: datos.horaInicio,
      hora_fin: datos.horaFin,
    });
    return res?.horario;
  },

  async eliminarHorario(cedula, dia) {
    const fecha = fechaDesdeDia(dia);
    await api.delete(`/horarios/${cedula}/${fecha}`);
  },

  // ── Propuestas (barbero → barbería) ──

  async crearPropuesta(datos, cedula) {
    const res = await api.post('/propuestas', {
      origen: 'barbero',
      cedulaBarbero: cedula,
      barberiaId: datos.barberiaId || null,
      dias: datos.dias || [],
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
    });
    return res?.propuesta;
  },

  async getPropuestasByBarbero(cedula) {
    const data = await api.get(`/propuestas/barbero/${cedula}`);
    return (data || []).filter((p) => p.origen === 'barbero').map(mapearPropuestaApi);
  },

  async getPropuestasByBarberia(barberiaId) {
    const data = await api.get(`/propuestas/barberia/${barberiaId}`);
    return (data || []).filter((p) => p.origen === 'barbero' && p.estado_propuesta === 'pendiente').map(mapearPropuestaApi);
  },

  async aceptarPropuesta(id) {
    const res = await api.patch(`/propuestas/${id}/aceptar`);
    if (!res?.propuesta) return null;
    const prop = res.propuesta;
    for (const dia of (prop.dias || [])) {
      await api.post('/horarios', {
        cedula_barbero: prop.cedula_barbero,
        fecha: fechaDesdeDia(dia),
        hora_inicio: prop.hora_inicio,
        hora_fin: prop.hora_fin,
      }).catch(() => {});
    }
    return mapearPropuestaApi(prop);
  },

  async rechazarPropuesta(id) {
    const res = await api.patch(`/propuestas/${id}/rechazar`);
    return res?.propuesta ? mapearPropuestaApi(res.propuesta) : null;
  },

  // ── Admin propuestas (barbería → barbero, sessionStorage) ──
  // Estas funciones se mantienen en sessionStorage porque el backend
  // no soporta el formato de horario semanal completo (turno por día).

  crearPropuestaAdmin(datos) {
    const key = 'styleup_propuestas_admin';
    const propuestas = JSON.parse(sessionStorage.getItem(key) || '[]');
    const nueva = {
      id: 'prop_admin_' + Date.now().toString(),
      origen: 'barberia',
      barberoNombre: datos.barberoNombre,
      barberiaNombreDueno: datos.barberiaNombreDueno,
      barberiaNombre: datos.barberiaNombre,
      horario: datos.horario,
      estadoPropuesta: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      fechaRespuesta: null,
    };
    sessionStorage.setItem(key, JSON.stringify([...propuestas, nueva]));
    return nueva;
  },

  getPropuestasAdminByBarbero(barberoNombre) {
    const key = 'styleup_propuestas_admin';
    const data = JSON.parse(sessionStorage.getItem(key) || '[]');
    return data.filter((p) => p.barberoNombre === barberoNombre && p.origen === 'barberia');
  },

  aceptarPropuestaAdmin(propuestaId) {
    const key = 'styleup_propuestas_admin';
    const propuestas = JSON.parse(sessionStorage.getItem(key) || '[]');
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;
    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;
    propuesta.estadoPropuesta = 'aceptada';
    propuesta.fechaRespuesta = new Date().toISOString();
    sessionStorage.setItem(key, JSON.stringify(propuestas));
    const adminKey = 'styleup_barberia_horarios_admin';
    const data = JSON.parse(sessionStorage.getItem(adminKey) || '{}');
    data[propuesta.barberoNombre] = propuesta.horario;
    sessionStorage.setItem(adminKey, JSON.stringify(data));
    return propuesta;
  },

  rechazarPropuestaAdmin(propuestaId) {
    const key = 'styleup_propuestas_admin';
    const propuestas = JSON.parse(sessionStorage.getItem(key) || '[]');
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;
    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;
    propuesta.estadoPropuesta = 'rechazada';
    propuesta.fechaRespuesta = new Date().toISOString();
    sessionStorage.setItem(key, JSON.stringify(propuestas));
    return propuesta;
  },

  // ── Admin schedule (API + sessionStorage fallback) ──

  async getHorarioAdmin(cedula) {
    try {
      const data = await api.get(`/horarios/${cedula}`);
      const agrupado = {};
      (data || []).forEach((h) => {
        const dia = new Date(h.fecha).getDate();
        agrupado[dia] = `${h.hora_inicio?.split(':').slice(0, 2).join(':')}–${h.hora_fin?.split(':').slice(0, 2).join(':')}`;
      });
      return agrupado;
    } catch {
      return {};
    }
  },
};
