const express = require('express')
const router = express.Router()
const barberiaService = require('../services/barberia.service')
const authMiddleware = require('../middleware/auth')

// Obtener todas las barberías (público)
router.get('/', async (req, res) => {
  try {
    const barberias = await barberiaService.obtenerTodas()
    res.json(barberias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener barbería por ID (público)
router.get('/:id', async (req, res) => {
  try {
    const barberia = await barberiaService.obtenerPorId(req.params.id)
    res.json(barberia)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Obtener barbería por nombre del dueño (público)
router.get('/owner/:nombreDueno', async (req, res) => {
  try {
    const barberia = await barberiaService.obtenerPorNombreDueno(req.params.nombreDueno)
    if (!barberia) return res.status(404).json({ error: 'Barbería no encontrada' })
    res.json(barberia)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear barbería (protegido)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const barberia = await barberiaService.crear(req.body)
    res.status(201).json({ mensaje: 'Barbería creada', barberia })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Actualizar barbería (protegido)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const barberia = await barberiaService.actualizar(req.params.id, req.body)
    res.json({ mensaje: 'Barbería actualizada', barberia })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Eliminar barbería (protegido)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await barberiaService.eliminar(req.params.id)
    res.json({ mensaje: 'Barbería eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
