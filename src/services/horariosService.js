import { api } from './api.js';

const STORAGE_KEY = 'styleup_horarios';
const PROPUESTAS_KEY = 'styleup_propuestas';
const STORAGE_KEY_ADMIN = 'styleup_barberia_horarios_admin';
const SYNCED_KEY = 'styleup_horarios_synced';

const HORARIO_ADMIN_MOCK = {
  'Juan Pérez':    { Lun:'09:00–18:00', Mar:'09:00–18:00', Mié:'09:00–18:00', Jue:'09:00–18:00', Vie:'09:00–18:00', Sáb:'09:00–14:00', Dom:'—' },
  'Carlos López':  { Lun:'12:00–20:00', Mar:'12:00–20:00', Mié:'Descanso',    Jue:'12:00–20:00', Vie:'12:00–20:00', Sáb:'10:00–16:00', Dom:'—' },
  'Miguel Torres': { Lun:'Descanso',    Mar:'10:00–18:00', Mié:'10:00–18:00', Jue:'10:00–18:00', Vie:'10:00–18:00', Sáb:'Descanso',    Dom:'—' },
};

const getDiasSemanActual = () => {
  const hoy = new Date();
  const diaSem = hoy.getDay();
  const lunes = new Date(hoy);
  lunes.setDate(hoy.getDate() - (diaSem === 0 ? 6 : diaSem - 1));
  return {
    lun: String(lunes.getDate()),
    mar: String(lunes.getDate() + 1),
    mie: String(lunes.getDate() + 2),
    jue: String(lunes.getDate() + 3),
    vie: String(lunes.getDate() + 4),
    sab: String(lunes.getDate() + 5),
  };
};

const generarMockBarbero = (barberoNombre, turnosConfig) => {
  const dias = getDiasSemanActual();
  const NOMBRES_DIA = { lun: 'Lun', mar: 'Mar', mie: 'Mié', jue: 'Jue', vie: 'Vie', sab: 'Sáb' };
  return turnosConfig.flatMap((turno, idx) =>
    turno.dias.map((clave, i) => ({
      id: `mock-${barberoNombre.replace(/\s/g, '')}-${idx}-${i}`,
      barberoNombre,
      dia: dias[clave],
      mes: NOMBRES_DIA[clave],
      horaInicio: turno.inicio,
      horaFin: turno.fin,
      rango: `${turno.inicio} — ${turno.fin}`,
      estado: turno.estado || 'disponible',
      semanaOffset: 0,
      esMock: true,
    }))
  );
};

const mockJuan = generarMockBarbero('Juan Pérez', [
  { dias: ['lun', 'mar', 'mie', 'jue', 'vie'], inicio: '08:00', fin: '13:00' },
  { dias: ['lun', 'mar', 'mie', 'jue', 'vie'], inicio: '14:00', fin: '18:00' },
  { dias: ['sab'], inicio: '09:00', fin: '13:00' },
]);
const mockCarlos = generarMockBarbero('Carlos López', [
  { dias: ['lun', 'mar', 'jue', 'vie'], inicio: '13:00', fin: '20:00' },
  { dias: ['mie'], inicio: '13:00', fin: '20:00' },
  { dias: ['sab'], inicio: '09:00', fin: '17:00' },
]);
const mockMiguel = generarMockBarbero('Miguel Torres', [
  { dias: ['mar', 'jue'], inicio: '10:00', fin: '19:00' },
  { dias: ['sab'], inicio: '10:00', fin: '15:00' },
]);
const HORARIOS_MOCK = [...mockJuan, ...mockCarlos, ...mockMiguel];

const leer = (key) => {
  const d = sessionStorage.getItem(key);
  return d ? JSON.parse(d) : [];
};
const guardar = (key, data) => sessionStorage.setItem(key, JSON.stringify(data));

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('su_user') || '{}'); } catch { return {}; }
}

function mapearHorarioApi(h) {
  const fecha = h.fecha ? new Date(h.fecha) : null;
  return {
    id: `api-${h.id_horario || h.id}`,
    barberoNombre: `${h.barberos?.nombre || ''} ${h.barberos?.apellido || ''}`.trim(),
    dia: fecha ? String(fecha.getDate()) : h.dia,
    mes: fecha ? fecha.toLocaleDateString('es-CO', { weekday: 'short' }) : '',
    horaInicio: h.hora_inicio?.split(':').slice(0, 2).join(':'),
    horaFin: h.hora_fin?.split(':').slice(0, 2).join(':'),
    rango: `${h.hora_inicio?.split(':').slice(0, 2).join(':')} — ${h.hora_fin?.split(':').slice(0, 2).join(':')}`,
    estado: h.estado?.toLowerCase() || 'disponible',
    semanaOffset: 0,
    esMock: false,
  };
}

async function syncHorariosFromApi() {
  const user = getUser();
  if (!user.cedula) return;
  try {
    const data = await api.get(`/horarios/${user.cedula}`);
    if (!data || !data.length) return;
    const mapped = data.map(mapearHorarioApi);
    const existentes = leer(STORAGE_KEY);
    const apiIds = new Set(mapped.map((h) => h.id));
    const sinApi = existentes.filter((h) => !apiIds.has(h.id) && !h.esMock);
    guardar(STORAGE_KEY, [...sinApi, ...mapped]);
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    synced[user.cedula] = Date.now();
    sessionStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
  } catch { /* silent */ }
}

