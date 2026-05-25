// src/components/Chat/ChatFlotante.jsx
import { useState } from 'react';
import { useAuth } from '../../context/useAuth.js';
import { chatService } from '../../services/chatService.js';
import ChatWindow from './ChatWindow.jsx';
import { useLocation } from 'react-router-dom'; // ← AGREGAR

export default function ChatFlotante() {
  const { user } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const location = useLocation(); // ← AGREGAR

  // ✅ Sin useEffect — se calcula directo en el render
  // FUTURO: vendrá de un WebSocket que notifica en tiempo real
  const noLeidos = user
    ? chatService.getMensajesNoLeidos(user.nombre)
    : 0;

  const rutasPublicas = ['/', '/login', '/registro'];

  if (!user || user.rol === 'barberia' || rutasPublicas.includes(location.pathname)) {
    return null;
  }

  if (!user || user.rol === 'barberia') return null;

  return (
    <>
      {abierto && (
        <ChatWindow
          usuarioActual={user.nombre}
          rolActual={user.rol}
          onClose={() => setAbierto(false)}
        />
      )}

      <button
        onClick={() => setAbierto(!abierto)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1001,
          width: 56, height: 56, borderRadius: '50%', border: 'none',
          background: abierto
            ? 'var(--surface2)'
            : 'linear-gradient(135deg, var(--red), var(--red-light))',
          color: '#fff', fontSize: '1.4rem',
          cursor: 'pointer', boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: abierto ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
      >
        {abierto ? '✕' : '💬'}
        {!abierto && noLeidos > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--gold)', color: '#000',
            borderRadius: '50%', width: 20, height: 20,
            fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {noLeidos}
          </span>
        )}
      </button>
    </>
  );
}