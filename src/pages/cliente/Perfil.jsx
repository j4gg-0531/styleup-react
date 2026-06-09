import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Scissors, BookOpen, Smartphone, User,
  Lock, Save, Trash2, AlertTriangle, Frown, CheckCircle, Bell,
  X, Heart, ChevronDown, ChevronRight, Star, Pencil,
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useCitas } from '../../context/useCitas.js';
import { useToast } from '../../context/useToast.js';
import { perfilService } from '../../services/perfilService.js';
import { NOMBRES_SERVICIOS } from '../../services/preciosService.js';

const navItems = [
  { icon: <Home size={18} />, label: 'Dashboard',   href: '/cliente' },
  { icon: <Scissors size={18} />, label: 'Barberos',     href: '/cliente/barberos' },
  { icon: <BookOpen size={18} />, label: 'Mi historial', href: '/cliente/historial' },
  { icon: <Smartphone size={18} />, label: 'Telegram',     href: '/cliente/telegram' },
  { icon: <Bell size={18} />, label: 'Notificaciones', href: '/cliente/notificaciones', notificacionesBadge: true },
];

const TABS = [
  { key: 'info', label: 'Información personal', icon: <User size={16} /> },
  { key: 'preferencias', label: 'Preferencias', icon: <Heart size={16} /> },
  { key: 'seguridad', label: 'Seguridad', icon: <Lock size={16} /> },
];

