const express = require('express')
const router = express.Router()
const chatService = require('../services/chat.service')
const authMiddleware = require('../middleware/auth')

// Obtener mensajes entre dos usuarios (protegido)
router.get('/mensajes', authMiddleware, async (req, res) => {
  try {
    const { usuario1, usuario2 } = req.query
    if (!usuario1 || !usuario2) {
      return res.status(400).json({ error: 'usuario1 y usuario2 son requeridos' })
    }
    const mensajes = await chatService.obtenerMensajes(usuario1, usuario2)
    res.json(mensajes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Enviar mensaje (protegido)
router.post('/enviar', authMiddleware, async (req, res) => {
  try {
    const mensaje = await chatService.enviarMensaje(req.body)
    res.status(201).json({ mensaje: 'Mensaje enviado', data: mensaje })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener conversaciones de un usuario (protegido)
router.get('/conversaciones', authMiddleware, async (req, res) => {
  try {
    const { usuario } = req.query
    if (!usuario) return res.status(400).json({ error: 'usuario es requerido' })
    const conversaciones = await chatService.obtenerConversaciones(usuario)
    res.json(conversaciones)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Contar mensajes no leídos (protegido)
router.get('/no-leidos', authMiddleware, async (req, res) => {
  try {
    const { usuario } = req.query
    if (!usuario) return res.status(400).json({ error: 'usuario es requerido' })
    const count = await chatService.contarNoLeidos(usuario)
    res.json({ total: count })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Marcar mensajes como leídos (protegido)
router.post('/marcar-leidos', authMiddleware, async (req, res) => {
  try {
    const { usuario1, usuario2 } = req.body
    await chatService.marcarLeidos(usuario1, usuario2)
    res.json({ mensaje: 'Mensajes marcados como leídos' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Eliminar un mensaje (protegido — solo el remitente)
router.delete('/mensajes/:id', authMiddleware, async (req, res) => {
  try {
    const { remitente } = req.query
    if (!remitente) return res.status(400).json({ error: 'remitente es requerido' })
    await chatService.eliminarMensaje(req.params.id, remitente)
    res.json({ mensaje: 'Mensaje eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Eliminar conversación completa (protegido)
router.delete('/conversacion', authMiddleware, async (req, res) => {
  try {
    const { usuario1, usuario2 } = req.query
    if (!usuario1 || !usuario2) return res.status(400).json({ error: 'usuario1 y usuario2 son requeridos' })
    const count = await chatService.eliminarConversacion(usuario1, usuario2)
    res.json({ mensaje: `${count.count} mensajes eliminados` })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
