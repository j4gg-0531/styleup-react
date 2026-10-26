const prisma = require('../lib/prisma')

const crear = async (data) => {
  const calificacion = await prisma.calificaciones.create({
    data: {
      cedula_cliente: data.cedulaCliente,
      cedula_barbero: data.cedulaBarbero || null,
      barberia_id: data.barberiaId ? parseInt(data.barberiaId) : null,
      id_cita: data.idCita || null,
      puntaje: parseInt(data.puntaje),
      comentario: data.comentario || null,
    },
  })

  if (data.cedulaBarbero) {
    await actualizarPromedioBarbero(data.cedulaBarbero)
  }
  if (data.barberiaId) {
    await actualizarPromedioBarberia(parseInt(data.barberiaId))
  }

  return calificacion
}

const obtenerPorBarbero = async (cedulaBarbero) => {
  return await prisma.calificaciones.findMany({
    where: { cedula_barbero: cedulaBarbero },
    include: {
      cliente: {
        select: { cedula_cliente: true, nombre: true, apellido: true, avatar_url: true },
      },
    },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const obtenerPorBarberia = async (barberiaId) => {
  return await prisma.calificaciones.findMany({
    where: { barberia_id: parseInt(barberiaId) },
    include: {
      cliente: {
        select: { cedula_cliente: true, nombre: true, apellido: true, avatar_url: true },
      },
    },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const actualizarPromedioBarbero = async (cedulaBarbero) => {
  const aggr = await prisma.calificaciones.aggregate({
    where: { cedula_barbero: cedulaBarbero },
    _avg: { puntaje: true },
    _count: { puntaje: true },
  })
  await prisma.barberos.update({
    where: { cedula_barbero: cedulaBarbero },
    data: {
      calificacion: aggr._avg.puntaje || null,
      total_calificaciones: aggr._count.puntaje || 0,
    },
  })
}

const actualizarPromedioBarberia = async (barberiaId) => {
  const aggr = await prisma.calificaciones.aggregate({
    where: { barberia_id: barberiaId },
    _avg: { puntaje: true },
    _count: { puntaje: true },
  })
  await prisma.barberias.update({
    where: { id: barberiaId },
    data: {
      calificacion: aggr._avg.puntaje || null,
      total_calificaciones: aggr._count.puntaje || 0,
    },
  })
}

module.exports = { crear, obtenerPorBarbero, obtenerPorBarberia }
