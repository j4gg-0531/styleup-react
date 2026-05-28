// src/components/Chat/ChatWindow.jsx
import { useState, useEffect, useRef } from 'react';
import { chatService } from '../../services/chatService.js';
import { barberosService } from '../../services/barberosService.js';

export default function ChatWindow({ usuarioActual, rolActual, onClose, conversacionInicial, onConversacionAbierta }) {

  // Estados con inicialización directa si viene conversacionInicial
  const [conversacionActiva, setConversacionActiva] = useState(
    conversacionInicial || null
  );
  const [vista, setVista] = useState(
    conversacionInicial ? 'chat' : 'lista'
  );
  const [mensajes, setMensajes] = useState(() => {
    if (conversacionInicial) {
      onConversacionAbierta?.();
      return chatService.getMensajes(usuarioActual, conversacionInicial);
    }
    return [];
  });

  const [texto, setTexto] = useState('');
  const mensajesEndRef = useRef(null);

  // Lista de barberos disponibles para chatear
  // FUTURO: vendrá de /api/barberos o de los barberos con citas del cliente
  const barberos = barberosService.getTodos().filter((b) => {
    if (rolActual === 'barberia') {
      // FUTURO: filtrar por barberiaId del usuario actual
      // Por ahora usamos el mock — BAR001 tiene Juan y Carlos
      const barberosDeMiBarberia = ['Juan Pérez', 'Carlos López'];
      return barberosDeMiBarberia.includes(`${b.nombre} ${b.apellido}`);
    }
    // El cliente ve todos los barberos
    return true;
  });

  const [conversaciones, setConversaciones] = useState(
    () => chatService.getConversaciones(usuarioActual)
  );

  // Auto scroll al último mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const handleEnviar = () => {
    if (!texto.trim() || !conversacionActiva) return;
    chatService.enviarMensaje(usuarioActual, conversacionActiva, texto.trim());
    const msgs = chatService.getMensajes(usuarioActual, conversacionActiva);
    setMensajes(msgs);
    const convs = chatService.getConversaciones(usuarioActual);
    setConversaciones(convs);
    setTexto('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const abrirConversacion = (otroUsuario) => {
    setConversacionActiva(otroUsuario);
    setVista('chat');
    const msgs = chatService.getMensajes(usuarioActual, otroUsuario);
    setMensajes(msgs);
  };

  return (
    <div style={{
      position: 'fixed', bottom: 88, right: 24, zIndex: 1000,
      width: 340, height: 480,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      boxShadow: 'var(--shadow-lg)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'slideUp 0.25s ease',
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 16px',
        background: 'linear-gradient(135deg, var(--red), var(--red-light))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {vista === 'chat' && (
            <button
              onClick={() => setVista('lista')}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
            >
              ←
            </button>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              {vista === 'chat' ? conversacionActiva : '💬 Mensajes'}
            </div>
            {vista === 'chat' && (
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)' }}>
                En línea
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}
        >
          ✕
        </button>
      </div>

      {/* VISTA: LISTA */}
      {vista === 'lista' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {/* Conversaciones existentes */}
          {conversaciones.length > 0 && (
            <div>
              <div style={{
                padding: '10px 16px 4px', fontSize: '0.72rem',
                color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Recientes
              </div>
              {conversaciones.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => abrirConversacion(conv.otroUsuario)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.2s',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--red), var(--red-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {rolActual === 'barbero' ? '👤' : '💈'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{conv.otroUsuario}</div>
                    <div style={{
                      fontSize: '0.78rem', color: 'var(--muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.ultimoMensaje.de === usuarioActual ? 'Tú: ' : ''}{conv.ultimoMensaje.texto}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', flexShrink: 0 }}>
                    {conv.ultimoMensaje.hora}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lista de barberos para iniciar chat */}
          {rolActual === 'cliente' && (
            <div>
              <div style={{
                padding: '10px 16px 4px', fontSize: '0.72rem',
                color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Barberos disponibles
              </div>
              {barberos.map((b) => {
                const nombreCompleto = `${b.nombre} ${b.apellido}`;
                const yaExiste = conversaciones.some((c) => c.otroUsuario === nombreCompleto);
                if (yaExiste) return null;
                return (
                  <div
                    key={b.id}
                    onClick={() => abrirConversacion(nombreCompleto)}
                    style={{
                      padding: '12px 16px', cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      transition: 'background 0.2s',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--red), var(--red-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      {b.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{nombreCompleto}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>✂ {b.especialidad}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: b.disponibleHoy ? '#3fb950' : 'var(--muted)' }}>
                      {b.disponibleHoy ? '● En línea' : '● Ausente'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {conversaciones.length === 0 && rolActual === 'barbero' && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.88rem' }}>
              No tienes conversaciones aún.{'\n'}
              Los clientes podrán escribirte desde su cuenta.
            </div>
          )}
        </div>
      )}

      {/* VISTA: CHAT */}
      {vista === 'chat' && (
        <>
          {/* Mensajes */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '12px 16px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {mensajes.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', marginTop: 20 }}>
                Inicia la conversación 👋
              </div>
            ) : (
              mensajes.map((m) => {
                const esMio = m.de === usuarioActual;
                return (
                  <div
                    key={m.id}
                    style={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start' }}
                  >
                    <div style={{
                      maxWidth: '75%', padding: '8px 12px',
                      borderRadius: esMio ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: esMio
                        ? 'linear-gradient(135deg, var(--red), var(--red-light))'
                        : 'var(--surface2)',
                      color: esMio ? '#fff' : 'var(--text)',
                      fontSize: '0.88rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <div>{m.texto}</div>
                      <div style={{ fontSize: '0.65rem', opacity: 0.7, marginTop: 3, textAlign: 'right' }}>
                        {m.hora}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={mensajesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje..."
              rows={1}
              style={{
                flex: 1, padding: '8px 12px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text)',
                fontFamily: 'Inter, sans-serif', fontSize: '0.88rem',
                resize: 'none', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--gold)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={handleEnviar}
              disabled={!texto.trim()}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                background: texto.trim()
                  ? 'linear-gradient(135deg, var(--red), var(--red-light))'
                  : 'var(--surface2)',
                color: texto.trim() ? '#fff' : 'var(--muted)',
                cursor: texto.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>
        </>
      )}
    </div>
  );
}