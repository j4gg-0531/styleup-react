const prisma = require('../lib/prisma')

const SELECT_BASICO = {
  cedula_barbero: true,
  nombre: true,
  apellido: true,
  telefono: true,
  correo: true,
  direccion: true,
  ciudad: true,
  fecha_registro: true,
  telegram_chat_id: true,
  id_especialidad: true,
  especialidades: true,
  calificacion: true,
  total_calificaciones: true,
  avatar_url: true,
  instagram: true,
  tiktok: true,
  lat: true,
  lng: true,
  disponible_hoy: true,
}

const obtenerTodos = async () => {
  return await prisma.barberos.findMany({
    select: SELECT_BASICO,
  })
}

const obtenerPorCedula = async (cedula_barbero) => {
  const barbero = await prisma.barberos.findUnique({
    where: { cedula_barbero },
    select: SELECT_BASICO,
  })
  if (!barbero) throw new Error('Barbero no encontrado')
  return barbero
}

const actualizar = async (cedula_barbero, data) => {
  return await prisma.barberos.update({
    where: { cedula_barbero },
    data,
    select: SELECT_BASICO,
  })
}

const eliminar = async (cedula_barbero) => {
  return await prisma.barberos.delete({
    where: { cedula_barbero }
  })
}

module.exports = { obtenerTodos, obtenerPorCedula, actualizar, eliminar }