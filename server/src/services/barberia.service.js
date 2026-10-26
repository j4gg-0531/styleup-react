const prisma = require('../lib/prisma')

const excluirContrasena = (data) => {
  if (!data) return data
  if (Array.isArray(data)) return data.map((item) => excluirContrasena(item))
  const { contrasena, ...rest } = data
  return rest
}

const obtenerTodas = async () => {
  const barberias = await prisma.barberias.findMany({
    include: {
      barberia_barberos: {
        where: { activo: true },
        include: {
          barbero: {
            select: {
              cedula_barbero: true,
              nombre: true,
              apellido: true,
              especialidades: true,
              calificacion: true,
              disponible_hoy: true,
            },
          },
        },
      },
    },
  })
  return excluirContrasena(barberias)
}

const obtenerPorId = async (id) => {
  const barberia = await prisma.barberias.findUnique({
    where: { id: parseInt(id) },
    include: {
      barberia_barberos: {
        where: { activo: true },
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
              avatar_url: true,
              disponible_hoy: true,
            },
          },
        },
      },
    },
  })
  if (!barberia) throw new Error('Barbería no encontrada')
  return excluirContrasena(barberia)
}

const obtenerPorNombreDueno = async (nombreDueno) => {
  const barberia = await prisma.barberias.findFirst({
    where: { nombre_dueno: nombreDueno },
    include: {
      barberia_barberos: {
        where: { activo: true },
        include: {
          barbero: {
            select: {
              cedula_barbero: true,
              nombre: true,
              apellido: true,
              especialidades: true,
            },
          },
        },
      },
    },
  })
  if (!barberia) return null
  return excluirContrasena(barberia)
}

const crear = async (data) => {
  const barberia = await prisma.barberias.create({ data })
  return excluirContrasena(barberia)
}

const actualizar = async (id, data) => {
  const barberia = await prisma.barberias.update({
    where: { id: parseInt(id) },
    data,
  })
  return excluirContrasena(barberia)
}

const eliminar = async (id) => {
  return await prisma.barberias.delete({
    where: { id: parseInt(id) },
  })
}

module.exports = { obtenerTodas, obtenerPorId, obtenerPorNombreDueno, crear, actualizar, eliminar }
