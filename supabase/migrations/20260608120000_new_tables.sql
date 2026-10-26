-- Migration: New tables + columns for StyleUp
-- 2026-06-08

-- ────────── ALTER EXISTING TABLES ──────────

ALTER TABLE barberos
  ADD COLUMN IF NOT EXISTS calificacion DECIMAL(3, 2),
  ADD COLUMN IF NOT EXISTS total_calificaciones INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS instagram VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tiktok VARCHAR(100),
  ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS lng DECIMAL(10, 7),
  ADD COLUMN IF NOT EXISTS disponible_hoy BOOLEAN DEFAULT true;

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

ALTER TABLE citas
  ADD COLUMN IF NOT EXISTS hora_fin TIME;

ALTER TABLE precios_barbero
  ADD COLUMN IF NOT EXISTS duracion INTEGER,
  ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- ────────── NEW TABLES ──────────

CREATE TABLE IF NOT EXISTS barberias (
  id                  SERIAL PRIMARY KEY,
  nombre              VARCHAR(150) NOT NULL,
  nombre_dueno        VARCHAR(100),
  contrasena          VARCHAR(255),
  direccion           VARCHAR(200),
  ciudad              VARCHAR(100),
  telefono            VARCHAR(20),
  descripcion         TEXT,
  calificacion        DECIMAL(3, 2),
  total_calificaciones INTEGER DEFAULT 0,
  lat                 DECIMAL(10, 7),
  lng                 DECIMAL(10, 7),
  logo_url            VARCHAR(500),
  nit                 VARCHAR(20),
  correo              VARCHAR(150) UNIQUE,
  num_trabajadores    INTEGER DEFAULT 1,
  fecha_registro      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barberia_barberos (
  id              SERIAL PRIMARY KEY,
  barberia_id     INTEGER NOT NULL REFERENCES barberias(id) ON DELETE CASCADE,
  cedula_barbero  VARCHAR(10) NOT NULL REFERENCES barberos(cedula_barbero) ON DELETE CASCADE,
  fecha_ingreso   TIMESTAMP DEFAULT NOW(),
  activo          BOOLEAN DEFAULT true,
  UNIQUE (barberia_id, cedula_barbero)
);

CREATE TABLE IF NOT EXISTS ofertas_trabajo (
  id                        SERIAL PRIMARY KEY,
  barberia_id               INTEGER NOT NULL REFERENCES barberias(id) ON DELETE CASCADE,
  titulo                    VARCHAR(200) NOT NULL,
  descripcion               TEXT,
  tipo_contratacion         VARCHAR(50),
  condicion_economica       VARCHAR(200),
  horario                   VARCHAR(200),
  vacantes                  INTEGER DEFAULT 1,
  especialidades_buscadas   JSONB,
  experiencia_requerida     VARCHAR(50),
  herramientas_propias      BOOLEAN DEFAULT false,
  fecha_limite              DATE,
  estado                    VARCHAR(20) DEFAULT 'activa',
  fecha_creacion            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS aplicaciones (
  id              SERIAL PRIMARY KEY,
  oferta_id       INTEGER NOT NULL REFERENCES ofertas_trabajo(id) ON DELETE CASCADE,
  cedula_barbero  VARCHAR(10) NOT NULL REFERENCES barberos(cedula_barbero) ON DELETE CASCADE,
  hoja_de_vida    JSONB,
  estado          VARCHAR(20) DEFAULT 'pendiente',
  fecha_creacion  TIMESTAMP DEFAULT NOW(),
  UNIQUE (oferta_id, cedula_barbero)
);

CREATE TABLE IF NOT EXISTS hojas_de_vida (
  id                    SERIAL PRIMARY KEY,
  cedula_barbero        VARCHAR(10) NOT NULL UNIQUE REFERENCES barberos(cedula_barbero) ON DELETE CASCADE,
  presentacion          TEXT,
  nivel                 VARCHAR(50),
  anos_experiencia      VARCHAR(20),
  especialidades        JSONB,
  disponibilidad        VARCHAR(50),
  modalidad             VARCHAR(50),
  herramientas_propias  BOOLEAN DEFAULT false,
  experiencia_laboral   JSONB,
  certificados          JSONB,
  reconocimientos       JSONB,
  mensaje               TEXT,
  fecha_actualizacion   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mensajes (
  id              SERIAL PRIMARY KEY,
  conversacion_id VARCHAR(100) NOT NULL,
  remitente       VARCHAR(100) NOT NULL,
  destinatario    VARCHAR(100) NOT NULL,
  texto           TEXT,
  imagen_url      TEXT,
  leido           BOOLEAN DEFAULT false,
  timestamp       TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente);
CREATE INDEX IF NOT EXISTS idx_mensajes_destinatario ON mensajes(destinatario);

CREATE TABLE IF NOT EXISTS notificaciones (
  id              SERIAL PRIMARY KEY,
  tipo            VARCHAR(50) NOT NULL,
  para_rol        VARCHAR(20) NOT NULL,
  para_nombre     VARCHAR(100) NOT NULL,
  de_rol          VARCHAR(20),
  de_nombre       VARCHAR(100),
  mensaje         TEXT,
  leida           BOOLEAN DEFAULT false,
  fecha_creacion  TIMESTAMP DEFAULT NOW(),
  metadata        JSONB
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(para_rol, para_nombre);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);

CREATE TABLE IF NOT EXISTS propuestas_horario (
  id                SERIAL PRIMARY KEY,
  origen            VARCHAR(20) NOT NULL,
  cedula_barbero    VARCHAR(10) NOT NULL REFERENCES barberos(cedula_barbero) ON DELETE CASCADE,
  barberia_id       INTEGER REFERENCES barberias(id) ON DELETE SET NULL,
  dias              JSONB,
  hora_inicio       VARCHAR(10),
  hora_fin          VARCHAR(10),
  estado_propuesta  VARCHAR(20) DEFAULT 'pendiente',
  fecha_creacion    TIMESTAMP DEFAULT NOW(),
  fecha_respuesta   TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_propuestas_barbero ON propuestas_horario(cedula_barbero);
CREATE INDEX IF NOT EXISTS idx_propuestas_barberia ON propuestas_horario(barberia_id);

CREATE TABLE IF NOT EXISTS calificaciones (
  id              SERIAL PRIMARY KEY,
  cedula_cliente  VARCHAR(10) NOT NULL REFERENCES clientes(cedula_cliente),
  cedula_barbero  VARCHAR(10) REFERENCES barberos(cedula_barbero) ON DELETE SET NULL,
  barberia_id     INTEGER REFERENCES barberias(id) ON DELETE SET NULL,
  id_cita         VARCHAR(15) REFERENCES citas(id_cita) ON DELETE SET NULL,
  puntaje         INTEGER NOT NULL CHECK (puntaje >= 1 AND puntaje <= 5),
  comentario      TEXT,
  fecha_creacion  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calificaciones_barbero ON calificaciones(cedula_barbero);
CREATE INDEX IF NOT EXISTS idx_calificaciones_barberia ON calificaciones(barberia_id);

-- ────────── GRANTS ──────────

ALTER TABLE barberias ENABLE ROW LEVEL SECURITY;
ALTER TABLE barberia_barberos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE hojas_de_vida ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE propuestas_horario ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
