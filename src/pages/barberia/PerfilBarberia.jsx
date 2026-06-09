import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, Scissors, ClipboardList, Clock, BarChart3,
  Building2, Lock, Save, Trash2, AlertTriangle, Frown,
  CheckCircle, Bell, X, Pencil, ChevronDown, ChevronRight, MapPin,
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import { useToast } from '../../context/useToast.js';
import { perfilService } from '../../services/perfilService.js';
import { barberiaService } from '../../services/barberiaService.js';
import { ofertasService } from '../../services/ofertasService.js';
import SelectorUbicacion from '../../components/SelectorUbicacion.jsx';

const navItems = [
  { icon: <Home size={18} />, label: 'Dashboard',  href: '/barberia' },
  { icon: <Scissors size={18} />, label: 'Barberos',   href: '/barberia/barberos' },
  { icon: <ClipboardList size={18} />, label: 'Ofertas',    href: '/barberia/ofertas' },
  { icon: <Clock size={18} />, label: 'Horarios',   href: '/barberia/horarios' },
  { icon: <Scissors size={18} />, label: 'Servicios',  href: '/barberia/servicios' },
  { icon: <BarChart3 size={18} />, label: 'Reportes',   href: '/barberia/reportes' },
  { icon: <Bell size={18} />, label: 'Notificaciones', href: '/barberia/notificaciones', notificacionesBadge: true },
];

const TABS = [
  { key: 'info', label: 'Información del negocio', icon: <Building2 size={16} /> },
  { key: 'seguridad', label: 'Seguridad', icon: <Lock size={16} /> },
];

