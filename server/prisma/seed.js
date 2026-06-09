const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

function time(h, m) {
  return new Date(`1970-01-01T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
}

function date(str) {
  return new Date(str + 'T00:00:00Z')
}

async function main() {
  console.log('🌱 Seeding database...')

  // ── ESTADOS ──
  const estados = [
    { id_estado: 1, estado: 'Disponible' },
    { id_estado: 2, estado: 'Descanso' },
    { id_estado: 3, estado: 'Ocupado' },
  ]
  for (const e of estados) {
    await prisma.estados.upsert({ where: { id_estado: e.id_estado }, update: e, create: e })
  }
  console.log('  ✓ Estados')

  // ── ESPECIALIDADES ──
  const especialidades = [
    { id_especialidad: 1, especialidad: 'Corte a tijera', tiempo_estimado: 30 },
    { id_especialidad: 2, especialidad: 'Degradado / Fade', tiempo_estimado: 25 },
    { id_especialidad: 3, especialidad: 'Undercut', tiempo_estimado: 35 },
    { id_especialidad: 4, especialidad: 'Afeitado con navaja', tiempo_estimado: 20 },
    { id_especialidad: 5, especialidad: 'Diseño en cabello', tiempo_estimado: 40 },
    { id_especialidad: 6, especialidad: 'Corte + Barba', tiempo_estimado: 45 },
    { id_especialidad: 7, especialidad: 'Domicilio', tiempo_estimado: 60 },
  ]
  for (const esp of especialidades) {
    await prisma.especialidades.upsert({ where: { id_especialidad: esp.id_especialidad }, update: esp, create: esp })
  }
  console.log('  ✓ Especialidades')

  // ── BARBERÍAS (2, sin Urban Barber) ──
  const pass = await bcrypt.hash('123456', 10)
  const barberias = [
    {
      id: 1, nombre: 'BarberShop Style', nombre_dueno: 'styleup',
      contrasena: pass,
      direccion: 'Calle 16 #9-45', ciudad: 'Valledupar',
      telefono: '3001234567',
      descripcion: 'Barbería profesional en el centro de Valledupar.',
      calificacion: 4.5, total_calificaciones: 38,
      lat: 10.4635, lng: -73.2518,
      nit: '123456789-0', correo: 'styleup@barber.com', num_trabajadores: 2,
    },
    {
      id: 2, nombre: 'Classic Cuts', nombre_dueno: 'classiccuts',
      contrasena: pass,
      direccion: 'Carrera 9 #13-22', ciudad: 'Valledupar',
      telefono: '3009876543',
      descripcion: 'Especialistas en cortes clásicos y afeitado tradicional.',
      calificacion: 4.2, total_calificaciones: 22,
      lat: 10.4648, lng: -73.2540,
      nit: '123456789-1', correo: 'classic@barber.com', num_trabajadores: 2,
    },
  ]
  for (const b of barberias) {
    await prisma.barberias.upsert({ where: { id: b.id }, update: b, create: b })
  }
  console.log('  ✓ Barberías (2)')

  // ── CLIENTES (4) ──
  const clientes = [
    { cedula_cliente: '10000001', nombre: 'Juan', apellido: 'Pérez', telefono: '3001111111', correo: 'juan@email.com', contrasena: pass },
    { cedula_cliente: '10000002', nombre: 'María', apellido: 'García', telefono: '3002222222', correo: 'maria@email.com', contrasena: pass },
    { cedula_cliente: '10000003', nombre: 'Carlos', apellido: 'López', telefono: '3003333333', correo: 'carlos@email.com', contrasena: pass },
    { cedula_cliente: '10000004', nombre: 'Ana', apellido: 'Martínez', telefono: '3004444444', correo: 'ana@email.com', contrasena: pass },
  ]
  for (const c of clientes) {
    await prisma.clientes.upsert({ where: { cedula_cliente: c.cedula_cliente }, update: c, create: c })
  }
  console.log('  ✓ Clientes (4)')

  // ── BARBEROS (8) ──
  const hoy = new Date()
  const year = hoy.getFullYear()
  const month = String(hoy.getMonth() + 1).padStart(2, '0')
  const day = String(hoy.getDate()).padStart(2, '0')
  const todayStr = `${year}-${month}-${day}`

  const barberos = [
    { cedula_barbero: '20000001', nombre: 'Pedro',   apellido: 'Ramírez',  telefono: '3011111111', correo: 'pedro@barber.com', contrasena: pass, id_especialidad: 1, ciudad: 'Valledupar', direccion: 'Cra 7 #12-34', lat: 10.4630, lng: -73.2515, disponible_hoy: true, calificacion: 4.7, total_calificaciones: 15 },
    { cedula_barbero: '20000002', nombre: 'Luis',    apellido: 'Herrera',  telefono: '3012222222', correo: 'luis@barber.com', contrasena: pass, id_especialidad: 2, ciudad: 'Valledupar', direccion: 'Calle 20 #8-50', lat: 10.4640, lng: -73.2520, disponible_hoy: true, calificacion: 4.3, total_calificaciones: 22 },
    { cedula_barbero: '20000003', nombre: 'Andrés',  apellido: 'Torres',   telefono: '3013333333', correo: 'andres@barber.com', contrasena: pass, id_especialidad: 3, ciudad: 'Valledupar', direccion: 'Av 14 #10-20', lat: 10.4650, lng: -73.2535, disponible_hoy: true, calificacion: 4.5, total_calificaciones: 18 },
    { cedula_barbero: '20000004', nombre: 'David',   apellido: 'Castro',   telefono: '3014444444', correo: 'david@barber.com', contrasena: pass, id_especialidad: 6, ciudad: 'Valledupar', direccion: 'Calle 30 #5-12', lat: 10.4625, lng: -73.2505, disponible_hoy: true, calificacion: 4.1, total_calificaciones: 9 },
    { cedula_barbero: '20000005', nombre: 'Miguel',  apellido: 'Sánchez',  telefono: '3015555555', correo: 'miguel@barber.com', contrasena: pass, id_especialidad: 4, ciudad: 'Valledupar', direccion: 'Cra 10 #15-40', lat: 10.4660, lng: -73.2545, disponible_hoy: false, calificacion: 4.8, total_calificaciones: 31 },
    { cedula_barbero: '20000006', nombre: 'Javier',  apellido: 'Rojas',    telefono: '3016666666', correo: 'javier@barber.com', contrasena: pass, id_especialidad: 5, ciudad: 'Valledupar', direccion: 'Calle 5 #8-60', lat: 10.4610, lng: -73.2495, disponible_hoy: true, calificacion: 4.0, total_calificaciones: 7 },
    { cedula_barbero: '20000007', nombre: 'Fernando', apellido: 'Díaz',    telefono: '3017777777', correo: 'fernando@barber.com', contrasena: pass, id_especialidad: 7, ciudad: 'Valledupar', direccion: 'Av 20 #3-15', lat: 10.4670, lng: -73.2560, disponible_hoy: true, calificacion: 4.6, total_calificaciones: 24 },
    { cedula_barbero: '20000008', nombre: 'Ricardo', apellido: 'Mendoza',  telefono: '3018888888', correo: 'ricardo@barber.com', contrasena: pass, id_especialidad: 1, ciudad: 'Valledupar', direccion: 'Cra 15 #20-10', lat: 10.4605, lng: -73.2485, disponible_hoy: false, calificacion: 3.9, total_calificaciones: 12 },
  ]
  for (const b of barberos) {
    await prisma.barberos.upsert({ where: { cedula_barbero: b.cedula_barbero }, update: b, create: b })
  }
  console.log('  ✓ Barberos (8)')

  // ── BARBERÍA–BARBERO ──
  // BarberShop Style (id=1) → Pedro (20000001), Luis (20000002)
  // Classic Cuts (id=2) → Andrés (20000003), David (20000004)
  const vinculos = [
    { barberia_id: 1, cedula_barbero: '20000001' },
    { barberia_id: 1, cedula_barbero: '20000002' },
    { barberia_id: 2, cedula_barbero: '20000003' },
    { barberia_id: 2, cedula_barbero: '20000004' },
  ]
  // Limpiar vinculos previos y recrear (para evitar duplicados al re-ejecutar)
  await prisma.barberia_barberos.deleteMany({ where: { barberia_id: { in: [1, 2] } } })
  for (const v of vinculos) {
    await prisma.barberia_barberos.create({ data: v })
  }
  console.log('  ✓ Barbería–Barbero (4)')

  // ── HORARIOS (dinámicos, próxima semana) ──
  const dias = [0, 1, 2, 3, 4, 5] // lun-sáb offsets from today... wait, today is Tuesday June 9
  // Let's use fixed approach: iterate over next 7 days, only weekdays+Saturday
  const turnos = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
  const finTurnos = ['13:00', '13:00', '13:00', '18:00', '18:00', '18:00']

  // Delete existing horarios for our barberos to avoid conflicts on re-run
  const todasCedulas = barberos.map(b => b.cedula_barbero)
  await prisma.horario_barbero.deleteMany({ where: { cedula_barbero: { in: todasCedulas } } })

  for (const b of barberos) {
    // Each barbero works 3-5 days this week, different patterns
    const daysOff = Math.floor(Math.random() * 3) // 0,1,2 days off
    const workingDays = []
    for (let d = 0; d < 6; d++) {
      if (d < 6 - daysOff) workingDays.push(d)
    }
    for (const dayOffset of workingDays) {
      const dia = new Date(hoy)
      dia.setDate(hoy.getDate() + dayOffset)
      // Skip Sunday (day 0) — dayOffset 6 would be Monday
      if (dia.getDay() === 0) continue

      const fechaStr = dia.toISOString().split('T')[0]
      const idx = Math.floor(Math.random() * turnos.length)
      await prisma.horario_barbero.create({
        data: {
          cedula_barbero: b.cedula_barbero,
          id_estado: 1,
          hora_inicio: time(parseInt(turnos[idx].split(':')[0]), parseInt(turnos[idx].split(':')[1])),
          hora_fin: time(parseInt(finTurnos[idx].split(':')[0]), parseInt(finTurnos[idx].split(':')[1])),
          fecha: date(fechaStr),
        },
      })
    }
  }
  console.log('  ✓ Horarios')

  // ── PRECIOS ──
  const preciosPorEspecialidad = {
    1: 25000, 2: 20000, 3: 30000, 4: 15000, 5: 35000, 6: 40000, 7: 50000,
  }
  await prisma.precios_barbero.deleteMany({ where: { cedula_barbero: { in: todasCedulas } } })
  for (const b of barberos) {
    // Each barbero offers prices for their own specialty + 1 or 2 more
    const especialidadesOfrecidas = [b.id_especialidad]
    // Add 1-2 extra random specialties
    const extras = [1, 2, 3, 4, 5, 6, 7].filter(e => e !== b.id_especialidad)
    const numExtras = Math.min(extras.length, Math.floor(Math.random() * 3))
    for (let i = 0; i < numExtras; i++) {
      const idx = Math.floor(Math.random() * extras.length)
      especialidadesOfrecidas.push(extras[idx])
      extras.splice(idx, 1)
    }
    for (const espId of especialidadesOfrecidas) {
      await prisma.precios_barbero.create({
        data: {
          cedula_barbero: b.cedula_barbero,
          id_especialidad: espId,
          precio: preciosPorEspecialidad[espId] || 20000,
          duracion: especialidades.find(e => e.id_especialidad === espId)?.tiempo_estimado || 30,
          activo: true,
        },
      })
    }
  }
  console.log('  ✓ Precios')

  // ── CITAS DE EJEMPLO ──
  await prisma.citas.deleteMany({ where: { cedula_barbero: { in: todasCedulas } } })
  const citas = [
    // Pedro (20000001) — pendiente hoy a las 10am, Corte a tijera (1)
    { id_cita: 'CIT-001', cedula_cliente: '10000001', cedula_barbero: '20000001', fecha: date(todayStr), hora: time(10, 0), hora_fin: time(10, 30), id_especialidad: 1, estado: 'Pendiente' },
    // Luis (20000002) — completada ayer, Fade (2)
    { id_cita: 'CIT-002', cedula_cliente: '10000002', cedula_barbero: '20000002', fecha: date(todayStr), hora: time(11, 0), hora_fin: time(11, 25), id_especialidad: 2, estado: 'Pendiente' },
    // Andrés (20000003) — pendiente mañana, Undercut (3)
    { id_cita: 'CIT-003', cedula_cliente: '10000003', cedula_barbero: '20000003', fecha: date(todayStr), hora: time(14, 0), hora_fin: time(14, 35), id_especialidad: 3, estado: 'Pendiente' },
    // David (20000004) — cancelada, Corte + Barba (6)
    { id_cita: 'CIT-004', cedula_cliente: '10000004', cedula_barbero: '20000004', fecha: date(todayStr), hora: time(15, 0), hora_fin: time(15, 45), id_especialidad: 6, estado: 'Cancelada' },
    // Miguel independiente (20000005) — completada, Afeitado (4)
    { id_cita: 'CIT-005', cedula_cliente: '10000001', cedula_barbero: '20000005', fecha: date(todayStr), hora: time(9, 0), hora_fin: time(9, 20), id_especialidad: 4, estado: 'Completada' },
    // Javier independiente (20000006) — pendiente, Diseño (5)
    { id_cita: 'CIT-006', cedula_cliente: '10000003', cedula_barbero: '20000006', fecha: date(todayStr), hora: time(16, 0), hora_fin: time(16, 40), id_especialidad: 5, estado: 'Pendiente' },
  ]
  for (const c of citas) {
    await prisma.citas.create({ data: c })
  }
  console.log('  ✓ Citas de ejemplo (6)')

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
