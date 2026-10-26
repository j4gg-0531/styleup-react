const prisma = require('../lib/prisma')

const obtenerPorUsuario = async (rol, nombre) => {
  return await prisma.notificaciones.findMany({
    where: { para_rol: rol, para_nombre: nombre },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const obtenerNoLeidas = async (rol, nombre) => {
  return await prisma.notificaciones.findMany({
    where: { para_rol: rol, para_nombre: nombre, leida: false },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const contarNoLeidas = async (rol, nombre) => {
  return await prisma.notificaciones.count({
    where: { para_rol: rol, para_nombre: nombre, leida: false },
  })
}

const crear = async (data) => {
  return await prisma.notificaciones.create({
    data: {
      tipo: data.tipo,
      para_rol: data.paraRol,
      para_nombre: data.paraNombre,
      de_rol: data.deRol,
      de_nombre: data.deNombre,
      mensaje: data.mensaje,
      metadata: data.metadata || {},
    },
  })
}

const marcarLeida = async (id) => {
  return await prisma.notificaciones.update({
    where: { id: parseInt(id) },
    data: { leida: true },
  })
}

const marcarTodasLeidas = async (rol, nombre) => {
  await prisma.notificaciones.updateMany({
    where: { para_rol: rol, para_nombre: nombre, leida: false },
    data: { leida: true },
  })
}

module.exports = { obtenerPorUsuario, obtenerNoLeidas, contarNoLeidas, crear, marcarLeida, marcarTodasLeidas }
