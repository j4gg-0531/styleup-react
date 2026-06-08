const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── ESTADOS ──
  const estados = [
    { id_estado: 1, estado: 'Disponible' },
    { id_estado: 2, estado: 'Descanso' },
    { id_estado: 3, estado: 'Ocupado' },
  ]
  for (const e of estados) {
    await prisma.estados.upsert({
      where: { id_estado: e.id_estado },
      update: e,
      create: e,
    })
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
    await prisma.especialidades.upsert({
      where: { id_especialidad: esp.id_especialidad },
      update: esp,
      create: esp,
    })
  }
  console.log('  ✓ Especialidades')

  // ── BARBERÍAS ──
  const barberias = [
    {
      id: 1, nombre: 'BarberShop Style', nombre_dueno: 'styleup',
      direccion: 'Calle 16 #9-45', ciudad: 'Valledupar',
      telefono: '3001234567',
      descripcion: 'Barbería profesional en el centro de Valledupar.',
      calificacion: 4.5, total_calificaciones: 38,
      lat: 10.4635, lng: -73.2518,
      nit: '123456789-0', correo: 'styleup@barber.com', num_trabajadores: 2,
    },
    {
      id: 2, nombre: 'Classic Cuts', nombre_dueno: 'classiccuts',
      direccion: 'Carrera 9 #13-22', ciudad: 'Valledupar',
      telefono: '3009876543',
      descripcion: 'Especialistas en cortes clásicos y afeitado tradicional.',
      calificacion: 4.2, total_calificaciones: 22,
      lat: 10.4648, lng: -73.2540,
      nit: '123456789-1', correo: 'classic@barber.com', num_trabajadores: 1,
    },
    {
      id: 3, nombre: 'Urban Barber', nombre_dueno: 'urbanbarber',
      direccion: 'Avenida Simón Bolívar #8-10', ciudad: 'Valledupar',
      telefono: '3157654321',
      descripcion: 'Estilo urbano y moderno para el hombre contemporáneo.',
      calificacion: 4.8, total_calificaciones: 55,
      lat: 10.4620, lng: -73.2505,
      nit: '123456789-2', correo: 'urban@barber.com', num_trabajadores: 0,
    },
  ]
  for (const b of barberias) {
    await prisma.barberias.upsert({
      where: { id: b.id },
      update: b,
      create: b,
    })
  }
  console.log('  ✓ Barberías')

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
