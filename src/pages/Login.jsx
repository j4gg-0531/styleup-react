import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js'

export default function Login() {
  const [rol, setRol] = useState('cliente');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!correo || !password) {
      setMsg({ tipo: 'error', texto: 'Completa todos los campos.' });
      return;
    }
    const nombre = correo.split('@')[0];
    login(nombre, rol);
    setMsg({ tipo: 'success', texto: '¡Bienvenido! Redirigiendo...' });
    setTimeout(() => {
      if (rol === 'barbero') navigate('/barbero');
      else if (rol === 'barberia') navigate('/barberia');
      else navigate('/cliente');
    }, 700);
  };

  return (
    <div className="login-page">
      <div className="login-wrap">
        {/* Panel izquierdo decorativo */}
        <div className="login-panel-left">
          <div>
            <div className="login-brand">✂ Style<span style={{ color: 'var(--red-light)' }}>Up</span></div>
            <div className="login-tagline">Sistema de Gestión de Barbería</div>
          </div>
          <div className="login-illo">💈</div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Accede como
            </div>
            {[{ icon: '👤', name: 'Cliente', desc: 'Agenda y gestiona tus citas' },
              { icon: '💈', name: 'Barbero', desc: 'Administra tu agenda y horarios' },
              { icon: '🏪', name: 'Barbería', desc: 'Gestiona tu negocio y equipo' }].map((r) => (
              <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                <div style={{ fontSize: '1.3rem' }}>{r.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — formulario */}
        <div className="login-panel-right">
          <h2 className="login-title">Bienvenido de nuevo</h2>
          <p className="login-subtitle">Inicia sesión para continuar en StyleUp</p>

          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Soy un…
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
              {[
                { val: 'cliente',  icon: '👤', label: 'Cliente' },
                { val: 'barbero',  icon: '💈', label: 'Barbero' },
                { val: 'barberia', icon: '🏪', label: 'Barbería' },
              ].map((r) => (
                <div
                  key={r.val}
                  className={`role-opt ${rol === r.val ? 'selected' : ''}`}
                  onClick={() => setRol(r.val)}
                >
                  <div className="role-opt-icon">{r.icon}</div>
                  <div className="role-opt-label">{r.label}</div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Correo electrónico</label>
              <input type="email" className="form-control" placeholder="ejemplo@correo.com"
                value={correo} onChange={(e) => setCorreo(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input type="password" className="form-control" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {msg && (
              <div className={`alert alert-${msg.tipo === 'error' ? 'error' : 'success'}`}>
                {msg.texto}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }}>
              Iniciar sesión
            </button>
          </form>

          <div className="divider-text">o</div>
          <Link to="/registro" className="btn btn-outline btn-block">
            ¿No tienes cuenta? Regístrate
          </Link>
          <div className="login-footer">
            <Link to="/">← Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  );
}