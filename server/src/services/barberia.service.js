const prisma = require('../lib/prisma')

const SELECT_SIN_CONTRASENA = {
  id: true,
  nombre: true,
  nombre_dueno: true,
  direccion: true,
  ciudad: true,
  telefono: true,
  descripcion: true,
  calificacion: true,
  total_calificaciones: true,
  lat: true,
  lng: true,
  logo_url: true,
  nit: true,
  correo: true,
  num_trabajadores: true,
  fecha_registro: true,
}

const obtenerTodas = async () => {
  return await prisma.barberias.findMany({
    select: SELECT_SIN_CONTRASENA,
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
}

const obtenerPorId = async (id) => {
  const barberia = await prisma.barberias.findUnique({
    where: { id: parseInt(id) },
    select: SELECT_SIN_CONTRASENA,
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
  return barberia
}

const obtenerPorNombreDueno = async (nombreDueno) => {
  const barberia = await prisma.barberias.findFirst({
    where: { nombre_dueno: nombreDueno },
    select: SELECT_SIN_CONTRASENA,
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
  return barberia
}

const crear = async (data) => {
  return await prisma.barberias.create({ data })
}

const actualizar = async (id, data) => {
  return await prisma.barberias.update({
    where: { id: parseInt(id) },
    data,
    select: SELECT_SIN_CONTRASENA,
  })
}

const eliminar = async (id) => {
  return await prisma.barberias.delete({
    where: { id: parseInt(id) },
  })
}

module.exports = { obtenerTodas, obtenerPorId, obtenerPorNombreDueno, crear, actualizar, eliminar }
