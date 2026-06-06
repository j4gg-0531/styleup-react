const express = require('express')
const router = express.Router()
const clienteService = require('../services/clientes.service')
const authMiddleware = require('../middleware/auth')

// Obtener todos los clientes (protegido)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clientes = await clienteService.obtenerTodos()
    res.json(clientes)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Obtener un cliente por cédula (protegido)
router.get('/:cedula', authMiddleware, async (req, res) => {
  try {
    const cliente = await clienteService.obtenerPorCedula(req.params.cedula)
    res.json(cliente)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
})

// Actualizar cliente (protegido)
router.put('/:cedula', authMiddleware, async (req, res) => {
  try {
    const cliente = await clienteService.actualizar(req.params.cedula, req.body)
    res.json(cliente)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Eliminar cliente (protegido)
router.delete('/:cedula', authMiddleware, async (req, res) => {
  try {
    await clienteService.eliminar(req.params.cedula)
    res.json({ mensaje: 'Cliente eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router