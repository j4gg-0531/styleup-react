const prisma = require('../lib/prisma')

const obtenerPorBarbero = async (cedula_barbero) => {
  return await prisma.precios_barbero.findMany({
    where: { cedula_barbero },
    include: {
      especialidades: { select: { especialidad: true, tiempo_estimado: true } }
    }
  })
}

const crear = async (data) => {
  return await prisma.precios_barbero.create({
    data: {
      cedula_barbero: data.cedula_barbero,
      id_especialidad: data.id_especialidad,
      precio: data.precio,
      moneda: data.moneda || 'COP',
      duracion: data.duracion || null,
      activo: data.activo !== undefined ? data.activo : true,
    }
  })
}

const actualizar = async (cedula_barbero, id_especialidad, data) => {
  return await prisma.precios_barbero.update({
    where: {
      cedula_barbero_id_especialidad: {
        cedula_barbero,
        id_especialidad: parseInt(id_especialidad)
      }
    },
    data: {
      precio: data.precio,
      duracion: data.duracion,
      activo: data.activo,
    }
  })
}

const guardarConfigServicios = async (cedula_barbero, config) => {
  const entries = Object.entries(config)
  for (const [id_especialidad, cfg] of entries) {
    await prisma.precios_barbero.upsert({
      where: {
        cedula_barbero_id_especialidad: {
          cedula_barbero,
          id_especialidad: parseInt(id_especialidad),
        }
      },
      update: {
        precio: cfg.precio,
        duracion: cfg.duracion,
        activo: cfg.activo,
      },
      create: {
        cedula_barbero,
        id_especialidad: parseInt(id_especialidad),
        precio: cfg.precio,
        moneda: 'COP',
        duracion: cfg.duracion,
        activo: cfg.activo !== undefined ? cfg.activo : true,
      },
    })
  }
  return await obtenerPorBarbero(cedula_barbero)
}

module.exports = { obtenerPorBarbero, crear, actualizar, guardarConfigServicios }