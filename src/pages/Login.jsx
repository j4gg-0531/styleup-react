import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Scissors, Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/useAuth.js'
import { api } from '../services/api.js';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';

export default function Login() {
  const [rol, setRol] = useState('cliente');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo || !password) {
      setMsg({ tipo: 'error', texto: 'Completa todos los campos.' });
      return;
    }
    setCargando(true);
    setMsg(null);

    try {
      const data = await api.post(`/auth/login/${rol}`, { correo, contrasena: password });

      const extras = {};
      if (data.token) extras.token = data.token;
      if (data.barberiaId) extras.barberiaId = data.barberiaId;
      if (data.cedula) extras.cedula = data.cedula;

      login(data.nombre, rol, extras);

      setMsg({ tipo: 'success', texto: '¡Bienvenido! Redirigiendo...' });
      setTimeout(() => {
        if (rol === 'barbero') navigate('/barbero');
        else if (rol === 'barberia') navigate('/barberia');
        else navigate('/cliente');
      }, 700);
    } catch (err) {
      setMsg({ tipo: 'error', texto: 'Correo o contraseña incorrectos.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <ThemeToggle variant="floating" />
      <div className="login-wrap">
        <div className="login-panel-right">
          <div className="login-brand" style={{ textAlign: 'center', marginBottom: 10 }}>
            <Scissors size={22} /> Style<span style={{ color: 'var(--cobre-light)' }}>Up</span>
          </div>
          <h2 className="login-title">Bienvenido de nuevo</h2>
          <p className="login-subtitle">Inicia sesión para continuar en StyleUp</p>

          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
              Soy un…
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
              {[
                { val: 'cliente',  icon: <User size={20} />, label: 'Cliente' },
                { val: 'barbero',  icon: <Scissors size={20} />, label: 'Barbero' },
                { val: 'barberia', icon: <Building2 size={20} />, label: 'Barbería' },
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

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }} disabled={cargando}>
              {cargando ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="divider-text">o</div>
          <Link to="/registro" className="btn btn-outline btn-block">
            ¿No tienes cuenta? Regístrate
          </Link>
          <div className="login-footer">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={14} /> Volver al inicio</Link>
          </div>
        </div>
      </div>
    </div>
  );
}