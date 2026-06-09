const prisma = require('../lib/prisma')

const obtenerPorBarbero = async (cedula_barbero) => {
  return await prisma.horario_barbero.findMany({
    where: { cedula_barbero },
    include: {
      estados: { select: { estado: true } }
    }
  })
}

const crear = async (data) => {
  return await prisma.horario_barbero.create({
    data: {
      cedula_barbero: data.cedula_barbero,
      id_estado: data.id_estado,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      fecha: new Date(data.fecha)
    }
  })
}

const actualizar = async (cedula_barbero, fecha, data) => {
  return await prisma.horario_barbero.update({
    where: {
      cedula_barbero_fecha: {
        cedula_barbero,
        fecha: new Date(fecha)
      }
    },
    data
  })
}

const eliminar = async (cedula_barbero, fecha) => {
  return await prisma.horario_barbero.delete({
    where: {
      cedula_barbero_fecha: {
        cedula_barbero,
        fecha: new Date(fecha)
      }
    }
  })
}

module.exports = { obtenerPorBarbero, crear, actualizar, eliminar }