const prisma = require('../lib/prisma')

const obtenerPorBarbero = async (cedulaBarbero) => {
  return await prisma.propuestas_horario.findMany({
    where: { cedula_barbero: cedulaBarbero },
    include: {
      barberia: { select: { id: true, nombre: true } },
    },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const obtenerPorBarberia = async (barberiaId) => {
  return await prisma.propuestas_horario.findMany({
    where: { barberia_id: parseInt(barberiaId) },
    include: {
      barbero: {
        select: {
          cedula_barbero: true,
          nombre: true,
          apellido: true,
        },
      },
    },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const crear = async (data) => {
  return await prisma.propuestas_horario.create({
    data: {
      origen: data.origen,
      cedula_barbero: data.cedulaBarbero,
      barberia_id: data.barberiaId ? parseInt(data.barberiaId) : null,
      dias: data.dias || [],
      hora_inicio: data.horaInicio,
      hora_fin: data.horaFin,
    },
  })
}

const aceptar = async (id) => {
  return await prisma.propuestas_horario.update({
    where: { id: parseInt(id) },
    data: {
      estado_propuesta: 'aceptada',
      fecha_respuesta: new Date(),
    },
  })
}

const rechazar = async (id) => {
  return await prisma.propuestas_horario.update({
    where: { id: parseInt(id) },
    data: {
      estado_propuesta: 'rechazada',
      fecha_respuesta: new Date(),
    },
  })
}

module.exports = { obtenerPorBarbero, obtenerPorBarberia, crear, aceptar, rechazar }