export default function PerfilBarberia() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [barberia, setBarberia] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    if (!user?.nombre) return;
    const fetchData = async () => {
      const [barberiaData, perfilData] = await Promise.all([
        barberiaService.getByNombre(user.nombre),
        perfilService.getPerfil(user.nombre, 'barberia'),
      ]);
      setBarberia(barberiaData);
      if (barberiaData && !perfilData.nombreBarberia) {
        setPerfil({
          ...perfilData,
          nombreBarberia: barberiaData.nombre || perfilData.nombreBarberia,
          telefono: barberiaData.telefono || perfilData.telefono,
          direccion: barberiaData.direccion || perfilData.direccion,
          ciudad: barberiaData.ciudad || perfilData.ciudad,
          descripcion: barberiaData.descripcion || perfilData.descripcion,
          lat: barberiaData.lat ?? perfilData.lat,
          lng: barberiaData.lng ?? perfilData.lng,
        });
      } else {
        setPerfil(perfilData);
      }
    };
    fetchData();
  }, [user]);

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

  const [subiendoLogo, setSubiendoLogo] = useState(false);

  const barberosActivos = barberia?.barberoIds?.length || 0;
  const [ofertasActivas, setOfertasActivas] = useState(0);

  useEffect(() => {
    if (!barberia) return;
    const fetchOfertas = async () => {
      const ofs = await ofertasService.getOfertasByBarberia(barberia.id);
      setOfertasActivas(ofs.filter((o) => o.estado === 'activa').length);
    };
    fetchOfertas();
  }, [barberia]);

  const entrarEdicion = () => {
    setFormData({ ...perfil });
    setEditMode(true);
  };

  const cancelarEdicion = () => {
    setFormData(null);
    setEditMode(false);
  };

  const guardarCambios = async () => {
    await perfilService.guardarPerfil(user?.nombre, 'barberia', formData);
    setPerfil({ ...formData });
    setEditMode(false);
    setFormData(null);
    toast.success('Perfil actualizado correctamente');
  };

  const actualizarCampo = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoLogo(true);
    try {
      const base64 = await perfilService.procesarImagen(file, 400, 0.8);
      if (editMode) {
        actualizarCampo('logo', base64);
      } else {
        await perfilService.guardarPerfil(user?.nombre, 'barberia', { logo: base64 });
        setPerfil((prev) => ({ ...prev, logo: base64 }));
        toast.success('Logo actualizado');
      }
    } catch {
      toast.error('Error al procesar la imagen');
    } finally {
      setSubiendoLogo(false);
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

  if (!perfil) {
    return (
      <div className="app-layout">
        <Sidebar avatar={<Building2 size={20} />} badge="Barbería" badgeClass="badge-gold" navItems={navItems} />
        <main className="main-content"><p style={{ padding: 32, color: 'var(--muted)' }}>Cargando perfil...</p></main>
      </div>
    );
  }

  const logoSrc = editMode ? formData?.logo : perfil.logo;
  const data = editMode ? formData : perfil;

  return (
    <div className="app-layout">
      <Sidebar avatar={<Building2 size={20} />} badge="Barbería" badgeClass="badge-gold" navItems={navItems} />

      <main className="main-content" style={{ padding: 0 }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '32px',
        }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>

              {/* Logo (cuadrado) */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 100, height: 100, borderRadius: 12,
                  background: logoSrc
                    ? 'none'
                    : 'linear-gradient(135deg, var(--gold-dim), var(--gold))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.8rem', flexShrink: 0, cursor: 'pointer',
                  overflow: 'hidden', position: 'relative',
                  boxShadow: '0 0 0 4px rgba(230,184,106,0.2), var(--shadow-lg)',
                }}>
                {logoSrc ? (
                  <img src={logoSrc} alt="logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                ) : (
                  <Building2 size={40} style={{ color: '#fff' }} />
                )}
                {subiendoLogo && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 12,
                    background: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleLogoChange} />

              {/* Info + buttons */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                    {data.nombreBarberia || user?.nombre}
                  </h1>
                  <span className="badge badge-gold">Barbería</span>
                </div>

                <div style={{
                  display: 'flex', gap: 20, flexWrap: 'wrap',
                  marginBottom: 14, fontSize: '0.85rem', color: 'var(--muted)',
                }}>
                  <span>{barberosActivos} barberos registrados</span>
                  <span>{ofertasActivas} ofertas activas</span>
                  <span>{data.numTrabajadores || 1} trabajadores</span>
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

          {/* Tab: Información del negocio */}
          {tabActual === 'info' && (
            <div className="card" style={{ maxWidth: 540, border: 'none', boxShadow: 'none', background: 'transparent', padding: 0 }}>
              <div className="form-group">
                <label className="form-label">Nombre del negocio</label>
                {editMode ? (
                  <input className="form-control"
                    value={formData?.nombreBarberia || ''}
                    onChange={(e) => actualizarCampo('nombreBarberia', e.target.value)} />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.nombreBarberia}</div>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">NIT</label>
                  {editMode ? (
                    <input className="form-control" value={data.nit} readOnly
                      style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                  ) : (
                    <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.nit}</div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                    No se puede modificar
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  {editMode ? (
                    <input className="form-control"
                      value={formData?.telefono || ''}
                      onChange={(e) => actualizarCampo('telefono', e.target.value)} />
                  ) : (
                    <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.telefono || '—'}</div>
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
                <label className="form-label">Dirección</label>
                {editMode ? (
                  <input className="form-control"
                    value={formData?.direccion || ''}
                    onChange={(e) => actualizarCampo('direccion', e.target.value)} />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.direccion || '—'}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Ciudad</label>
                {editMode ? (
                  <input className="form-control"
                    value={formData?.ciudad || ''}
                    onChange={(e) => actualizarCampo('ciudad', e.target.value)} />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.ciudad || '—'}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                {editMode ? (
                  <textarea className="form-control" rows={3}
                    value={formData?.descripcion || ''}
                    onChange={(e) => actualizarCampo('descripcion', e.target.value)}
                    style={{ resize: 'vertical' }} />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {data.descripcion || '—'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Número de trabajadores</label>
                {editMode ? (
                  <input type="number" min={1} className="form-control"
                    value={formData?.numTrabajadores ?? 1}
                    onChange={(e) => actualizarCampo('numTrabajadores', parseInt(e.target.value) || 1)}
                    style={{ maxWidth: 120 }} />
                ) : (
                  <div style={{ padding: '10px 0', fontSize: '0.95rem' }}>{data.numTrabajadores || 1}</div>
                )}
              </div>

              <hr className="divider" />
              <div style={{
                fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700,
                marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)',
              }}>
                <MapPin size={20} /> Ubicación del negocio
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 12 }}>
                Marca la ubicación de tu barbería para que los clientes te encuentren.
              </p>
              {editMode ? (
                <SelectorUbicacion
                  valor={formData ? { lat: formData.lat, lng: formData.lng } : null}
                  onChange={(v) => {
                    actualizarCampo('lat', v?.lat ?? null);
                    actualizarCampo('lng', v?.lng ?? null);
                  }}
                  colorPin="#e6b86a"
                  altura={260}
                />
              ) : (
                <div style={{ padding: '10px 0', fontSize: '0.95rem', color: 'var(--muted)' }}>
                  {data.lat && data.lng
                    ? `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`
                    : 'No has configurado la ubicación'}
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
                  (barbería, barberos registrados, ofertas publicadas y configuración del negocio)
                  serán eliminados permanentemente.
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
              Perderás acceso a tu barbería, barberos registrados, ofertas
              publicadas y configuración del negocio.
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
