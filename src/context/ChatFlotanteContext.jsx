// src/context/ChatFlotanteContext.jsx
// Permite abrir el chat flotante con un usuario específico
// desde cualquier componente de la app.

import { createContext, useState, useCallback } from 'react';

export const ChatFlotanteContext = createContext(null);

export function ChatFlotanteProvider({ children }) {
  // Nombre del usuario con quien abrir el chat (null = cerrado)
  const [chatPendiente, setChatPendiente] = useState(null);

  const abrirChatCon = useCallback((nombreUsuario) => {
    setChatPendiente(nombreUsuario);
  }, []);

  const limpiarChat = useCallback(() => {
    setChatPendiente(null);
  }, []);

  return (
    <ChatFlotanteContext.Provider value={{ chatPendiente, abrirChatCon, limpiarChat }}>
      {children}
    </ChatFlotanteContext.Provider>
  );
}