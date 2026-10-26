const prisma = require('../lib/prisma')

const obtenerPorOferta = async (ofertaId) => {
  return await prisma.aplicaciones.findMany({
    where: { oferta_id: parseInt(ofertaId) },
    include: {
      barbero: {
        select: {
          cedula_barbero: true,
          nombre: true,
          apellido: true,
          telefono: true,
          correo: true,
          ciudad: true,
        },
      },
    },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const obtenerPorBarbero = async (cedulaBarbero) => {
  return await prisma.aplicaciones.findMany({
    where: { cedula_barbero: cedulaBarbero },
    include: {
      oferta: {
        include: {
          barberia: {
            select: { id: true, nombre: true, ciudad: true },
          },
        },
      },
    },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const crear = async (data) => {
  const yaAplico = await prisma.aplicaciones.findFirst({
    where: {
      oferta_id: parseInt(data.ofertaId),
      cedula_barbero: data.cedulaBarbero,
    },
  })
  if (yaAplico) return null

  return await prisma.aplicaciones.create({
    data: {
      oferta_id: parseInt(data.ofertaId),
      cedula_barbero: data.cedulaBarbero,
      hoja_de_vida: data.hojaDeVida || {},
    },
  })
}

const cambiarEstado = async (id, nuevoEstado) => {
  return await prisma.aplicaciones.update({
    where: { id: parseInt(id) },
    data: { estado: nuevoEstado },
  })
}

module.exports = { obtenerPorOferta, obtenerPorBarbero, crear, cambiarEstado }
