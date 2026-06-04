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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})