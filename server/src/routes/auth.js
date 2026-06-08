require('dotenv').config()
const express = require('express')
const router = express.Router()
const authService = require('../services/auth.service')

router.post('/login/cliente', async (req, res) => {
  try {
    const result = await authService.loginCliente(req.body.correo, req.body.contrasena)
    res.json(result)
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

router.post('/login/barbero', async (req, res) => {
  try {
    const result = await authService.loginBarbero(req.body.correo, req.body.contrasena)
    res.json(result)
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

router.post('/registro/cliente', async (req, res) => {
  try {
    const cliente = await authService.registrarCliente(req.body)
    res.status(201).json({ mensaje: 'Cliente registrado', cedula: cliente.cedula_cliente })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/registro/barbero', async (req, res) => {
  try {
    const barbero = await authService.registrarBarbero(req.body)
    res.status(201).json({ mensaje: 'Barbero registrado', cedula: barbero.cedula_barbero })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/login/barberia', async (req, res) => {
  try {
    const result = await authService.loginBarberia(req.body.correo, req.body.contrasena)
    res.json(result)
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

router.post('/registro/barberia', async (req, res) => {
  try {
    const barberia = await authService.registrarBarberia(req.body)
    res.status(201).json({ mensaje: 'Barbería registrada', id: barberia.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router