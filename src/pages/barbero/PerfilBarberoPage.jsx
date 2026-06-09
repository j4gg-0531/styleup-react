import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Clock, Scissors, ClipboardList, BookOpen, BarChart3,
  MapPin, Lock, Save, Trash2, AlertTriangle, Frown, CheckCircle,
  Bell, LogOut, User, X, Pencil, Star, ChevronDown, ChevronRight, ExternalLink, FileText,
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useToast } from '../../context/useToast.js';
import { perfilService } from '../../services/perfilService.js';
import { serviciosService } from '../../services/serviciosService.js';
import { notificacionesService } from '../../services/notificacionesService.js';
import { barberiaService } from '../../services/barberiaService.js';
import { barberosService } from '../../services/barberosService.js';
import SelectorUbicacion from '../../components/SelectorUbicacion.jsx';

const navItems = [
  { icon: <Home size={18} />, label: 'Dashboard',     href: '/barbero' },
  { icon: <Clock size={18} />, label: 'Mis horarios',  href: '/barbero/horarios' },
  { icon: <Scissors size={18} />, label: 'Mis servicios', href: '/barbero/precios' },
  { icon: <FileText size={18} />, label: 'Mi Hoja de Vida', href: '/barbero/hoja-de-vida' },
  { icon: <ClipboardList size={18} />, label: 'Ofertas',       href: '/barbero/ofertas' },
  { icon: <BookOpen size={18} />, label: 'Historial',     href: '/barbero/historial' },
  { icon: <BarChart3 size={18} />, label: 'Reportes',      href: '/barbero/reportes' },
  { icon: <Bell size={18} />, label: 'Notificaciones', href: '/barbero/notificaciones', notificacionesBadge: true },
];

const TABS = [
  { key: 'info', label: 'Información personal', icon: <User size={16} /> },
  { key: 'redes', label: 'Redes sociales', icon: <ExternalLink size={16} /> },
  { key: 'seguridad', label: 'Seguridad', icon: <Lock size={16} /> },
];

