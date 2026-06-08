const express = require('express')
const router = express.Router()
const propuestaService = require('../services/propuestas.service')
const authMiddleware = require('../middleware/auth')

// Obtener propuestas por barbero (protegido)
router.get('/barbero/:cedula', authMiddleware, async (req, res) => {
  try {
    const propuestas = await propuestaService.obtenerPorBarbero(req.params.cedula)
    res.json(propuestas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener propuestas por barbería (protegido)
router.get('/barberia/:barberiaId', authMiddleware, async (req, res) => {
  try {
    const propuestas = await propuestaService.obtenerPorBarberia(req.params.barberiaId)
    res.json(propuestas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear propuesta (protegido)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const propuesta = await propuestaService.crear(req.body)
    res.status(201).json({ mensaje: 'Propuesta creada', propuesta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Aceptar propuesta (protegido)
router.patch('/:id/aceptar', authMiddleware, async (req, res) => {
  try {
    const propuesta = await propuestaService.aceptar(req.params.id)
    res.json({ mensaje: 'Propuesta aceptada', propuesta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Rechazar propuesta (protegido)
router.patch('/:id/rechazar', authMiddleware, async (req, res) => {
  try {
    const propuesta = await propuestaService.rechazar(req.params.id)
    res.json({ mensaje: 'Propuesta rechazada', propuesta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
