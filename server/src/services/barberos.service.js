const prisma = require('../lib/prisma')

const obtenerTodos = async () => {
  return await prisma.barberos.findMany({
    select: {
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
      especialidades: true
    }
  })
}

const obtenerPorCedula = async (cedula_barbero) => {
  const barbero = await prisma.barberos.findUnique({
    where: { cedula_barbero },
    select: {
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
      especialidades: true
    }
  })
  if (!barbero) throw new Error('Barbero no encontrado')
  return barbero
}


const actualizar = async (cedula_barbero, data) => {
  return await prisma.barberos.update({
    where: { cedula_barbero },
    data
  })
}

const eliminar = async (cedula_barbero) => {
  return await prisma.barberos.delete({
    where: { cedula_barbero }
  })
}

module.exports = { obtenerTodos, obtenerPorCedula, actualizar, eliminar }