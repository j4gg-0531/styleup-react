// src/services/ofertasConfig.js
// Catálogos compartidos para el módulo de ofertas

export const TIPOS_CONTRATACION = [
  { value: 'comision',          label: 'Comisión' },
  { value: 'salario_fijo',      label: 'Salario fijo' },
  { value: 'salario_comision',  label: 'Salario + comisión' },
  { value: 'alquiler_silla',    label: 'Alquiler de silla' },
];

export const EXPERIENCIA_OPCIONES = [
  { value: 'sin_experiencia', label: 'Sin experiencia' },
  { value: '1_ano',           label: '1 año' },
  { value: '2_anos',          label: '2+ años' },
  { value: 'senior',          label: 'Senior / Master barber' },
];

export const ESPECIALIDADES_TAGS = [
  'Fade', 'Degradado', 'Barba', 'Diseño', 'Tijera',
  'Corte clásico', 'Corte urbano', 'Colorimetría', 'Trenzas',
];

export const NIVEL_PROFESIONAL = [
  { value: 'junior',       label: 'Junior' },
  { value: 'semi_senior',  label: 'Semi-senior' },
  { value: 'senior',       label: 'Senior' },
  { value: 'master',       label: 'Master barber' },
];

export const DISPONIBILIDAD_OPCIONES = [
  { value: 'tiempo_completo', label: 'Tiempo completo' },
  { value: 'medio_tiempo',    label: 'Medio tiempo' },
  { value: 'fines_semana',    label: 'Fines de semana' },
];

export const MODALIDAD_OPCIONES = [
  { value: 'comision',        label: 'Comisión' },
  { value: 'salario_fijo',    label: 'Salario fijo' },
  { value: 'mixto',           label: 'Mixto' },
  { value: 'alquiler_silla',  label: 'Alquiler de silla' },
];

// Labels legibles para mostrar en vistas
export const labelContratacion = (val) =>
  TIPOS_CONTRATACION.find((t) => t.value === val)?.label ?? val;

export const labelExperiencia = (val) =>
  EXPERIENCIA_OPCIONES.find((e) => e.value === val)?.label ?? val;