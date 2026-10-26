const express = require('express')
const router = express.Router()
const cvService = require('../services/cv.service')
const authMiddleware = require('../middleware/auth')

// Obtener CV de un barbero (protegido)
router.get('/:cedula', authMiddleware, async (req, res) => {
  try {
    const cv = await cvService.obtenerPorBarbero(req.params.cedula)
    if (!cv) return res.status(404).json({ error: 'CV no encontrado' })
    res.json(cv)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Guardar/actualizar CV de un barbero (protegido)
router.put('/:cedula', authMiddleware, async (req, res) => {
  try {
    const cv = await cvService.guardar(req.params.cedula, req.body)
    res.json({ mensaje: 'CV guardado', cv })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
