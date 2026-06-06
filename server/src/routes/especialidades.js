const express = require('express')
const router = express.Router()
const especialidadService = require('../services/especialidades.service')

// Obtener todas (público)
router.get('/', async (req, res) => {
  try {
    const especialidades = await especialidadService.obtenerTodas()
    res.json(especialidades)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const especialidad = await especialidadService.obtenerPorId(req.params.id)
    res.json(especialidad)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

module.exports = router