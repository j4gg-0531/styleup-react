import { api } from './api.js';

const MENSAJES_KEY = 'styleup_chat_mensajes';
const CONVERSACIONES_KEY = 'styleup_chat_conversaciones';
const SYNCED_KEY = 'styleup_chat_synced';

const mapearMensaje = (m) => ({
  id: m.id,
  de: m.remitente,
  para: m.destinatario,
  texto: m.texto,
  imagen: m.imagen_url,
  leido: m.leido || false,
  hora: new Date(m.timestamp || m.fecha_creacion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
  timestamp: new Date(m.timestamp || m.fecha_creacion).getTime(),
});

const mapearConversacion = (c) => ({
  id: c.id,
  otroUsuario: c.otroUsuario,
  ultimoMensaje: c.ultimoMensaje ? {
    de: c.ultimoMensaje.remitente,
    para: c.ultimoMensaje.destinatario,
    texto: c.ultimoMensaje.texto,
    hora: new Date(c.ultimoMensaje.timestamp || c.ultimoMensaje.fecha_creacion).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    timestamp: new Date(c.ultimoMensaje.timestamp || c.ultimoMensaje.fecha_creacion).getTime(),
  } : null,
  totalMensajes: c.totalMensajes,
});

function leer(key) {
  const d = sessionStorage.getItem(key);
  return d ? JSON.parse(d) : [];
}

function guardar(key, data) {
  sessionStorage.setItem(key, JSON.stringify(data));
}

function convKey(usuario1, usuario2) {
  return [usuario1, usuario2].sort().join('_');
}

async function syncMensajes(usuario1, usuario2) {
  try {
    const data = await api.get(`/chat/mensajes?usuario1=${encodeURIComponent(usuario1)}&usuario2=${encodeURIComponent(usuario2)}`);
    if (data) {
      const key = convKey(usuario1, usuario2);
      const cache = leer(MENSAJES_KEY);
      cache[key] = data;
      guardar(MENSAJES_KEY, cache);
    }
  } catch { /* silent */ }
}

async function syncConversaciones(usuario) {
  try {
    const data = await api.get(`/chat/conversaciones?usuario=${encodeURIComponent(usuario)}`);
    if (data) {
      guardar(CONVERSACIONES_KEY, data);
      const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
      synced[usuario] = Date.now();
      sessionStorage.setItem(SYNCED_KEY, JSON.stringify(synced));
    }
  } catch { /* silent */ }
}

export const chatService = {

  getMensajes(usuario1, usuario2) {
    const key = convKey(usuario1, usuario2);
    syncMensajes(usuario1, usuario2);
    const cache = leer(MENSAJES_KEY);
    return (cache[key] || []).map(mapearMensaje);
  },

  enviarMensaje(de, para, texto, imagenBase64 = null) {
    const msg = {
      remitente: de,
      destinatario: para,
      texto,
      imagen_url: imagenBase64,
      id: Date.now(),
      leido: false,
      timestamp: new Date().toISOString(),
      fecha_creacion: new Date().toISOString(),
    };
    const key = convKey(de, para);
    const cache = leer(MENSAJES_KEY);
    cache[key] = [...(cache[key] || []), msg];
    guardar(MENSAJES_KEY, cache);

    api.post('/chat/enviar', {
      remitente: de, destinatario: para, texto, imagenUrl: imagenBase64,
    }).catch(() => {});
    return mapearMensaje(msg);
  },

  getConversaciones(nombreUsuario) {
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    if (!synced[nombreUsuario]) syncConversaciones(nombreUsuario);
    return leer(CONVERSACIONES_KEY).map(mapearConversacion);
  },

  getMensajesNoLeidos(nombreUsuario) {
    const convs = chatService.getConversaciones(nombreUsuario);
    const total = convs.reduce((sum, c) => sum + (c.totalMensajes || 0), 0);
    if (total > 0) return total;
    const synced = JSON.parse(sessionStorage.getItem(SYNCED_KEY) || '{}');
    if (!synced[nombreUsuario]) syncConversaciones(nombreUsuario);
    return leer(CONVERSACIONES_KEY).length;
  },
};
