// src/services/cvService.js
// Hoja de vida persistente del barbero.
// FUTURO: reemplazar con llamadas a /api/cv

import { perfilService } from './perfilService.js';

const STORAGE_PREFIX = 'styleup_cv_';

const CV_DEFAULT = {
  presentacion: '',
  nivel: '',
  anosExperiencia: '',
  especialidades: [],
  disponibilidad: '',
  modalidad: '',
  herramientasPropias: false,
  experienciaLaboral: [],
  certificados: [],
  reconocimientos: [],
  mensaje: '',
};

function getKey(nombre) {
  return STORAGE_PREFIX + (nombre || '').toLowerCase().replace(/\s+/g, '_');
}

export const cvService = {
  getCV(nombre) {
    if (!nombre) return { ...CV_DEFAULT };
    const key = getKey(nombre);
    const guardado = sessionStorage.getItem(key);
    if (guardado) return { ...CV_DEFAULT, ...JSON.parse(guardado) };
    return { ...CV_DEFAULT };
  },

  guardarCV(nombre, datos) {
    if (!nombre) return null;
    const key = getKey(nombre);
    const actual = cvService.getCV(nombre);
    const nuevo = { ...actual, ...datos };
    sessionStorage.setItem(key, JSON.stringify(nuevo));
    return nuevo;
  },

  procesarImagen(file, maxDim = 800, quality = 0.7) {
    return perfilService.procesarImagen(file, maxDim, quality);
  },
};
