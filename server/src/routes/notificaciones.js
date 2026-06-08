const express = require('express')
const router = express.Router()
const notificacionService = require('../services/notificaciones.service')
const authMiddleware = require('../middleware/auth')

// Obtener notificaciones por usuario (protegido)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rol, nombre } = req.query
    if (!rol || !nombre) {
      return res.status(400).json({ error: 'rol y nombre son requeridos' })
    }
    const notificaciones = await notificacionService.obtenerPorUsuario(rol, nombre)
    res.json(notificaciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener no leídas (protegido)
router.get('/no-leidas', authMiddleware, async (req, res) => {
  try {
    const { rol, nombre } = req.query
    if (!rol || !nombre) {
      return res.status(400).json({ error: 'rol y nombre son requeridos' })
    }
    const noLeidas = await notificacionService.obtenerNoLeidas(rol, nombre)
    res.json(noLeidas)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Contar no leídas (protegido)
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const { rol, nombre } = req.query
    if (!rol || !nombre) {
      return res.status(400).json({ error: 'rol y nombre son requeridos' })
    }
    const total = await notificacionService.contarNoLeidas(rol, nombre)
    res.json({ total })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear notificación (protegido)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const notificacion = await notificacionService.crear(req.body)
    res.status(201).json({ mensaje: 'Notificación creada', notificacion })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Marcar una como leída (protegido)
router.patch('/:id/leer', authMiddleware, async (req, res) => {
  try {
    await notificacionService.marcarLeida(req.params.id)
    res.json({ mensaje: 'Notificación marcada como leída' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Marcar todas como leídas (protegido)
router.post('/leer-todas', authMiddleware, async (req, res) => {
  try {
    const { rol, nombre } = req.body
    await notificacionService.marcarTodasLeidas(rol, nombre)
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
