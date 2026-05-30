import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Scissors, BookOpen, Smartphone, User, ClipboardList, Lock, Save, Trash2, AlertTriangle, Frown, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { useAuth } from '../../context/useAuth.js';

const navItems = [
  { icon: <Home size={18} />, label: 'Dashboard',   href: '/cliente' },
  { icon: <Scissors size={18} />, label: 'Barberos',     href: '/cliente/barberos' },
  { icon: <BookOpen size={18} />, label: 'Mi historial', href: '/cliente/historial' },
  { icon: <Smartphone size={18} />, label: 'Telegram',     href: '/cliente/telegram' },
];

export default function Perfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      <Sidebar avatar={<User size={20} />} badge="Cliente" badgeClass="badge-gold" navItems={navItems} />

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
                <User size={40} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, margin: 0 }}>
                    {user?.nombre}
                  </h1>
                  <span className="badge badge-gold">Cliente</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
                  Actualiza tus datos personales
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
              <ClipboardList size={20} /> Información personal
            </div>

            <div className="form-group">
              <label className="form-label">Cédula</label>
              <input className="form-control" defaultValue="1001234567" readOnly
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
                <input className="form-control" defaultValue="García" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input className="form-control" defaultValue="juan@correo.com" readOnly
                style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                No se puede modificar
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-control" defaultValue="3001234567" />
            </div>

            <hr className="divider" />

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

            <button className="btn btn-primary" onClick={handleGuardar}
              style={{ marginTop: 8 }}>
              <Save size={16} /> Guardar cambios
            </button>
            {saveOk && (
              <div className="alert alert-success" style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} /> Perfil actualizado.
              </div>
            )}
          </div>

          <div className="card" style={{ maxWidth: 540, marginTop: 24, borderColor: 'rgba(192,57,43,0.3)' }}>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700,
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--cobre-light)',
            }}>
              <Trash2 size={20} /> Eliminar cuenta
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Una vez eliminada tu cuenta, no podrás recuperarla. Todos tus datos
              (citas, historial y preferencias) serán eliminados permanentemente.
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