export default function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const { citas, cargarCitas } = useCitas();
  const fileInputRef = useRef(null);

  const [perfil, setPerfil] = useState({
    nombre: '', apellidos: '', telefono: '', cedula: '',
    correo: '', serviciosFavoritos: [], avatar: null,
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      const data = await perfilService.getPerfil(user?.nombre, 'cliente');
      setPerfil(data);
    };
    if (user?.nombre) fetchPerfil();
  }, [user?.nombre]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [tabActual, setTabActual] = useState('info');

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwOk, setPwOk] = useState(false);

  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [eliminado, setEliminado] = useState(false);
  const [mostrarPeligro, setMostrarPeligro] = useState(false);

  const [subiendoAvatar, setSubiendoAvatar] = useState(false);

  useEffect(() => {
    if (user?.nombre) cargarCitas(user.nombre);
  }, [user, cargarCitas]);

  const barberoFavorito = useMemo(() => {
    const conteo = {};
    citas.forEach((c) => {
      if (c.estado === 'completada' && c.barbero?.name) {
        conteo[c.barbero.name] = (conteo[c.barbero.name] || 0) + 1;
      }
    });
    const entries = Object.entries(conteo);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [citas]);

  const entrarEdicion = () => {
    setFormData({ ...perfil });
    setEditMode(true);
  };

  const cancelarEdicion = () => {
    setFormData(null);
    setEditMode(false);
  };

  const guardarCambios = async () => {
    await perfilService.guardarPerfil(user?.nombre, 'cliente', formData);
    setPerfil({ ...formData });
    setEditMode(false);
    setFormData(null);
    toast.success('Perfil actualizado correctamente');
  };

  const actualizarCampo = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleServicio = (codigo) => {
    const actuales = formData?.serviciosFavoritos || [];
    if (actuales.includes(codigo)) {
      actualizarCampo('serviciosFavoritos', actuales.filter((c) => c !== codigo));
    } else if (actuales.length < 3) {
      actualizarCampo('serviciosFavoritos', [...actuales, codigo]);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoAvatar(true);
    try {
      const base64 = await perfilService.procesarImagen(file, 300);
      if (editMode) {
        actualizarCampo('avatar', base64);
      } else {
        await perfilService.guardarPerfil(user?.nombre, 'cliente', { avatar: base64 });
        setPerfil((prev) => ({ ...prev, avatar: base64 }));
        toast.success('Foto actualizada');
      }
    } catch {
      toast.error('Error al procesar la imagen');
    } finally {
      setSubiendoAvatar(false);
    }
  };

  const handleGuardarPassword = () => {
    setPwError('');
    if (password || password2) {
      if (password.length < 6) {
        setPwError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== password2) {
        setPwError('Las contraseñas no coinciden.');
        return;
      }
    }
    setPwOk(true);
    setTimeout(() => setPwOk(false), 3000);
    setPassword('');
    setPassword2('');
    toast.success('Contraseña actualizada correctamente');
  };

  const handleEliminar = () => {
    setEliminado(true);
    setTimeout(() => { logout(); navigate('/login'); }, 2000);
  };

  const avatarSrc = editMode ? formData?.avatar : perfil.avatar;
  const data = editMode ? formData : perfil;

  return (
    <div className="app-layout">
      <Sidebar avatar={<User size={20} />} badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content" style={{ padding: 0 }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '32px',
        }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>

              {/* Avatar */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: avatarSrc
                    ? 'none'
                    : 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.8rem', flexShrink: 0, cursor: 'pointer',
                  boxShadow: avatarSrc
                    ? '0 0 0 4px rgba(192,57,43,0.2), var(--shadow-lg)'
                    : '0 0 0 4px rgba(192,57,43,0.2), var(--shadow-lg)',
                  overflow: 'hidden', position: 'relative',
                }}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  <span>{user?.nombre?.charAt(0)?.toUpperCase() || '?'}</span>
                )}
                {subiendoAvatar && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleAvatarChange} />

              {/* Info + buttons */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                    {user?.nombre}
                  </h1>
                  <span className="badge badge-gold">Cliente</span>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 14,
                }}>
                  <Star size={14} style={{ color: 'var(--gold)' }} />
                  {barberoFavorito
                    ? `Barbero favorito: ${barberoFavorito}`
                    : 'Aún sin citas completadas'}
                </div>

                {editMode ? (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-primary" onClick={guardarCambios}>
                      <Save size={16} /> Guardar cambios
                    </button>
                    <button className="btn btn-outline" onClick={cancelarEdicion}>
                      <X size={16} /> Cancelar
                    </button>
                  </div>
                ) : (
                  <button className="btn btn-outline" onClick={entrarEdicion}
                    style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}>
                    <Pencil size={16} /> Editar perfil
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px' }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0, borderBottom: '1px solid var(--border)',
            marginBottom: 24, overflowX: 'auto',
          }}>
            {TABS.map((tab) => (
              <button key={tab.key}
                onClick={() => setTabActual(tab.key)}
                style={{
                  padding: '12px 20px', background: 'transparent', border: 'none',
                  borderBottom: tabActual === tab.key ? '2px solid var(--cobre)' : '2px solid transparent',
                  color: tabActual === tab.key ? 'var(--cobre-light)' : 'var(--muted)',
                  cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s ease',
                }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Información personal */}
          {tabActual === 'info' && (
            <div className="card" style={{ maxWidth: 540, border: 'none', boxShadow: 'none', background: 'transparent', padding: 0 }}>
              {editMode ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Cédula</label>
                    <input className="form-control" value={data.cedula} readOnly
                      style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                      No se puede modificar
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Nombres</label>
                      <input className="form-control"
                        value={data.nombre}
                        onChange={(e) => actualizarCampo('nombre', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Apellidos</label>
                      <input className="form-control"
                        value={data.apellidos}
                        onChange={(e) => actualizarCampo('apellidos', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo electrónico</label>
                    <input className="form-control" value={data.correo} readOnly
                      style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                      No se puede modificar
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-control"
                      value={data.telefono}
                      onChange={(e) => actualizarCampo('telefono', e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">Cédula</label>
                    <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.cedula}</div>
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Nombres</label>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.nombre}</div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Apellidos</label>
                      <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.apellidos || '—'}</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Correo electrónico</label>
                    <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.correo}</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.telefono || '—'}</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab: Preferencias */}
          {tabActual === 'preferencias' && (
            <div className="card" style={{ maxWidth: 540, border: 'none', boxShadow: 'none', background: 'transparent', padding: 0 }}>
              <label className="form-label">Servicios favoritos {editMode ? '(máx. 3)' : ''}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {Object.entries(NOMBRES_SERVICIOS).map(([codigo, nombre]) => {
                  const seleccionado = (data.serviciosFavoritos || []).includes(codigo);
                  return (
                    <button key={codigo}
                      onClick={() => editMode && toggleServicio(codigo)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, border: '1px solid',
                        borderColor: seleccionado ? 'var(--cobre)' : 'var(--border)',
                        background: seleccionado ? 'rgba(201,123,58,0.15)' : 'transparent',
                        color: seleccionado ? 'var(--cobre-light)' : 'var(--text)',
                        cursor: editMode ? 'pointer' : 'default',
                        fontSize: '0.85rem', transition: 'all 0.2s ease',
                        fontFamily: "'Inter', sans-serif",
                      }}>
                      {nombre}
                    </button>
                  );
                })}
              </div>
              {!editMode && (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 12 }}>
                  {data.serviciosFavoritos?.length
                    ? 'Activa edición para cambiar tus preferencias'
                    : 'Aún no has seleccionado servicios favoritos'}
                </div>
              )}
            </div>
          )}

          {/* Tab: Seguridad */}
          {tabActual === 'seguridad' && (
            <div className="card" style={{ maxWidth: 540, border: 'none', boxShadow: 'none', background: 'transparent', padding: 0 }}>
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700,
                marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Lock size={20} /> Cambiar contraseña
              </div>

              {pwOk && (
                <div className="alert alert-success" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={16} /> Contraseña actualizada correctamente.
                </div>
              )}
              {pwError && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                  {pwError}
                </div>
              )}

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nueva contraseña</label>
                  <input type="password" className="form-control" placeholder="Mín. 6 caracteres"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar</label>
                  <input type="password" className="form-control" placeholder="Repite la contraseña"
                    value={password2} onChange={(e) => setPassword2(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleGuardarPassword} style={{ marginTop: 8 }}>
                <Save size={16} /> Actualizar contraseña
              </button>
              {editMode && (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 12 }}>
                  Los cambios de perfil se guardan con el botón superior
                </div>
              )}
            </div>
          )}

          {/* ── Zona de peligro (acordeón) ── */}
          <div style={{ maxWidth: 540, marginTop: 40 }}>
            <button
              onClick={() => setMostrarPeligro(!mostrarPeligro)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '14px 16px', background: 'transparent',
                border: '1px solid var(--border)', borderRadius: 12,
                cursor: 'pointer', color: 'var(--cobre-light)',
                fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', fontWeight: 600,
              }}>
              <Trash2 size={18} />
              Zona de peligro
              <span style={{ marginLeft: 'auto' }}>
                {mostrarPeligro ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </span>
            </button>
            {mostrarPeligro && (
              <div style={{
                padding: 20, marginTop: 2, borderRadius: '0 0 12px 12px',
                background: 'rgba(192,57,43,0.06)',
                border: '1px solid rgba(192,57,43,0.2)',
                borderTop: 'none',
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700,
                  marginBottom: 8, color: 'var(--cobre-light)',
                }}>
                  Eliminar cuenta
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
                  Una vez eliminada tu cuenta, no podrás recuperarla. Todos tus datos
                  (citas, historial y preferencias) serán eliminados permanentemente.
                </p>
                <button className="btn btn-outline"
                  style={{ color: 'var(--cobre-light)', borderColor: 'var(--cobre-light)' }}
                  onClick={() => setMostrarEliminar(true)}>
                  <Trash2 size={16} /> Eliminar mi cuenta
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal eliminar cuenta */}
      {mostrarEliminar && !eliminado && (
        <div onClick={() => setMostrarEliminar(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(192,57,43,0.3)',
              borderRadius: 16, padding: '32px 28px',
              maxWidth: 420, width: '100%',
              boxShadow: 'var(--shadow-lg)', textAlign: 'center',
            }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}><AlertTriangle size={56} /></div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.3rem', marginBottom: 10,
            }}>
              ¿Eliminar tu cuenta?
            </h3>
            <p style={{
              color: 'var(--muted)', fontSize: '0.88rem',
              lineHeight: 1.65, marginBottom: 24,
            }}>
              Esta acción es <strong style={{ color: 'var(--cobre-light)' }}>irreversible</strong>.
              Perderás acceso a tu historial de citas, barberos favoritos y
              configuraciones guardadas.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setMostrarEliminar(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
                }}
                onClick={handleEliminar}>
                <Trash2 size={16} /> Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {eliminado && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid rgba(46,160,67,0.3)',
            borderRadius: 16, padding: '32px 28px',
            maxWidth: 420, width: '100%',
            boxShadow: 'var(--shadow-lg)', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}><Frown size={56} /></div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: 10 }}>
              Cuenta eliminada
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.65 }}>
              Sentimos verte ir. Serás redirigido al inicio...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
