import { api } from './api.js';

const DEFAULTS = {
  cliente: {
    nombre: '', apellidos: '', telefono: '', cedula: '1001234567',
    correo: 'cliente@correo.com', serviciosFavoritos: [], avatar: null,
  },
  barbero: {
    nombre: '', apellidos: '', telefono: '', especialidades: [],
    cedula: '1001234567', correo: 'barbero@correo.com',
    ubicacion: null, instagram: '', tiktok: '', avatar: null,
  },
  barberia: {
    nombreBarberia: '', telefono: '', direccion: '', ciudad: '',
    descripcion: '', nit: '123456789-0', correo: 'negocio@correo.com',
    numTrabajadores: 1, lat: null, lng: null, logo: null,
  },
};

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('su_user') || '{}'); } catch { return {}; }
}

function storKey(nombre) {
  return `styleup_perfil_${nombre?.toLowerCase().replace(/\s+/g, '_')}`;
}

function fromStorage(nombre, rol) {
  const saved = sessionStorage.getItem(storKey(nombre));
  return saved ? { ...DEFAULTS[rol], ...JSON.parse(saved) } : { ...DEFAULTS[rol] };
}

function toStorage(nombre, datos) {
  sessionStorage.setItem(storKey(nombre), JSON.stringify(datos));
}

async function syncClienteFromApi(cedula) {
  try {
    const data = await api.get(`/clientes/${cedula}`);
    if (!data) return;
    const perfil = {
      nombre: data.nombre || '', apellidos: data.apellido || '',
      telefono: data.telefono || '', cedula: data.cedula_cliente || '',
      correo: data.correo || '', serviciosFavoritos: [], avatar: data.avatar_url || null,
    };
    toStorage(cedula, perfil);
  } catch { /* silent */ }
}

async function syncBarberoFromApi(cedula) {
  try {
    const data = await api.get(`/barberos/${cedula}`);
    if (!data) return;
    const perfil = {
      nombre: data.nombre || '', apellidos: data.apellido || '',
      telefono: data.telefono || '', especialidades: [],
      cedula: data.cedula_barbero || '', correo: data.correo || '',
      ubicacion: data.lat && data.lng ? { lat: Number(data.lat), lng: Number(data.lng) } : null,
      instagram: data.instagram || '', tiktok: data.tiktok || '', avatar: data.avatar_url || null,
    };
    toStorage(cedula, perfil);
  } catch { /* silent */ }
}

async function syncBarberiaFromApi(nombre) {
  try {
    const data = await api.get(`/barberias/owner/${encodeURIComponent(nombre)}`);
    if (!data) return;
    const perfil = {
      nombreBarberia: data.nombre || '', telefono: data.telefono || '',
      direccion: data.direccion || '', ciudad: data.ciudad || '',
      descripcion: data.descripcion || '', nit: data.nit || '',
      correo: data.correo || '', numTrabajadores: data.num_trabajadores || 1,
      lat: data.lat ? Number(data.lat) : null, lng: data.lng ? Number(data.lng) : null,
      logo: data.logo_url || null,
    };
    toStorage(nombre, perfil);
  } catch { /* silent */ }
}

export const perfilService = {

  getPerfil(nombre, rol) {
    if (!nombre) return { ...DEFAULTS[rol] || DEFAULTS.cliente };
    const user = getUser();
    if (rol === 'cliente' && user.cedula) {
      syncClienteFromApi(user.cedula);
    } else if (rol === 'barbero' && user.cedula) {
      syncBarberoFromApi(user.cedula);
    } else if (rol === 'barberia' && nombre) {
      syncBarberiaFromApi(nombre);
    }
    return fromStorage(nombre, rol);
  },

  guardarPerfil(nombre, rol, datos) {
    toStorage(nombre, datos);
    const user = getUser();
    if (rol === 'cliente' && user.cedula) {
      api.put(`/clientes/${user.cedula}`, {
        nombre: datos.nombre, apellido: datos.apellidos,
        telefono: datos.telefono, avatar_url: datos.avatar,
      }).catch(() => {});
    }
    if (rol === 'barbero' && user.cedula) {
      api.put(`/barberos/${user.cedula}`, {
        nombre: datos.nombre, apellido: datos.apellidos,
        telefono: datos.telefono, instagram: datos.instagram,
        tiktok: datos.tiktok, avatar_url: datos.avatar,
        lat: datos.ubicacion?.lat, lng: datos.ubicacion?.lng,
      }).catch(() => {});
    }
    if (rol === 'barberia') {
      api.get(`/barberias/owner/${encodeURIComponent(nombre)}`).then((barberia) => {
        if (barberia) {
          api.put(`/barberias/${barberia.id}`, {
            nombre: datos.nombreBarberia, telefono: datos.telefono,
            direccion: datos.direccion, ciudad: datos.ciudad,
            descripcion: datos.descripcion, nit: datos.nit,
            correo: datos.correo, num_trabajadores: datos.numTrabajadores,
            lat: datos.lat, lng: datos.lng, logo_url: datos.logo,
          }).catch(() => {});
        }
      }).catch(() => {});
    }
    return datos;
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
            width *= ratio;
            height *= ratio;
          }
          canvas.width = width;
          canvas.height = height;
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
