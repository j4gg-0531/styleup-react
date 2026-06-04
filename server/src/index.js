require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Servidor StyleUp funcionando ✅' })
})

const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)

const barberosRoutes = require('./routes/barberos')
app.use('/api/barberos', barberosRoutes)

const clientesRoutes = require('./routes/clientes')
app.use('/api/clientes', clientesRoutes)

const citasRoutes = require('./routes/citas')
app.use('/api/citas', citasRoutes)

const especialidadesRoutes = require('./routes/especialidades')
app.use('/api/especialidades', especialidadesRoutes)

const horariosRoutes = require('./routes/horarios')
app.use('/api/horarios', horariosRoutes)

const preciosRoutes = require('./routes/precios')
app.use('/api/precios', preciosRoutes)

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})