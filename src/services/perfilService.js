import { api } from './api.js';

const DEFAULTS = {
  cliente: {
    nombre: '', apellidos: '', telefono: '', cedula: '',
    correo: '', serviciosFavoritos: [], avatar: null,
  },
  barbero: {
    nombre: '', apellidos: '', telefono: '', especialidades: [],
    cedula: '', correo: '',
    ubicacion: null, instagram: '', tiktok: '', avatar: null,
  },
  barberia: {
    nombreBarberia: '', telefono: '', direccion: '', ciudad: '',
    descripcion: '', nit: '', correo: '',
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

export const perfilService = {
  async getPerfil(nombre, rol) {
    if (!nombre) return { ...DEFAULTS[rol] || DEFAULTS.cliente };
    const user = getUser();
    try {
      if (rol === 'cliente' && user.cedula) {
        const data = await api.get(`/clientes/${user.cedula}`);
        if (data) {
          const perfil = {
            nombre: data.nombre || '', apellidos: data.apellido || '',
            telefono: data.telefono || '', cedula: data.cedula_cliente || '',
            correo: data.correo || '', serviciosFavoritos: [], avatar: data.avatar_url || null,
          };
          toStorage(nombre, perfil);
          return perfil;
        }
      } else if (rol === 'barbero' && user.cedula) {
        const data = await api.get(`/barberos/${user.cedula}`);
        if (data) {
          const perfil = {
            nombre: data.nombre || '', apellidos: data.apellido || '',
            telefono: data.telefono || '', especialidades: [],
            cedula: data.cedula_barbero || '', correo: data.correo || '',
            ubicacion: data.lat && data.lng ? { lat: Number(data.lat), lng: Number(data.lng) } : null,
            instagram: data.instagram || '', tiktok: data.tiktok || '', avatar: data.avatar_url || null,
          };
          toStorage(nombre, perfil);
          return perfil;
        }
      } else if (rol === 'barberia' && nombre) {
        const data = await api.get(`/barberias/owner/${encodeURIComponent(nombre)}`);
        if (data) {
          const perfil = {
            nombreBarberia: data.nombre || '', telefono: data.telefono || '',
            direccion: data.direccion || '', ciudad: data.ciudad || '',
            descripcion: data.descripcion || '', nit: data.nit || '',
            correo: data.correo || '', numTrabajadores: data.num_trabajadores || 1,
            lat: data.lat ? Number(data.lat) : null, lng: data.lng ? Number(data.lng) : null,
            logo: data.logo_url || null,
          };
          toStorage(nombre, perfil);
          return perfil;
        }
      }
    } catch {}
    return fromStorage(nombre, rol);
  },

  async guardarPerfil(nombre, rol, datos) {
    toStorage(nombre, datos);
    const user = getUser();
    if (rol === 'cliente' && user.cedula) {
      await api.put(`/clientes/${user.cedula}`, {
        nombre: datos.nombre, apellido: datos.apellidos,
        telefono: datos.telefono, avatar_url: datos.avatar,
      });
    } else if (rol === 'barbero' && user.cedula) {
      await api.put(`/barberos/${user.cedula}`, {
        nombre: datos.nombre, apellido: datos.apellidos,
        telefono: datos.telefono, instagram: datos.instagram,
        tiktok: datos.tiktok, avatar_url: datos.avatar,
        lat: datos.ubicacion?.lat, lng: datos.ubicacion?.lng,
      });
    } else if (rol === 'barberia') {
      const barberiaData = await api.get(`/barberias/owner/${encodeURIComponent(nombre)}`);
      if (barberiaData) {
        await api.put(`/barberias/${barberiaData.id}`, {
          nombre: datos.nombreBarberia, telefono: datos.telefono,
          direccion: datos.direccion, ciudad: datos.ciudad,
          descripcion: datos.descripcion, nit: datos.nit,
          correo: datos.correo, num_trabajadores: datos.numTrabajadores,
          lat: datos.lat, lng: datos.lng, logo_url: datos.logo,
        });
      }
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

  async cambiarPassword(passwordActual, passwordNueva) {
    await api.put('/auth/password', { passwordActual, passwordNueva });
  },

  async eliminarCuenta() {
    const user = getUser();
    if (user.tipo === 'cliente' || user.tipo === 'barbero') {
      await api.delete(`/${user.tipo}s/${user.cedula}`);
    } else if (user.tipo === 'barberia') {
      await api.delete(`/barberias/${user.barberiaId}`);
    }
  },
};
