const express = require('express')
const router = express.Router()
const barberiaBarberoService = require('../services/barberia-barberos.service')
const authMiddleware = require('../middleware/auth')

// Obtener barberos de una barbería (público)
router.get('/barberia/:barberiaId', async (req, res) => {
  try {
    const barberos = await barberiaBarberoService.obtenerPorBarberia(req.params.barberiaId)
    res.json(barberos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener barberías de un barbero (protegido)
router.get('/barbero/:cedula', authMiddleware, async (req, res) => {
  try {
    const barberias = await barberiaBarberoService.obtenerPorBarbero(req.params.cedula)
    res.json(barberias)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Agregar barbero a barbería (protegido)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const relation = await barberiaBarberoService.agregarBarbero(
      req.body.barberiaId,
      req.body.cedulaBarbero
    )
    res.status(201).json({ mensaje: 'Barbero agregado a la barbería', relation })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Desactivar barbero de barbería (protegido)
router.delete('/:barberiaId/:cedula', authMiddleware, async (req, res) => {
  try {
    await barberiaBarberoService.desactivarBarbero(req.params.barberiaId, req.params.cedula)
    res.json({ mensaje: 'Barbero desactivado de la barbería' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
