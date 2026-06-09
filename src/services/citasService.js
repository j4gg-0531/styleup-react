import { api } from './api.js';

const STORAGE_KEY = 'styleup_citas';

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

export const citasService = {
  async getCitasByCliente(clienteNombre) {
    const user = getUser();
    if (user.cedula && user.token) {
      try {
        const data = await api.get(`/citas/cliente/${user.cedula}`);
        if (data) {
          const mapped = data.map(mapearCitaApi);
          guardar(mapped);
          return mapped.filter((c) => c.clienteNombre === clienteNombre);
        }
      } catch {}
    }
    return leer().filter((c) => c.clienteNombre === clienteNombre);
  },

  async agregarCita(datosCita) {
    const user = getUser();
    const body = {
      cedula_cliente: user.cedula,
      cedula_barbero: datosCita.barberoCedula || datosCita.cedulaBarbero,
      fecha: datosCita.fecha || new Date().toISOString().split('T')[0],
      hora: datosCita.horaInicio || datosCita.hora,
      hora_fin: datosCita.horaFin || datosCita.horaFin,
      id_especialidad: datosCita.servicio?.id,
    };
    const response = await api.post('/citas', body);
    const nuevaCita = response?.cita
      ? mapearCitaApi(response.cita)
      : {
          ...datosCita,
          servicio: datosCita.servicio
            ? { id: datosCita.servicio.id, name: datosCita.servicio.name, dur: datosCita.servicio.dur }
            : datosCita.servicio,
          horaInicio: datosCita.horaInicio || datosCita.hora,
          id: Date.now().toString(),
          estado: 'pendiente',
          fechaCreacion: new Date().toISOString(),
        };
    guardar([...leer(), nuevaCita]);
    return nuevaCita;
  },

  async cancelarCita(citaId) {
    await api.patch(`/citas/${citaId}/cancelar`);
    const citas = leer();
    const actualizadas = citas.map((c) =>
      c.id === citaId ? { ...c, estado: 'cancelada' } : c
    );
    guardar(actualizadas);
    return actualizadas;
  },

  async completarCita(citaId) {
    await api.patch(`/citas/${citaId}/estado`, { estado: 'Completada' });
    const citas = leer();
    const actualizadas = citas.map((c) =>
      c.id === citaId ? { ...c, estado: 'completada' } : c
    );
    guardar(actualizadas);
    return actualizadas;
  },

  async getCitasByBarbero(barberoNombre) {
    const user = getUser();
    if (user.cedula && user.token) {
      try {
        const data = await api.get(`/citas/barbero/${user.cedula}`);
        if (data) {
          const mapped = data.map(mapearCitaApi);
          guardar(mapped);
          return mapped.filter((c) => c.barbero?.name === barberoNombre);
        }
      } catch {}
    }
    return leer().filter((c) => c.barbero?.name === barberoNombre);
  },

  async getCitasBarberoEnDia(barberoNombre, diaNum) {
    const citas = await citasService.getCitasByBarbero(barberoNombre);
    return citas.filter(
      (c) =>
        c.fechaDia === diaNum &&
        c.estado !== 'cancelada' &&
        c.estado !== 'completada'
    );
  },
};