export const horariosService = {

  getHorariosByBarbero(barberoNombre) {
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    const user = getUser();
    if (user.cedula && !synced[user.cedula]) {
      syncHorariosFromApi();
    }
    const guardados = leer(STORAGE_KEY);
    const reales = guardados.filter((h) => h.barberoNombre === barberoNombre);
    const mocks = HORARIOS_MOCK.filter((h) => h.barberoNombre === barberoNombre);
    const diasConReal = new Set(reales.map((h) => h.dia));
    const mocksFiltrados = mocks.filter((m) => !diasConReal.has(m.dia));
    return [...reales, ...mocksFiltrados];
  },

  agregarHorario(datos) {
    const horarios = leer(STORAGE_KEY);
    const nuevo = {
      ...datos,
      id: Date.now().toString(),
      fechaCreacion: new Date().toISOString(),
    };
    guardar(STORAGE_KEY, [...horarios, nuevo]);

    const user = getUser();
    if (user.cedula && datos.horaInicio && datos.dia) {
      const today = new Date();
      const fecha = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(datos.dia).padStart(2, '0')}`;
      api.post('/horarios', {
        cedula_barbero: user.cedula,
        fecha,
        hora_inicio: datos.horaInicio,
        hora_fin: datos.horaFin,
      }).catch(() => {});
    }
    return nuevo;
  },

  eliminarHorario(id) {
    const horarios = leer(STORAGE_KEY);
    const actualizados = horarios.filter((h) => h.id !== id);
    guardar(STORAGE_KEY, actualizados);
    return actualizados;
  },

  // ── Propuestas de horario (Fase 2, sessionStorage) ──

  crearPropuesta(datos) {
    const propuestas = leer(PROPUESTAS_KEY);
    const nueva = {
      id: 'prop_' + Date.now().toString(),
      origen: 'barbero',
      barberoNombre: datos.barberoNombre,
      dias: datos.dias,
      nombresDia: datos.nombresDia,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      rango: datos.rango,
      semanaOffset: datos.semanaOffset,
      estado: datos.estado,
      estadoPropuesta: 'pendiente',
      fechaCreacion: new Date().toISOString(),
      fechaRespuesta: null,
    };
    guardar(PROPUESTAS_KEY, [...propuestas, nueva]);

    const user = getUser();
    if (user.cedula) {
      api.post('/propuestas', {
        cedula_barbero: user.cedula,
        tipo: 'barbero',
        estado: datos.estado || 'disponible',
      }).catch(() => {});
    }
    return nueva;
  },

  getPropuestasByBarbero: (barberoNombre) =>
    leer(PROPUESTAS_KEY).filter((p) => p.barberoNombre === barberoNombre && p.origen === 'barbero'),

  getPropuestasByBarberia: (nombreDueno) =>
    leer(PROPUESTAS_KEY).filter((p) => p.estadoPropuesta === 'pendiente' && p.origen === 'barbero'),

  aceptarPropuesta(propuestaId) {
    const propuestas = leer(PROPUESTAS_KEY);
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;
    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;
    propuesta.estadoPropuesta = 'aceptada';
    propuesta.fechaRespuesta = new Date().toISOString();
    guardar(PROPUESTAS_KEY, propuestas);
    const horarios = leer(STORAGE_KEY);
    const nuevos = propuesta.dias.map((dia, i) => ({
      id: Date.now().toString() + '_' + i,
      barberoNombre: propuesta.barberoNombre,
      dia, mes: propuesta.nombresDia[i] || '',
      semanaOffset: propuesta.semanaOffset,
      rango: propuesta.rango,
      horaInicio: propuesta.horaInicio, horaFin: propuesta.horaFin,
      estado: propuesta.estado, fechaCreacion: new Date().toISOString(),
    }));
    guardar(STORAGE_KEY, [...horarios, ...nuevos]);
    return { ...propuesta, horariosCreados: nuevos };
  },

  rechazarPropuesta(propuestaId) {
    const propuestas = leer(PROPUESTAS_KEY);
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;
    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;
    propuesta.estadoPropuesta = 'rechazada';
    propuesta.fechaRespuesta = new Date().toISOString();
    guardar(PROPUESTAS_KEY, propuestas);
    return propuesta;
  },

  // ── Admin schedule ──

  getHorarioAdmin(barberoNombre) {
    const guardado = sessionStorage.getItem(STORAGE_KEY_ADMIN);
    if (guardado) {
      const data = JSON.parse(guardado);
      if (data[barberoNombre]) return data[barberoNombre];
    }
    return { ...(HORARIO_ADMIN_MOCK[barberoNombre] || {}) };
  },

  crearPropuestaAdmin(datos) {
    const propuestas = leer(PROPUESTAS_KEY);
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
    guardar(PROPUESTAS_KEY, [...propuestas, nueva]);
    return nueva;
  },

  getPropuestasAdminByBarbero: (barberoNombre) =>
    leer(PROPUESTAS_KEY).filter((p) => p.barberoNombre === barberoNombre && p.origen === 'barberia'),

  aceptarPropuestaAdmin(propuestaId) {
    const propuestas = leer(PROPUESTAS_KEY);
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;
    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;
    propuesta.estadoPropuesta = 'aceptada';
    propuesta.fechaRespuesta = new Date().toISOString();
    guardar(PROPUESTAS_KEY, propuestas);
    const guardado = sessionStorage.getItem(STORAGE_KEY_ADMIN);
    const data = guardado ? JSON.parse(guardado) : {};
    data[propuesta.barberoNombre] = propuesta.horario;
    sessionStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(data));
    return propuesta;
  },

  rechazarPropuestaAdmin(propuestaId) {
    const propuestas = leer(PROPUESTAS_KEY);
    const idx = propuestas.findIndex((p) => p.id === propuestaId);
    if (idx === -1) return null;
    const propuesta = propuestas[idx];
    if (propuesta.estadoPropuesta !== 'pendiente') return null;
    propuesta.estadoPropuesta = 'rechazada';
    propuesta.fechaRespuesta = new Date().toISOString();
    guardar(PROPUESTAS_KEY, propuestas);
    return propuesta;
  },
};
