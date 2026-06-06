    const express = require('express')
const router = express.Router()
const precioService = require('../services/precios.service')
const authMiddleware = require('../middleware/auth')

// Obtener precios por barbero (público)
router.get('/:cedula_barbero', async (req, res) => {
  try {
    const precios = await precioService.obtenerPorBarbero(req.params.cedula_barbero)
    res.json(precios)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Crear precio (protegido)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const precio = await precioService.crear(req.body)
    res.status(201).json({ mensaje: 'Precio creado correctamente', precio })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Actualizar precio (protegido)
router.put('/:cedula_barbero/:id_especialidad', authMiddleware, async (req, res) => {
  try {
    const precio = await precioService.actualizar(
      req.params.cedula_barbero,
      req.params.id_especialidad,
      req.body.precio
    )
    res.json({ mensaje: 'Precio actualizado', precio })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router