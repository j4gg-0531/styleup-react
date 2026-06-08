const prisma = require('../lib/prisma')

const obtenerTodas = async (filtros = {}) => {
  const where = {}
  if (filtros.estado) where.estado = filtros.estado
  if (filtros.barberiaId) where.barberia_id = parseInt(filtros.barberiaId)

  return await prisma.ofertas_trabajo.findMany({
    where,
    include: {
      barberia: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          telefono: true,
          calificacion: true,
        },
      },
    },
    orderBy: { fecha_creacion: 'desc' },
  })
}

const obtenerPorId = async (id) => {
  const oferta = await prisma.ofertas_trabajo.findUnique({
    where: { id: parseInt(id) },
    include: {
      barberia: {
        select: {
          id: true,
          nombre: true,
          ciudad: true,
          telefono: true,
          descripcion: true,
          calificacion: true,
          logo_url: true,
        },
      },
    },
  })
  if (!oferta) throw new Error('Oferta no encontrada')
  return oferta
}

const crear = async (data) => {
  const payload = {
    barberia_id: parseInt(data.barberiaId),
    titulo: data.titulo,
    descripcion: data.descripcion,
    tipo_contratacion: data.tipoContratacion,
    condicion_economica: data.condicionEconomica,
    horario: data.horario,
    vacantes: data.vacantes ? parseInt(data.vacantes) : 1,
    especialidades_buscadas: data.especialidadesBuscadas || [],
    experiencia_requerida: data.experienciaRequerida,
    herramientas_propias: data.herramientasPropias ?? false,
    fecha_limite: data.fechaLimite ? new Date(data.fechaLimite) : null,
  }
  return await prisma.ofertas_trabajo.create({ data: payload })
}

const cerrar = async (id) => {
  return await prisma.ofertas_trabajo.update({
    where: { id: parseInt(id) },
    data: { estado: 'cerrada' },
  })
}

module.exports = { obtenerTodas, obtenerPorId, crear, cerrar }
