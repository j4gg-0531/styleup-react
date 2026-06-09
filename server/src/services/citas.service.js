const prisma = require('../lib/prisma')

const obtenerTodas = async () => {
  return await prisma.citas.findMany({
    include: {
      clientes: {
        select: { nombre: true, apellido: true, telefono: true }
      },
      barberos: {
        select: { nombre: true, apellido: true }
      },
      especialidades: {
        select: { especialidad: true, tiempo_estimado: true }
      }
    }
  })
}

const obtenerPorCliente = async (cedula_cliente) => {
  return await prisma.citas.findMany({
    where: { cedula_cliente },
    include: {
      barberos: {
        select: { nombre: true, apellido: true }
      },
      especialidades: {
        select: { especialidad: true, tiempo_estimado: true }
      }
    }
  })
}

const obtenerPorBarbero = async (cedula_barbero) => {
  return await prisma.citas.findMany({
    where: { cedula_barbero },
    include: {
      clientes: {
        select: { nombre: true, apellido: true, telefono: true }
      },
      especialidades: {
        select: { especialidad: true, tiempo_estimado: true }
      }
    }
  })
}

const crear = async (data) => {
  return await prisma.citas.create({
    data: {
      cedula_cliente: data.cedula_cliente,
      cedula_barbero: data.cedula_barbero,
      fecha: new Date(data.fecha),
      hora: data.hora,
      hora_fin: data.hora_fin || null,
      id_especialidad: data.id_especialidad
    }
  })
}

const actualizarEstado = async (id_cita, estado) => {
  return await prisma.citas.update({
    where: { id_cita },
    data: { estado }
  })
}

const cancelar = async (id_cita) => {
  return await prisma.citas.update({
    where: { id_cita },
    data: { estado: 'Cancelada' }
  })
}

const obtenerPorBarberia = async (barberiaId, mes, anio) => {
  const where = {
    barberos: {
      barberia_barberos: { some: { barberia_id: parseInt(barberiaId) } }
    }
  }
  if (mes && anio) {
    const inicio = new Date(anio, mes - 1, 1)
    const fin = new Date(anio, mes, 0, 23, 59, 59)
    where.fecha = { gte: inicio, lte: fin }
  }
  return await prisma.citas.findMany({
    where,
    include: {
      clientes: { select: { nombre: true, apellido: true, telefono: true } },
      barberos: { select: { cedula_barbero: true, nombre: true, apellido: true } },
      especialidades: { select: { especialidad: true, tiempo_estimado: true } },
    },
    orderBy: { fecha: 'desc' },
  })
}

module.exports = { obtenerTodas, obtenerPorCliente, obtenerPorBarbero, crear, actualizarEstado, cancelar, obtenerPorBarberia }