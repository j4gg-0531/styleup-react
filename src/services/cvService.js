import { api } from './api.js';

const STORAGE_KEY = 'styleup_cv';
const SYNCED_KEY = 'styleup_cv_synced';

const mapearCV = (c) => ({
  presentacion: c.presentacion || '',
  nivel: c.nivel || '',
  anosExperiencia: c.anos_experiencia || '',
  especialidades: c.especialidades || [],
  disponibilidad: c.disponibilidad || '',
  modalidad: c.modalidad || '',
  herramientasPropias: c.herramientas_propias || false,
  experienciaLaboral: c.experiencia_laboral || [],
  certificados: c.certificados || [],
  reconocimientos: c.reconocimientos || [],
  mensaje: c.mensaje || '',
});

function leer() {
  const d = sessionStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : {};
}

function guardar(data) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function syncFromApi(cedula) {
  try {
    const data = await api.get(`/cv/${cedula}`);
    if (data) {
      guardar({ [cedula]: data });
      const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
      synced[cedula] = Date.now();
      sessionStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
    }
  } catch { /* silent */ }
}

function defaults() {
  return {
    presentacion: '', nivel: '', anosExperiencia: '', especialidades: [],
    disponibilidad: '', modalidad: '', herramientasPropias: false,
    experienciaLaboral: [], certificados: [], reconocimientos: [], mensaje: '',
  };
}

export const cvService = {

  getCV(cedulaBarbero) {
    if (!cedulaBarbero) return defaults();
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    if (!synced[cedulaBarbero]) syncFromApi(cedulaBarbero);
    const cache = leer();
    return cache[cedulaBarbero] ? mapearCV(cache[cedulaBarbero]) : defaults();
  },

  guardarCV(cedulaBarbero, datos) {
    if (!cedulaBarbero) return null;
    const body = {
      presentacion: datos.presentacion, nivel: datos.nivel,
      anosExperiencia: datos.anosExperiencia, especialidades: datos.especialidades,
      disponibilidad: datos.disponibilidad, modalidad: datos.modalidad,
      herramientasPropias: datos.herramientasPropias ?? false,
      experienciaLaboral: datos.experienciaLaboral || [],
      certificados: datos.certificados || [],
      reconocimientos: datos.reconocimientos || [],
      mensaje: datos.mensaje,
    };
    const cache = leer();
    cache[cedulaBarbero] = body;
    guardar(cache);

    api.put(`/cv/${cedulaBarbero}`, body).catch(() => {});
    return mapearCV(body);
  },

  procesarImagen(file, maxDim = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            const ratio = Math.min(maxDim / width, maxDim / height);
            width *= ratio; height *= ratio;
          }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};
