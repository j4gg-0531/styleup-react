const prisma = require('../lib/prisma')

const getConversacionId = (usuario1, usuario2) => {
  return [usuario1, usuario2].sort().join('__')
}

const obtenerMensajes = async (usuario1, usuario2) => {
  const conversacionId = getConversacionId(usuario1, usuario2)
  return await prisma.mensajes.findMany({
    where: { conversacion_id: conversacionId },
    orderBy: { timestamp: 'asc' },
  })
}

const enviarMensaje = async (data) => {
  const conversacionId = getConversacionId(data.remitente, data.destinatario)
  return await prisma.mensajes.create({
    data: {
      conversacion_id: conversacionId,
      remitente: data.remitente,
      destinatario: data.destinatario,
      texto: data.texto || null,
      imagen_url: data.imagenUrl || null,
    },
  })
}

const obtenerConversaciones = async (nombreUsuario) => {
  const mensajes = await prisma.mensajes.findMany({
    where: {
      OR: [
        { remitente: nombreUsuario },
        { destinatario: nombreUsuario },
      ],
    },
    orderBy: { timestamp: 'desc' },
  })

  const conversacionesMap = new Map()

  for (const msg of mensajes) {
    const otroUsuario =
      msg.remitente === nombreUsuario ? msg.destinatario : msg.remitente
    const convId = getConversacionId(nombreUsuario, otroUsuario)

    if (!conversacionesMap.has(convId)) {
      conversacionesMap.set(convId, {
        id: convId,
        otroUsuario,
        ultimoMensaje: msg,
        totalMensajes: 0,
      })
    }
    conversacionesMap.get(convId).totalMensajes++
  }

  return Array.from(conversacionesMap.values())
}

const contarNoLeidos = async (nombreUsuario) => {
  return await prisma.mensajes.count({
    where: {
      destinatario: nombreUsuario,
      leido: false,
    },
  })
}

const marcarLeidos = async (usuario1, usuario2) => {
  const conversacionId = getConversacionId(usuario1, usuario2)
  await prisma.mensajes.updateMany({
    where: {
      conversacion_id: conversacionId,
      destinatario: usuario1,
      leido: false,
    },
    data: { leido: true },
  })
}

const eliminarMensaje = async (id, remitente) => {
  const mensaje = await prisma.mensajes.findUnique({ where: { id: parseInt(id) } })
  if (!mensaje) throw new Error('Mensaje no encontrado')
  if (mensaje.remitente !== remitente) throw new Error('No puedes eliminar mensajes de otros')
  return await prisma.mensajes.delete({ where: { id: parseInt(id) } })
}

const eliminarConversacion = async (usuario1, usuario2) => {
  const conversacionId = getConversacionId(usuario1, usuario2)
  return await prisma.mensajes.deleteMany({
    where: { conversacion_id: conversacionId }
  })
}

module.exports = { obtenerMensajes, enviarMensaje, obtenerConversaciones, contarNoLeidos, marcarLeidos, eliminarMensaje, eliminarConversacion }
