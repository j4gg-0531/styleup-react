import { api } from './api.js';

const STORAGE_KEY = 'styleup_citas';
const SYNCED_KEY = 'styleup_citas_synced';

function leer() {
  const d = sessionStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : [];
}

function guardar(citas) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(citas));
}

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('su_user') || '{}'); } catch { return {}; }
}

function mapearCitaApi(c) {
  return {
    id: c.id_cita,
    cedulaCliente: c.cedula_cliente,
    cedulaBarbero: c.cedula_barbero,
    clienteNombre: `${c.clientes?.nombre || ''} ${c.clientes?.apellido || ''}`.trim(),
    barbero: c.barberos ? { name: `${c.barberos.nombre} ${c.barberos.apellido}`.trim() } : undefined,
    servicio: c.especialidades ? {
      id: c.id_especialidad,
      name: c.especialidades.especialidad,
      dur: c.especialidades.tiempo_estimado,
    } : undefined,
    fecha: c.fecha?.split('T')[0],
    hora: c.hora?.split(':').slice(0, 2).join(':'),
    horaInicio: c.hora?.split(':').slice(0, 2).join(':'),
    horaFin: c.hora_fin?.split(':').slice(0, 2).join(':'),
    fechaDia: c.fecha ? new Date(c.fecha).getDate().toString() : undefined,
    fechaMes: c.fecha ? new Date(c.fecha).toLocaleDateString('es-CO', { month: 'short' }) : undefined,
    fechaAnio: c.fecha ? new Date(c.fecha).getFullYear().toString() : undefined,
    estado: c.estado?.toLowerCase(),
    fechaCreacion: c.fecha_creacion,
  };
}

async function syncCitasFromApi() {
  const user = getUser();
  if (!user.cedula) return;
  try {
    const data = user.tipo === 'barbero'
      ? await api.get(`/citas/barbero/${user.cedula}`)
      : await api.get(`/citas/cliente/${user.cedula}`);
    if (!data) return;
    const mapped = data.map(mapearCitaApi);
    const localIds = new Set(leer().map((c) => c.id));
    const newCitas = mapped.filter((c) => !localIds.has(c.id));
    if (newCitas.length) {
      guardar([...leer(), ...newCitas]);
    }
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    synced[user.cedula] = Date.now();
    sessionStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
  } catch { /* silent */ }
}

async function syncCitaToApi(datosCita) {
  const user = getUser();
  if (!user.cedula) return;
  try {
    const body = {
      cedula_cliente: user.cedula,
      cedula_barbero: datosCita.barberoCedula || datosCita.cedulaBarbero,
      fecha: datosCita.fecha || new Date().toISOString().split('T')[0],
      hora: datosCita.horaInicio || datosCita.hora,
      hora_fin: datosCita.horaFin || datosCita.horaFin,
      id_especialidad: datosCita.servicio?.id,
    };
    await api.post('/citas', body);
  } catch { /* silent */ }
}

export const citasService = {

  getCitasByCliente(clienteNombre) {
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    const user = getUser();
    if (user.cedula && !synced[user.cedula]) {
      syncCitasFromApi();
    }
    return leer().filter((c) => c.clienteNombre === clienteNombre);
  },

  agregarCita(datosCita) {
    const { servicio, ...resto } = datosCita;
    const nuevaCita = {
      ...resto,
      servicio: servicio
        ? { id: servicio.id, name: servicio.name, dur: servicio.dur }
        : servicio,
      horaInicio: datosCita.horaInicio || datosCita.hora,
      id: Date.now().toString(),
      estado: 'pendiente',
      fechaCreacion: new Date().toISOString(),
    };
    guardar([...leer(), nuevaCita]);
    syncCitaToApi(datosCita);
    return nuevaCita;
  },

  cancelarCita(citaId) {
    const citas = leer();
    const actualizadas = citas.map((c) =>
      c.id === citaId ? { ...c, estado: 'cancelada' } : c
    );
    guardar(actualizadas);
    api.patch(`/citas/${citaId}/cancelar`).catch(() => {});
    return actualizadas;
  },

  completarCita(citaId) {
    const citas = leer();
    const actualizadas = citas.map((c) =>
      c.id === citaId ? { ...c, estado: 'completada' } : c
    );
    guardar(actualizadas);
    api.patch(`/citas/${citaId}/estado`, { estado: 'Completada' }).catch(() => {});
    return actualizadas;
  },

  getCitasByBarbero(barberoNombre) {
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    const user = getUser();
    if (user.cedula && !synced[user.cedula]) {
      syncCitasFromApi();
    }
    return leer().filter((c) => c.barbero?.name === barberoNombre);
  },

  getCitasBarberoEnDia(barberoNombre, diaNum) {
    const citas = citasService.getCitasByBarbero(barberoNombre);
    return citas.filter(
      (c) =>
        c.fechaDia === diaNum &&
        c.estado !== 'cancelada' &&
        c.estado !== 'completada'
    );
  },
};
