const prisma = require('../lib/prisma')

const obtenerPorBarberia = async (barberiaId) => {
  return await prisma.barberia_barberos.findMany({
    where: { barberia_id: parseInt(barberiaId) },
    include: {
      barbero: {
        select: {
          cedula_barbero: true,
          nombre: true,
          apellido: true,
          telefono: true,
          correo: true,
          especialidades: true,
          calificacion: true,
          total_calificaciones: true,
          disponible_hoy: true,
        },
      },
    },
  })
}

const obtenerPorBarbero = async (cedulaBarbero) => {
  return await prisma.barberia_barberos.findMany({
    where: { cedula_barbero: cedulaBarbero },
    include: {
      barberia: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          telefono: true,
        },
      },
    },
  })
}

const agregarBarbero = async (barberiaId, cedulaBarbero) => {
  const exists = await prisma.barberia_barberos.findUnique({
    where: {
      barberia_id_cedula_barbero: {
        barberia_id: parseInt(barberiaId),
        cedula_barbero: cedulaBarbero,
      },
    },
  })
  if (exists) {
    if (!exists.activo) {
      return await prisma.barberia_barberos.update({
        where: { id: exists.id },
        data: { activo: true, fecha_ingreso: new Date() },
      })
    }
    throw new Error('El barbero ya pertenece a esta barbería')
  }
  return await prisma.barberia_barberos.create({
    data: {
      barberia_id: parseInt(barberiaId),
      cedula_barbero: cedulaBarbero,
    },
  })
}

const desactivarBarbero = async (barberiaId, cedulaBarbero) => {
  const relation = await prisma.barberia_barberos.findUnique({
    where: {
      barberia_id_cedula_barbero: {
        barberia_id: parseInt(barberiaId),
        cedula_barbero: cedulaBarbero,
      },
    },
  })
  if (!relation) throw new Error('Relación no encontrada')
  return await prisma.barberia_barberos.update({
    where: { id: relation.id },
    data: { activo: false },
  })
}

module.exports = { obtenerPorBarberia, obtenerPorBarbero, agregarBarbero, desactivarBarbero }
