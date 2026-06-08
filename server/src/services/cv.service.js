const prisma = require('../lib/prisma')

const obtenerPorBarbero = async (cedulaBarbero) => {
  const cv = await prisma.hojas_de_vida.findUnique({
    where: { cedula_barbero: cedulaBarbero },
  })
  return cv
}

const guardar = async (cedulaBarbero, data) => {
  const payload = {
    presentacion: data.presentacion,
    nivel: data.nivel,
    anos_experiencia: data.anosExperiencia,
    especialidades: data.especialidades || [],
    disponibilidad: data.disponibilidad,
    modalidad: data.modalidad,
    herramientas_propias: data.herramientasPropias ?? false,
    experiencia_laboral: data.experienciaLaboral || [],
    certificados: data.certificados || [],
    reconocimientos: data.reconocimientos || [],
    mensaje: data.mensaje,
  }

  return await prisma.hojas_de_vida.upsert({
    where: { cedula_barbero: cedulaBarbero },
    update: { ...payload, fecha_actualizacion: new Date() },
    create: { cedula_barbero: cedulaBarbero, ...payload },
  })
}

module.exports = { obtenerPorBarbero, guardar }
