// src/services/perfilService.js
// Maneja datos extendidos de perfil para los 3 roles.
// Usa sessionStorage bajo clave 'styleup_perfil_<nombre>'

const STORAGE_PREFIX = 'styleup_perfil_';

const DEFAULTS = {
  cliente: {
    nombre: '',
    apellidos: '',
    telefono: '',
    cedula: '1001234567',
    correo: 'cliente@correo.com',
    serviciosFavoritos: [],
    avatar: null,
  },
  barbero: {
    nombre: '',
    apellidos: '',
    telefono: '',
    especialidades: [],
    cedula: '1001234567',
    correo: 'barbero@correo.com',
    ubicacion: null,
    instagram: '',
    tiktok: '',
    avatar: null,
  },
  barberia: {
    nombreBarberia: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    descripcion: '',
    nit: '123456789-0',
    correo: 'negocio@correo.com',
    numTrabajadores: 1,
    lat: null,
    lng: null,
    logo: null,
  },
};

function getKey(nombre) {
  return STORAGE_PREFIX + (nombre || '').toLowerCase().replace(/\s+/g, '_');
}

export const perfilService = {
  getPerfil(nombre, rol) {
    if (!nombre) return { ...DEFAULTS.cliente };
    const key = getKey(nombre);
    const guardado = sessionStorage.getItem(key);
    const base = DEFAULTS[rol] || DEFAULTS.cliente;
    if (guardado) return { ...base, ...JSON.parse(guardado) };
    return { ...base };
  },

  guardarPerfil(nombre, rol, datos) {
    if (!nombre) return null;
    const key = getKey(nombre);
    const actual = perfilService.getPerfil(nombre, rol);
    const nuevo = { ...actual, ...datos };
    sessionStorage.setItem(key, JSON.stringify(nuevo));
    return nuevo;
  },

  async procesarImagen(file, maxDim = 300, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > height) {
            if (width > maxDim) { height *= maxDim / width; width = maxDim; }
          } else {
            if (height > maxDim) { width *= maxDim / height; height = maxDim; }
          }
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  },
};
