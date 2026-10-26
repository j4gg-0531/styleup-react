require('dotenv').config()
const path = require('path')
const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use(express.static(path.join(__dirname, '../../dist')))

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

const barberiasRoutes = require('./routes/barberias')
app.use('/api/barberias', barberiasRoutes)

const barberiaBarberosRoutes = require('./routes/barberia-barberos')
app.use('/api/barberia-barberos', barberiaBarberosRoutes)

const ofertasRoutes = require('./routes/ofertas')
app.use('/api/ofertas', ofertasRoutes)

const aplicacionesRoutes = require('./routes/aplicaciones')
app.use('/api/aplicaciones', aplicacionesRoutes)

const cvRoutes = require('./routes/cv')
app.use('/api/cv', cvRoutes)

const chatRoutes = require('./routes/chat')
app.use('/api/chat', chatRoutes)

const notificacionesRoutes = require('./routes/notificaciones')
app.use('/api/notificaciones', notificacionesRoutes)

const propuestasRoutes = require('./routes/propuestas')
app.use('/api/propuestas', propuestasRoutes)

const calificacionesRoutes = require('./routes/calificaciones')
app.use('/api/calificaciones', calificacionesRoutes)

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})