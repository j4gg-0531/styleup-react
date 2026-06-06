const prisma = require('../lib/prisma')

const obtenerTodas = async () => {
  return await prisma.especialidades.findMany()
}

const obtenerPorId = async (id_especialidad) => {
  const especialidad = await prisma.especialidades.findUnique({
    where: { id_especialidad: parseInt(id_especialidad) }
  })
  if (!especialidad) throw new Error('Especialidad no encontrada')
  return especialidad
}

module.exports = { obtenerTodas, obtenerPorId }