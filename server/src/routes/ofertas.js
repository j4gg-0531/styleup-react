const express = require('express')
const router = express.Router()
const ofertaService = require('../services/ofertas.service')
const authMiddleware = require('../middleware/auth')

// Obtener todas las ofertas (público) — con filtros opcionales
router.get('/', async (req, res) => {
  try {
    const ofertas = await ofertaService.obtenerTodas(req.query)
    res.json(ofertas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener oferta por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const oferta = await ofertaService.obtenerPorId(req.params.id)
    res.json(oferta)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Crear oferta (protegido — barbería)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const oferta = await ofertaService.crear(req.body)
    res.status(201).json({ mensaje: 'Oferta creada', oferta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Cerrar oferta (protegido)
router.patch('/:id/cerrar', authMiddleware, async (req, res) => {
  try {
    const oferta = await ofertaService.cerrar(req.params.id)
    res.json({ mensaje: 'Oferta cerrada', oferta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
