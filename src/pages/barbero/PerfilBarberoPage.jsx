import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';
import SelectorUbicacion from '../../components/SelectorUbicacion.jsx';

const navItems = [
  { icon: '🏠', label: 'Dashboard',     href: '/barbero' },
  { icon: '⏰', label: 'Mis horarios',  href: '/barbero/horarios' },
  { icon: '✂',  label: 'Mis servicios', href: '/barbero/precios' },
  { icon: '📋', label: 'Ofertas',       href: '/barbero/ofertas' },
  { icon: '📖', label: 'Historial',     href: '/barbero/historial' },
  { icon: '📊', label: 'Reportes',      href: '/barbero/reportes' },
];

const extra = <div className="spec-badge" style={{ marginTop: 8 }}>✂ Corte a tijera</div>;

export default function PerfilBarberoPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [ubicacion, setUbicacion]     = useState(null);
  const [password, setPassword]       = useState('');
  const [password2, setPassword2]     = useState('');
  const [pwError, setPwError]         = useState('');
  const [pwOk, setPwOk]               = useState(false);
  const [saveOk, setSaveOk]           = useState(false);

  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  const [eliminado, setEliminado]             = useState(false);

  const handleGuardar = () => {
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
      sessionStorage.setItem('styleup_password', password);
    }

    setPwOk(true);
    setTimeout(() => setPwOk(false), 3000);
    setPassword('');
    setPassword2('');
    setSaveOk(true);
    setTimeout(() => setSaveOk(false), 3000);
  };

  const handleEliminar = () => {
    sessionStorage.removeItem('styleup_password');
    setEliminado(true);
    setTimeout(() => { logout(); navigate('/login'); }, 2000);
  };

  return (
    <div className="app-layout">
      <Sidebar avatar="💈" badge="Barbero" navItems={navItems} extra={extra} />

      <main className="main-content" style={{ padding: 0 }}>

        <div style={{
          background: 'linear-gradient(160deg, #1a0806 0%, #2c0f0a 50%, #161b22 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '32px',
        }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--cobre), var(--cobre-light))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.8rem', flexShrink: 0,
                boxShadow: '0 0 0 4px rgba(192,57,43,0.2), var(--shadow-lg)',
              }}>
                💈
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                    {user?.nombre}
                  </h1>
                  <span className="badge">Barbero</span>
                </div>
                <div style={{ color: 'var(--gold)', fontSize: '0.95rem', marginBottom: 4 }}>
                  ✂ Corte a tijera
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Datos personales y profesionales
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px' }}>
          <div className="card" style={{ maxWidth: 540 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700,
              marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              📋 Información personal
            </div>

            <div className="form-group">
              <label className="form-label">Cédula</label>
              <input className="form-control" defaultValue="B001" readOnly
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                No se puede modificar
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Nombres</label>
                <input className="form-control" defaultValue={user?.nombre} />
              </div>
              <div className="form-group">
                <label className="form-label">Apellidos</label>
                <input className="form-control" defaultValue="Pérez" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-control" defaultValue="barbero@correo.com" readOnly
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                No se puede modificar
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-control" defaultValue="3009876543" />
            </div>
            <div className="form-group">
              <label className="form-label">Especialidad</label>
              <select className="form-control">
                <option>Corte a tijera (30 min)</option>
                <option>Degradado / Fade (25 min)</option>
                <option>Afeitado con navaja (20 min)</option>
                <option>Corte + Barba (45 min)</option>
              </select>
            </div>

            <hr className="divider" />

            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700,
              marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gold)',
            }}>
              📍 Mi ubicación
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 12 }}>
              Si eres barbero independiente, marca tu ubicación para que los clientes
              te encuentren en el mapa. Si trabajas en una barbería, tu ubicación
              será la de ella.
            </p>
            <SelectorUbicacion
              valor={ubicacion}
              onChange={setUbicacion}
              colorPin="#e74c3c"
              altura={260}
            />

            <hr className="divider" />

            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700,
              marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              🔒 Cambiar contraseña
            </div>

            {pwOk && (
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                ✅ Contraseña actualizada correctamente.
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

            <button className="btn btn-primary" onClick={handleGuardar}
              style={{ marginTop: 8 }}>
              💾 Guardar cambios
            </button>
            {saveOk && (
              <div className="alert alert-success" style={{ marginTop: 12 }}>
                ✅ Perfil actualizado.
              </div>
            )}
          </div>

          <div className="card" style={{ maxWidth: 540, marginTop: 24, borderColor: 'rgba(192,57,43,0.3)' }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700,
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cobre-light)',
            }}>
              🗑️ Eliminar cuenta
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Una vez eliminada tu cuenta, no podrás recuperarla. Todos tus datos
              (servicios, horarios, ofertas) serán eliminados permanentemente.
            </p>
            <button className="btn btn-outline"
              style={{ color: 'var(--cobre-light)', borderColor: 'var(--cobre-light)' }}
              onClick={() => setMostrarEliminar(true)}>
              Eliminar mi cuenta
            </button>
          </div>
        </div>
      </main>

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
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>⚠️</div>
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
                🗑️ Sí, eliminar
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
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>😢</div>
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
