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

const obtenerPorBarberia = async (barberiaId) => {
  const barberos = await prisma.barberia_barberos.findMany({
    where: { id_barberia: parseInt(barberiaId) },
    select: { cedula_barbero: true }
  })
  if (!barberos.length) return []
  const cedulas = barberos.map(b => b.cedula_barbero)
  return await prisma.precios_barbero.findMany({
    where: { cedula_barbero: { in: cedulas } },
    include: {
      especialidades: { select: { especialidad: true, tiempo_estimado: true } }
    }
  })
}

const guardarConfigBarberia = async (barberiaId, config) => {
  const barberos = await prisma.barberia_barberos.findMany({
    where: { id_barberia: parseInt(barberiaId) },
    select: { cedula_barbero: true }
  })
  if (!barberos.length) return []
  const cedulas = barberos.map(b => b.cedula_barbero)
  const entries = Object.entries(config)
  for (const cedula of cedulas) {
    for (const [id_especialidad, cfg] of entries) {
      await prisma.precios_barbero.upsert({
        where: {
          cedula_barbero_id_especialidad: {
            cedula_barbero: cedula,
            id_especialidad: parseInt(id_especialidad),
          }
        },
        update: { precio: cfg.precio, duracion: cfg.duracion, activo: cfg.activo },
        create: {
          cedula_barbero: cedula,
          id_especialidad: parseInt(id_especialidad),
          precio: cfg.precio, moneda: 'COP',
          duracion: cfg.duracion, activo: cfg.activo !== undefined ? cfg.activo : true,
        },
      })
    }
  }
  return await obtenerPorBarberia(barberiaId)
}

const eliminar = async (cedula_barbero, id_especialidad) => {
  return await prisma.precios_barbero.delete({
    where: {
      cedula_barbero_id_especialidad: {
        cedula_barbero,
        id_especialidad: parseInt(id_especialidad)
      }
    }
  })
}

module.exports = { obtenerPorBarbero, crear, actualizar, guardarConfigServicios, obtenerPorBarberia, guardarConfigBarberia, eliminar }