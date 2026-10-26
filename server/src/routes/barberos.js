const express = require('express')
const router = express.Router()
const barberoService = require('../services/barberos.service')
const authMiddleware = require('../middleware/auth')

// Obtener todos los barberos (público)
router.get('/', async (req, res) => {
  try {
    const barberos = await barberoService.obtenerTodos()
    res.json(barberos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener un barbero por cédula (público)
router.get('/:cedula', async (req, res) => {
  try {
    const barbero = await barberoService.obtenerPorCedula(req.params.cedula)
    res.json(barbero)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Actualizar barbero (protegido)
router.put('/:cedula', authMiddleware, async (req, res) => {
  try {
    const barbero = await barberoService.actualizar(req.params.cedula, req.body)
    res.json(barbero)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Eliminar barbero (protegido)
router.delete('/:cedula', authMiddleware, async (req, res) => {
  try {
    await barberoService.eliminar(req.params.cedula)
    res.json({ mensaje: 'Barbero eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router