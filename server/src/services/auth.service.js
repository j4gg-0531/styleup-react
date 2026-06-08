const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const loginCliente = async (correo, contrasena) => {
  const cliente = await prisma.clientes.findUnique({ where: { correo } })
  if (!cliente) throw new Error('Cliente no encontrado')

  const valid = await bcrypt.compare(contrasena, cliente.contrasena)
  if (!valid) throw new Error('Contraseña incorrecta')

  const token = jwt.sign(
    { cedula: cliente.cedula_cliente, tipo: 'cliente' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )
  return { token, nombre: cliente.nombre, tipo: 'cliente' }
}

const loginBarbero = async (correo, contrasena) => {
  const barbero = await prisma.barberos.findUnique({ where: { correo } })
  if (!barbero) throw new Error('Barbero no encontrado')

  const valid = await bcrypt.compare(contrasena, barbero.contrasena)
  if (!valid) throw new Error('Contraseña incorrecta')

  const token = jwt.sign(
    { cedula: barbero.cedula_barbero, tipo: 'barbero' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )
  return { token, nombre: barbero.nombre, tipo: 'barbero' }
}

const registrarCliente = async (data) => {
  const hash = await bcrypt.hash(data.contrasena, 10)
  return await prisma.clientes.create({
    data: { ...data, contrasena: hash }
  })
}

const registrarBarbero = async (data) => {
  const hash = await bcrypt.hash(data.contrasena, 10)
  return await prisma.barberos.create({
    data: { ...data, contrasena: hash }
  })
}

const loginBarberia = async (correo, contrasena) => {
  const barberia = await prisma.barberias.findUnique({ where: { correo } })
  if (!barberia) throw new Error('Barbería no encontrada')

  const valid = await bcrypt.compare(contrasena, barberia.contrasena)
  if (!valid) throw new Error('Contraseña incorrecta')

  const token = jwt.sign(
    { id: barberia.id, tipo: 'barberia', nombre: barberia.nombre_dueno },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )
  return { token, nombre: barberia.nombre_dueno, tipo: 'barberia', barberiaId: barberia.id }
}

const registrarBarberia = async (data) => {
  const hash = await bcrypt.hash(data.contrasena, 10)
  return await prisma.barberias.create({
    data: {
      nombre: data.nombre,
      nombre_dueno: data.nombre_dueno,
      direccion: data.direccion,
      ciudad: data.ciudad,
      telefono: data.telefono,
      descripcion: data.descripcion,
      correo: data.correo,
      nit: data.nit,
      num_trabajadores: data.num_trabajadores || 1,
      contrasena: hash,
    }
  })
}

module.exports = { loginCliente, loginBarbero, loginBarberia, registrarCliente, registrarBarbero, registrarBarberia }