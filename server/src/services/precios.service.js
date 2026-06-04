const prisma = require('../lib/prisma')

const obtenerPorBarbero = async (cedula_barbero) => {
  return await prisma.precios_barbero.findMany({
    where: { cedula_barbero },
    include: {
      especialidades: { select: { especialidad: true } }
    }
  })
}

const crear = async (data) => {
  return await prisma.precios_barbero.create({
    data: {
      cedula_barbero: data.cedula_barbero,
      id_especialidad: data.id_especialidad,
      precio: data.precio,
      moneda: data.moneda || 'COP'
    }
  })
}

const actualizar = async (cedula_barbero, id_especialidad, precio) => {
  return await prisma.precios_barbero.update({
    where: {
      cedula_barbero_id_especialidad: {
        cedula_barbero,
        id_especialidad: parseInt(id_especialidad)
      }
    },
    data: { precio }
  })
}

module.exports = { obtenerPorBarbero, crear, actualizar }