// src/components/Chat/ChatWindow.jsx
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, ArrowLeft, X, User, Scissors, Send, Image, Trash2 } from 'lucide-react';
import { chatService } from '../../services/chatService.js';
import { barberosService } from '../../services/barberosService.js';
import { barberiaService } from '../../services/barberiaService.js';
import { perfilService } from '../../services/perfilService.js';

export default function ChatWindow({ usuarioActual, rolActual, onClose, conversacionInicial, onConversacionAbierta }) {

  // Estados con inicialización directa si viene conversacionInicial
  const [conversacionActiva, setConversacionActiva] = useState(
    conversacionInicial || null
  );
  const [vista, setVista] = useState(
    conversacionInicial ? 'chat' : 'lista'
  );
  const [mensajes, setMensajes] = useState([]);

  const [texto, setTexto] = useState('');
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenParaEnviar, setImagenParaEnviar] = useState(null);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [hoveredMsgId, setHoveredMsgId] = useState(null);
  const fileInputRef = useRef(null);
  const mensajesEndRef = useRef(null);

  const [barberos, setBarberos] = useState([]);

  useEffect(() => {
    if (conversacionInicial) {
      onConversacionAbierta?.();
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const todos = await barberosService.getTodos();
      let filtrados = todos;
      if (rolActual === 'barberia') {
        const barberia = await barberiaService.getByNombre(usuarioActual);
        const ids = barberia?.barberoIds || [];
        filtrados = todos.filter((b) => ids.includes(b.id));
      }
      setBarberos(filtrados);
    };
    load();
  }, [rolActual]);

  const [conversaciones, setConversaciones] = useState([]);

  useEffect(() => {
    chatService.getConversaciones(usuarioActual).then(setConversaciones);
  }, [usuarioActual]);

  // Polling de mensajes nuevos
  useEffect(() => {
    if (!conversacionActiva || vista !== 'chat') return;
    const interval = setInterval(async () => {
      const msgs = await chatService.getMensajes(usuarioActual, conversacionActiva);
      setMensajes(msgs);
    }, 5000);
    return () => clearInterval(interval);
  }, [conversacionActiva, vista, usuarioActual]);

  // Auto scroll al último mensaje
  useEffect(() => {
    mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Cerrar lightbox con Escape
  useEffect(() => {
    if (!imagenAmpliada) return;
    const handleKey = (e) => { if (e.key === 'Escape') setImagenAmpliada(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [imagenAmpliada]);

  const limpiarImagen = () => {
    setImagenPreview(null);
    setImagenParaEnviar(null);
  };

  const handleEnviar = async () => {
    if ((!texto.trim() && !imagenParaEnviar) || !conversacionActiva) return;
    try {
      await chatService.enviarMensaje(usuarioActual, conversacionActiva, texto.trim(), imagenParaEnviar);
      const msgs = await chatService.getMensajes(usuarioActual, conversacionActiva);
      setMensajes(msgs);
      const convs = await chatService.getConversaciones(usuarioActual);
      setConversaciones(convs);
      setTexto('');
      limpiarImagen();
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await perfilService.procesarImagen(file, 800, 0.7);
    setImagenPreview(URL.createObjectURL(file));
    setImagenParaEnviar(base64);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  const abrirConversacion = async (otroUsuario) => {
    setConversacionActiva(otroUsuario);
    setVista('chat');
    onConversacionAbierta?.();
    const msgs = await chatService.getMensajes(usuarioActual, otroUsuario);
    setMensajes(msgs);
    chatService.marcarLeidos(usuarioActual, otroUsuario);
  };

  return (
    <>
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
        background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {vista === 'chat' && (
            <button
              onClick={() => setVista('lista')}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
              {vista === 'chat' ? conversacionActiva : <><MessageCircle size={16} /> Mensajes</>}
            </div>
            {vista === 'chat' && (
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)' }}>
                En línea
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {vista === 'chat' && (
            <button
              onClick={() => {
                if (confirm('¿Eliminar toda la conversación con ' + conversacionActiva + '?')) {
                  chatService.eliminarConversacion(usuarioActual, conversacionActiva).then(() => {
                    setVista('lista');
                    setConversacionActiva(null);
                    setMensajes([]);
                    chatService.getConversaciones(usuarioActual).then(setConversaciones);
                  });
                }
              }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4, display: 'flex' }}
              title="Eliminar conversación"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <X size={18} />
          </button>
        </div>
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
                    background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>
                    {rolActual === 'barbero' ? <User size={18} /> : <Scissors size={18} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{conv.otroUsuario}</div>
                    <div style={{
                      fontSize: '0.78rem', color: 'var(--muted)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.ultimoMensaje.de === usuarioActual ? 'Tú: ' : ''}
                      {conv.ultimoMensaje.imagen && !conv.ultimoMensaje.texto ? '📷 Imagen' : conv.ultimoMensaje.texto}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                      {conv.ultimoMensaje.hora}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('¿Eliminar toda la conversación con ' + conv.otroUsuario + '?')) {
                          chatService.eliminarConversacion(usuarioActual, conv.otroUsuario).then(() => {
                            chatService.getConversaciones(usuarioActual).then(setConversaciones);
                          });
                        }
                      }}
                      style={{
                        background: 'none', border: 'none', color: 'var(--muted)',
                        cursor: 'pointer', padding: 4, display: 'flex', opacity: 0.5,
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                      title="Eliminar conversación"
                    >
                      <Trash2 size={14} />
                    </button>
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
                      background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      {b.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{nombreCompleto}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Scissors size={12} /> {b.especialidad}</div>
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
                Inicia la conversación
              </div>
            ) : (
              mensajes.map((m) => {
                const esMio = m.de === usuarioActual;
                return (
                  <div
                    key={m.id}
                    style={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 4 }}
                    onMouseEnter={() => setHoveredMsgId(m.id)}
                    onMouseLeave={() => setHoveredMsgId(null)}
                  >
                    {esMio && hoveredMsgId === m.id && (
                      <button
                        onClick={() => chatService.eliminarMensaje(m.id, usuarioActual).then(() => {
                          setMensajes((prev) => prev.filter((msg) => msg.id !== m.id));
                        })}
                        style={{
                          background: 'none', border: 'none', color: 'var(--muted)',
                          cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0,
                        }}
                        title="Eliminar mensaje"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <div style={{
                      maxWidth: '75%', padding: '8px 12px',
                      borderRadius: esMio ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: esMio
                        ? 'linear-gradient(135deg, var(--cobre), var(--cobre-light))'
                        : 'var(--surface2)',
                      color: esMio ? '#fff' : 'var(--text)',
                      fontSize: '0.88rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <div>{m.texto}</div>
                      {m.imagen && (
                        <img src={m.imagen} alt="imagen"
                          style={{
                            maxWidth: '100%', maxHeight: 200, borderRadius: 8,
                            marginTop: m.texto ? 8 : 0, cursor: 'pointer',
                            objectFit: 'contain', background: '#000',
                          }}
                          onClick={() => setImagenAmpliada(m.imagen)} />
                      )}
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

          {/* Preview imagen */}
          {imagenPreview && (
            <div style={{
              padding: '8px 12px',
              borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--surface2)',
            }}>
              <img src={imagenPreview} alt="preview"
                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>1 imagen adjunta</span>
              <button onClick={limpiarImagen}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: 'var(--muted)', cursor: 'pointer', padding: 4,
                  display: 'flex',
                }}>
                <X size={14} />
              </button>
            </div>
          )}

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
              onClick={() => fileInputRef.current?.click()}
              title="Adjuntar imagen"
              style={{
                width: 36, height: 36, borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <Image size={16} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageSelect} />
            <button
              onClick={handleEnviar}
              disabled={!texto.trim() && !imagenParaEnviar}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                background: texto.trim() || imagenParaEnviar
                  ? 'linear-gradient(135deg, var(--cobre), var(--cobre-light))'
                  : 'var(--surface2)',
                color: texto.trim() || imagenParaEnviar ? '#fff' : 'var(--muted)',
                cursor: texto.trim() || imagenParaEnviar ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', transition: 'all 0.2s', flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}
    </div>

    {/* Lightbox */}
    {imagenAmpliada && (
      <div onClick={() => setImagenAmpliada(null)}
        style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
        <img src={imagenAmpliada} alt="imagen ampliada"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain',
            borderRadius: 8, cursor: 'default',
          }} />
        <button onClick={() => setImagenAmpliada(null)}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(0,0,0,0.5)', border: 'none',
            color: '#fff', width: 36, height: 36, borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
          }}>
          <X size={20} />
        </button>
      </div>
    )}
  </>);
}
