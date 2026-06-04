const express = require('express')
const router = express.Router()
const horarioService = require('../services/horarios.service')
const authMiddleware = require('../middleware/auth')

// Obtener horarios por barbero (público)
router.get('/:cedula_barbero', async (req, res) => {
  try {
    const horarios = await horarioService.obtenerPorBarbero(req.params.cedula_barbero)
    res.json(horarios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear horario (protegido)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const horario = await horarioService.crear(req.body)
    res.status(201).json({ mensaje: 'Horario creado correctamente', horario })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Actualizar horario (protegido)
router.put('/:cedula_barbero/:fecha', authMiddleware, async (req, res) => {
  try {
    const horario = await horarioService.actualizar(
      req.params.cedula_barbero,
      req.params.fecha,
      req.body
    )
    res.json({ mensaje: 'Horario actualizado', horario })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router