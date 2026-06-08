-- Seed data for StyleUp
-- 2026-06-08

-- ────────── ESTADOS ──────────
INSERT INTO estados (id_estado, estado)
VALUES
  (1, 'Disponible'),
  (2, 'Descanso'),
  (3, 'Ocupado')
ON CONFLICT (id_estado) DO NOTHING;

SELECT SETVAL('seq_estados', (SELECT COALESCE(MAX(id_estado), 0) FROM estados));

-- ────────── ESPECIALIDADES (Servicios) ──────────
INSERT INTO especialidades (id_especialidad, especialidad, tiempo_estimado)
VALUES
  (1, 'Corte a tijera',     30),
  (2, 'Degradado / Fade',   25),
  (3, 'Undercut',           35),
  (4, 'Afeitado con navaja',20),
  (5, 'Diseño en cabello',  40),
  (6, 'Corte + Barba',      45),
  (7, 'Domicilio',          60)
ON CONFLICT (id_especialidad) DO NOTHING;

SELECT SETVAL('seq_especialidades', (SELECT COALESCE(MAX(id_especialidad), 0) FROM especialidades));

-- ────────── BARBERÍAS DE EJEMPLO ──────────
INSERT INTO barberias (id, nombre, nombre_dueno, direccion, ciudad, telefono, descripcion, calificacion, total_calificaciones, lat, lng, nit, correo, num_trabajadores)
VALUES
  (1, 'BarberShop Style',  'styleup',    'Calle 16 #9-45',       'Valledupar', '3001234567', 'Barbería profesional en el centro de Valledupar.', 4.5, 38, 10.4635, -73.2518, '123456789-0', 'styleup@barber.com', 2),
  (2, 'Classic Cuts',      'classiccuts','Carrera 9 #13-22',     'Valledupar', '3009876543', 'Especialistas en cortes clásicos y afeitado tradicional.', 4.2, 22, 10.4648, -73.2540, '123456789-1', 'classic@barber.com', 1),
  (3, 'Urban Barber',      'urbanbarber','Avenida Simón Bolívar #8-10', 'Valledupar', '3157654321', 'Estilo urbano y moderno para el hombre contemporáneo.', 4.8, 55, 10.4620, -73.2505, '123456789-2', 'urban@barber.com', 0)
ON CONFLICT (id) DO NOTHING;

SELECT SETVAL('barberias_id_seq', (SELECT COALESCE(MAX(id), 0) FROM barberias));
