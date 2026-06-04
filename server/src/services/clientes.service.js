const prisma = require('../lib/prisma')

const obtenerTodos = async () => {
  return await prisma.clientes.findMany({
    select: {
      cedula_cliente: true,
      nombre: true,
      apellido: true,
      telefono: true,
      correo: true,
      fecha_registro: true,
      telegram_chat_id: true
    }
  })
}

const obtenerPorCedula = async (cedula_cliente) => {
  const cliente = await prisma.clientes.findUnique({
    where: { cedula_cliente },
    select: {
      cedula_cliente: true,
      nombre: true,
      apellido: true,
      telefono: true,
      correo: true,
      fecha_registro: true,
      telegram_chat_id: true
    }
  })
  if (!cliente) throw new Error('Cliente no encontrado')
  return cliente
}

const actualizar = async (cedula_cliente, data) => {
  // Evitar que se actualice la contraseña por esta ruta
  const { contrasena, ...resto } = data
  return await prisma.clientes.update({
    where: { cedula_cliente },
    data: resto,
    select: {
      cedula_cliente: true,
      nombre: true,
      apellido: true,
      telefono: true,
      correo: true,
      fecha_registro: true,
      telegram_chat_id: true
    }
  })
}

const eliminar = async (cedula_cliente) => {
  return await prisma.clientes.delete({
    where: { cedula_cliente }
  })
}

module.exports = { obtenerTodos, obtenerPorCedula, actualizar, eliminar }