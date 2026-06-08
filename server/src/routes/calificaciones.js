const express = require('express')
const router = express.Router()
const calificacionService = require('../services/calificaciones.service')
const authMiddleware = require('../middleware/auth')

// Obtener calificaciones de un barbero (público)
router.get('/barbero/:cedula', async (req, res) => {
  try {
    const calificaciones = await calificacionService.obtenerPorBarbero(req.params.cedula)
    res.json(calificaciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener calificaciones de una barbería (público)
router.get('/barberia/:barberiaId', async (req, res) => {
  try {
    const calificaciones = await calificacionService.obtenerPorBarberia(req.params.barberiaId)
    res.json(calificaciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear calificación (protegido — cliente)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const calificacion = await calificacionService.crear(req.body)
    res.status(201).json({ mensaje: 'Calificación creada', calificacion })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
