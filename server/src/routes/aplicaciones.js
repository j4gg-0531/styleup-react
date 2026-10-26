const express = require('express')
const router = express.Router()
const aplicacionService = require('../services/aplicaciones.service')
const authMiddleware = require('../middleware/auth')

// Obtener aplicaciones por oferta (protegido)
router.get('/oferta/:ofertaId', authMiddleware, async (req, res) => {
  try {
    const aplicaciones = await aplicacionService.obtenerPorOferta(req.params.ofertaId)
    res.json(aplicaciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener aplicaciones por barbero (protegido)
router.get('/barbero/:cedula', authMiddleware, async (req, res) => {
  try {
    const aplicaciones = await aplicacionService.obtenerPorBarbero(req.params.cedula)
    res.json(aplicaciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear aplicación (protegido — barbero)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const aplicacion = await aplicacionService.crear(req.body)
    if (!aplicacion) {
      return res.status(409).json({ error: 'Ya aplicaste a esta oferta' })
    }
    res.status(201).json({ mensaje: 'Aplicación enviada', aplicacion })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Cambiar estado de aplicación (protegido — barbería)
router.patch('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const aplicacion = await aplicacionService.cambiarEstado(
      req.params.id,
      req.body.estado
    )
    res.json({ mensaje: 'Estado actualizado', aplicacion })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
