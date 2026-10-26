const express = require('express')
const router = express.Router()
const citaService = require('../services/citas.service')
const authMiddleware = require('../middleware/auth')

// Obtener todas las citas (protegido)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const citas = await citaService.obtenerTodas()
    res.json(citas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener citas por cliente (protegido)
router.get('/cliente/:cedula', authMiddleware, async (req, res) => {
  try {
    const citas = await citaService.obtenerPorCliente(req.params.cedula)
    res.json(citas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener citas por barbero (protegido)
router.get('/barbero/:cedula', authMiddleware, async (req, res) => {
  try {
    const citas = await citaService.obtenerPorBarbero(req.params.cedula)
    res.json(citas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear cita (protegido)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const cita = await citaService.crear(req.body)
    res.status(201).json({ mensaje: 'Cita creada correctamente', cita })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Actualizar estado de cita (protegido)
router.patch('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const cita = await citaService.actualizarEstado(req.params.id, req.body.estado)
    res.json({ mensaje: 'Estado actualizado', cita })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Cancelar cita (protegido)
router.patch('/:id/cancelar', authMiddleware, async (req, res) => {
  try {
    const cita = await citaService.cancelar(req.params.id)
    res.json({ mensaje: 'Cita cancelada correctamente', cita })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener citas por barbería (protegido)
router.get('/barberia/:id', authMiddleware, async (req, res) => {
  try {
    const citas = await citaService.obtenerPorBarberia(req.params.id, req.query.mes, req.query.anio)
    res.json(citas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router