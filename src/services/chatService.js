// src/services/chatService.js
// ─────────────────────────────────────────────────────────────
// CAPA DE DATOS — Hoy usa sessionStorage.
// FUTURO: reemplazar con Socket.io
// socket.emit('mensaje', datos)
// socket.on('mensaje', callback)
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'styleup_chats';

const leerChats = () => {
  const data = sessionStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

const guardarChats = (chats) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
};

// Genera un ID único para la conversación entre dos usuarios
// FUTURO: el backend maneja los IDs de conversación
const getConversacionId = (usuario1, usuario2) => {
  return [usuario1, usuario2].sort().join('__');
};

export const chatService = {

  // Obtener todos los mensajes entre dos usuarios
  // FUTURO: GET /api/chat/:conversacionId
  getMensajes: (usuario1, usuario2) => {
    const chats = leerChats();
    const id = getConversacionId(usuario1, usuario2);
    return chats[id] || [];
  },

  // Enviar un mensaje
  // FUTURO: socket.emit('mensaje', { de, para, texto })
  enviarMensaje: (de, para, texto) => {
    const chats = leerChats();
    const id = getConversacionId(de, para);
    const mensaje = {
      id: Date.now().toString(),
      de,
      para,
      texto,
      hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };
    if (!chats[id]) chats[id] = [];
    chats[id].push(mensaje);
    guardarChats(chats);
    return mensaje;
  },

  // Obtener lista de conversaciones de un usuario
  // FUTURO: GET /api/chat/conversaciones?usuario=nombre
  getConversaciones: (nombreUsuario) => {
    const chats = leerChats();
    const conversaciones = [];
    Object.entries(chats).forEach(([id, mensajes]) => {
      if (id.includes(nombreUsuario) && mensajes.length > 0) {
        const ultimoMensaje = mensajes[mensajes.length - 1];
        const otroUsuario = id
          .split('__')
          .find((u) => u !== nombreUsuario);
        conversaciones.push({
          id,
          otroUsuario,
          ultimoMensaje,
          totalMensajes: mensajes.length,
        });
      }
    });
    return conversaciones.sort((a, b) =>
      b.ultimoMensaje.timestamp - a.ultimoMensaje.timestamp
    );
  },

  // Contar mensajes no leídos
  // FUTURO: GET /api/chat/no-leidos?usuario=nombre
  getMensajesNoLeidos: (nombreUsuario) => {
    const conversaciones = chatService.getConversaciones(nombreUsuario);
    return conversaciones.reduce((total, conv) => {
      const noLeidos = chatService
        .getMensajes(nombreUsuario, conv.otroUsuario)
        .filter((m) => m.para === nombreUsuario && !m.leido).length;
      return total + noLeidos;
    }, 0);
  },
};