/**
 * Middleware para restringir acceso por rol.
 * Uso: router.get('/', authMiddleware, requireRole('barberia'), handler)
 *      router.post('/', authMiddleware, requireRole('barberia', 'barbero'), handler)
 */
const requireRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Autenticación requerida' })
    }

    if (!rolesPermitidos.includes(req.usuario.tipo)) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
      })
    }

    next()
  }
}

module.exports = { requireRole }
