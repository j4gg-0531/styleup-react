require('dotenv').config()
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Login clientes
router.post('/login/cliente', async (req, res) => {
  try {
    const { correo, contrasena } = req.body
    const cliente = await prisma.clientes.findUnique({
      where: { correo }
    })
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' })

    const valid = await bcrypt.compare(contrasena, cliente.contrasena)
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' })

    const token = jwt.sign(
      { cedula: cliente.cedula_cliente, tipo: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )
    res.json({ token, nombre: cliente.nombre, tipo: 'cliente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
})

// Login barberos
router.post('/login/barbero', async (req, res) => {
  try {
    const { correo, contrasena } = req.body
    const barbero = await prisma.barberos.findUnique({
      where: { correo }
    })
    if (!barbero) return res.status(404).json({ error: 'Barbero no encontrado' })

    const valid = await bcrypt.compare(contrasena, barbero.contrasena)
    if (!valid) return res.status(401).json({ error: 'Contraseña incorrecta' })

    const token = jwt.sign(
      { cedula: barbero.cedula_barbero, tipo: 'barbero' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )
    res.json({ token, nombre: barbero.nombre, tipo: 'barbero' })
  } catch (error) {
    res.status(500).json({ error: 'Error en el login' })
  }
})

// Registro clientes
router.post('/registro/cliente', async (req, res) => {
  try {
    const { cedula_cliente, nombre, apellido, telefono, correo, contrasena } = req.body
    const hash = await bcrypt.hash(contrasena, 10)
    const cliente = await prisma.clientes.create({
      data: { cedula_cliente, nombre, apellido, telefono, correo, contrasena: hash }
    })
    res.status(201).json({ mensaje: 'Cliente registrado', cedula: cliente.cedula_cliente })
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar cliente' })
  }
})

// Registro barberos
router.post('/registro/barbero', async (req, res) => {
  try {
    const { cedula_barbero, nombre, apellido, telefono, correo, contrasena, id_especialidad, direccion, ciudad } = req.body
    const hash = await bcrypt.hash(contrasena, 10)
    const barbero = await prisma.barberos.create({
      data: { cedula_barbero, nombre, apellido, telefono, correo, contrasena: hash, id_especialidad, direccion, ciudad }
    })
    res.status(201).json({ mensaje: 'Barbero registrado', cedula: barbero.cedula_barbero })
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar barbero' })
  }
})

module.exports = router