export default function PerfilBarberoPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [perfil, setPerfil] = useState({
    nombre: '', apellidos: '', telefono: '', especialidades: [],
    cedula: '', correo: '', ubicacion: null, instagram: '', tiktok: '', avatar: null,
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      const data = await perfilService.getPerfil(user?.nombre, 'barbero');
      setPerfil(data);
    };
    if (user?.nombre) fetchPerfil();
  }, [user?.nombre]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [tabActual, setTabActual] = useState('info');

  const [passwordActual, setPasswordActual] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwOk, setPwOk] = useState(false);

  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [eliminado, setEliminado] = useState(false);
  const [mostrarConfirmRenuncia, setMostrarConfirmRenuncia] = useState(false);
  const [renunciaEnviada, setRenunciaEnviada] = useState(false);
  const [mostrarPeligro, setMostrarPeligro] = useState(false);

  const [subiendoAvatar, setSubiendoAvatar] = useState(false);

  const [barberia, setBarberia] = useState(null);

  useEffect(() => {
    const fetchBarberia = async () => {
      if (!user?.nombre) { setBarberia(null); return; }
      const todas = await barberiaService.getTodas();
      for (const barb of todas) {
        if (!barb.barberoIds?.length) continue;
        for (const bid of barb.barberoIds) {
          const b = await barberosService.getById(bid);
          if (b && b.nombre.toLowerCase() === user.nombre.toLowerCase()) {
            setBarberia(barb);
            return;
          }
        }
      }
      setBarberia(null);
    };
    fetchBarberia();
  }, [user]);

  const entrarEdicion = () => {
    setFormData({ ...perfil });
    setEditMode(true);
  };

  const cancelarEdicion = () => {
    setFormData(null);
    setEditMode(false);
  };

  const guardarCambios = async () => {
    await perfilService.guardarPerfil(user?.nombre, 'barbero', formData);
    setPerfil({ ...formData });
    setEditMode(false);
    setFormData(null);
    toast.success('Perfil actualizado correctamente');
  };

  const actualizarCampo = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const toggleEspecialidad = (codigo) => {
    const actuales = formData?.especialidades || [];
    if (actuales.includes(codigo)) {
      actualizarCampo('especialidades', actuales.filter((c) => c !== codigo));
    } else {
      actualizarCampo('especialidades', [...actuales, codigo]);
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
        await perfilService.guardarPerfil(user?.nombre, 'barbero', { avatar: base64 });
        setPerfil((prev) => ({ ...prev, avatar: base64 }));
        toast.success('Foto actualizada');
      }
    } catch {
      toast.error('Error al procesar la imagen');
    } finally {
      setSubiendoAvatar(false);
    }
  };

  const handleGuardarPassword = async () => {
    setPwError('');
    if (!passwordActual) {
      setPwError('Debes ingresar tu contraseña actual.');
      return;
    }
    if (password.length < 6) {
      setPwError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== password2) {
      setPwError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await perfilService.cambiarPassword(passwordActual, password);
      setPwOk(true);
      setTimeout(() => setPwOk(false), 3000);
      setPasswordActual('');
      setPassword('');
      setPassword2('');
      toast.success('Contraseña actualizada correctamente');
    } catch (e) {
      setPwError(e.message);
    }
  };

  const handleEliminar = async () => {
    try {
      await perfilService.eliminarCuenta();
      setEliminado(true);
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch {
      toast.error('Error al eliminar la cuenta');
    }
  };

  const avatarSrc = editMode ? formData?.avatar : perfil.avatar;
  const data = editMode ? formData : perfil;

  return (
    <div className="app-layout">
      <Sidebar avatar={<Scissors size={20} />} badge="Barbero" navItems={navItems} />

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
                  overflow: 'hidden', position: 'relative',
                  boxShadow: '0 0 0 4px rgba(192,57,43,0.2), var(--shadow-lg)',
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

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                    {user?.nombre}
                  </h1>
                  <span className="badge">Barbero</span>
                  {barberia && (
                    <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>
                      Trabaja en {barberia.nombre}
                    </span>
                  )}
                </div>

                {/* Especialidades chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {(data.especialidades?.length ? data.especialidades : []).map((cod) => (
                    <span key={cod} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 10px', borderRadius: 14,
                      background: 'rgba(201,123,58,0.15)',
                      border: '1px solid rgba(201,123,58,0.3)',
                      color: 'var(--cobre-light)', fontSize: '0.78rem',
                    }}>
                      <Scissors size={12} /> {serviciosService.getNombre(cod)}
                    </span>
                  ))}
                  {!data.especialidades?.length && (
                    <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>
                      Sin especialidades registradas
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 14, fontSize: '0.85rem', color: 'var(--muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={14} style={{ color: 'var(--gold)' }} /> 4.5
                  </span>
                  <span>2 años activo</span>
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
              <div className="form-group">
                <label className="form-label">Cédula</label>
                {editMode ? (
                  <input className="form-control" value={data.cedula} readOnly
                    style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.cedula}</div>
                )}
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                  No se puede modificar
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Nombres</label>
                  {editMode ? (
                    <input className="form-control"
                      value={data.nombre}
                      onChange={(e) => actualizarCampo('nombre', e.target.value)} />
                  ) : (
                    <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.nombre}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Apellidos</label>
                  {editMode ? (
                    <input className="form-control"
                      value={data.apellidos}
                      onChange={(e) => actualizarCampo('apellidos', e.target.value)} />
                  ) : (
                    <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.apellidos || '—'}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                {editMode ? (
                  <input className="form-control" value={data.correo} readOnly
                    style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.correo}</div>
                )}
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                  No se puede modificar
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                {editMode ? (
                  <input className="form-control"
                    value={data.telefono}
                    onChange={(e) => actualizarCampo('telefono', e.target.value)} />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.telefono || '—'}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Especialidades</label>
                {editMode ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    {Object.entries(serviciosService.getAll()).map(([codigo, svc]) => {
                      const sel = (formData?.especialidades || []).includes(codigo);
                      return (
                        <button key={codigo} type="button"
                          onClick={() => toggleEspecialidad(codigo)}
                          style={{
                            padding: '6px 14px', borderRadius: 20, border: '1px solid',
                            borderColor: sel ? 'var(--cobre)' : 'var(--border)',
                            background: sel ? 'rgba(201,123,58,0.15)' : 'transparent',
                            color: sel ? 'var(--cobre-light)' : 'var(--text)',
                            cursor: 'pointer', fontSize: '0.85rem',
                            fontFamily: "'Inter', sans-serif",
                          }}>
                          {svc.nombre}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>
                    {data.especialidades?.length
                      ? data.especialidades.map((c) => serviciosService.getNombre(c)).join(', ')
                      : '—'}
                  </div>
                )}
              </div>

              {/* SelectorUbicacion — solo si es independiente */}
              {!barberia && (
                <>
                  <hr className="divider" />
                  <div style={{
                    fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700,
                    marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)',
                  }}>
                    <MapPin size={20} /> Mi ubicación
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 12 }}>
                    Marca tu ubicación para que los clientes te encuentren en el mapa.
                  </p>
                  {editMode ? (
                    <SelectorUbicacion
                      valor={formData?.ubicacion || null}
                      onChange={(v) => actualizarCampo('ubicacion', v)}
                      colorPin="#e74c3c"
                      altura={260}
                    />
                  ) : (
                    <div style={{ padding: '10px 0', fontSize: '0.95rem', color: 'var(--muted)' }}>
                      {data.ubicacion
                        ? `${data.ubicacion.lat?.toFixed(4)}, ${data.ubicacion.lng?.toFixed(4)}`
                        : 'No has configurado tu ubicación'}
                    </div>
                  )}
                </>
              )}
              {barberia && (
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 16, padding: '12px 16px', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <MapPin size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Tu ubicación es la de <strong>{barberia.nombre}</strong>. Si te vuelves independiente, podrás configurarla aquí.
                </div>
              )}
            </div>
          )}

          {/* Tab: Redes sociales */}
          {tabActual === 'redes' && (
            <div className="card" style={{ maxWidth: 540, border: 'none', boxShadow: 'none', background: 'transparent', padding: 0 }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x={2} y={2} width={20} height={20} rx={5} />
                    <circle cx={12} cy={12} r={5} />
                    <circle cx={17.5} cy={6.5} r={1.5} fill="currentColor" />
                  </svg>
                  Instagram
                </label>
                {editMode ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>@</span>
                    <input className="form-control"
                      value={(formData?.instagram || '').replace('@', '')}
                      onChange={(e) => actualizarCampo('instagram', '@' + e.target.value.replace(/^@/, ''))}
                      placeholder="usuario" style={{ flex: 1 }} />
                    {formData?.instagram && (
                      <a href={`https://instagram.com/${formData.instagram.replace('@', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--muted)', display: 'flex' }}
                        title="Abrir Instagram">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {data.instagram ? (
                      <>
                        <span>{data.instagram}</span>
                        <a href={`https://instagram.com/${data.instagram.replace('@', '')}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--muted)', display: 'flex' }}
                          title="Abrir Instagram">
                          <ExternalLink size={16} />
                        </a>
                      </>
                    ) : '—'}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                  </svg>
                  TikTok
                </label>
                {editMode ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>@</span>
                    <input className="form-control"
                      value={(formData?.tiktok || '').replace('@', '')}
                      onChange={(e) => actualizarCampo('tiktok', '@' + e.target.value.replace(/^@/, ''))}
                      placeholder="usuario" style={{ flex: 1 }} />
                    {formData?.tiktok && (
                      <a href={`https://tiktok.com/@${formData.tiktok.replace('@', '')}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ color: 'var(--muted)', display: 'flex' }}
                        title="Abrir TikTok">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {data.tiktok ? (
                      <>
                        <span>{data.tiktok}</span>
                        <a href={`https://tiktok.com/@${data.tiktok.replace('@', '')}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--muted)', display: 'flex' }}
                          title="Abrir TikTok">
                          <ExternalLink size={16} />
                        </a>
                      </>
                    ) : '—'}
                  </div>
                )}
              </div>
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

              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Contraseña actual</label>
                <input type="password" className="form-control" placeholder="Tu contraseña actual"
                  value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} />
              </div>

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

          {/* ── Zona de peligro ── */}
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
                  (servicios, horarios, ofertas) serán eliminados permanentemente.
                </p>
                <button className="btn btn-outline"
                  style={{ color: 'var(--cobre-light)', borderColor: 'var(--cobre-light)' }}
                  onClick={() => setMostrarEliminar(true)}>
                  <Trash2 size={16} /> Eliminar mi cuenta
                </button>

                {barberia && (
                  <div style={{ marginTop: 20, borderTop: '1px solid rgba(230,184,106,0.2)', paddingTop: 20 }}>
                    <div style={{
                      fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700,
                      marginBottom: 8, color: 'var(--gold)',
                    }}>
                      <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      Renunciar a mi barbería
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
                      Si ya no deseas trabajar en <strong>{barberia.nombre}</strong>, puedes renunciar.
                      La barbería recibirá una notificación de tu renuncia.
                    </p>
                    <button className="btn btn-outline"
                      style={{ color: 'var(--gold)', borderColor: 'var(--gold)' }}
                      onClick={() => setMostrarConfirmRenuncia(true)}>
                      <LogOut size={16} /> Renunciar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modales */}
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
              Perderás acceso a tu perfil, servicios configurados, horarios y
              postulaciones a ofertas.
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

      {mostrarConfirmRenuncia && !renunciaEnviada && (
        <div onClick={() => setMostrarConfirmRenuncia(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              border: '1px solid rgba(230,184,106,0.3)',
              borderRadius: 16, padding: '32px 28px',
              maxWidth: 420, width: '100%',
              boxShadow: 'var(--shadow-lg)', textAlign: 'center',
            }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}><LogOut size={48} /></div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', marginBottom: 10 }}>
              ¿Renunciar a {barberia?.nombre}?
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: 1.65, marginBottom: 24 }}>
              {barberia?.nombre} recibirá una notificación de tu renuncia.
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => { setMostrarConfirmRenuncia(false); }}>
                Cancelar
              </button>
              <button className="btn btn-primary"
                style={{ background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))' }}
                onClick={async () => {
                  if (barberia) {
                    await notificacionesService.crear({
                      tipo: 'renuncia_barbero',
                      paraRol: 'barberia',
                      paraNombre: barberia.nombreDueno,
                      deRol: 'barbero',
                      deNombre: user?.nombre || 'Barbero',
                      mensaje: `${user?.nombre} ha renunciado a tu barbería`,
                      metadata: { barberiaId: barberia.id },
                    });
                  }
                  setMostrarConfirmRenuncia(false);
                  setRenunciaEnviada(true);
                  setTimeout(() => setRenunciaEnviada(false), 4000);
                }}>
                <LogOut size={16} /> Confirmar renuncia
              </button>
            </div>
          </div>
        </div>
      )}

      {renunciaEnviada && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 2001,
          background: 'var(--surface)',
          border: '1px solid rgba(230,184,106,0.3)',
          borderRadius: 12, padding: '14px 20px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.88rem', color: 'var(--gold)',
        }}>
          <CheckCircle size={18} /> Renuncia enviada correctamente
        </div>
      )}
    </div>
  );
}
