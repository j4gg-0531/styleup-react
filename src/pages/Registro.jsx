import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Scissors, Building2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth.js'
import { api } from '../services/api.js';
import SelectorUbicacion from '../components/SelectorUbicacion.jsx';
import ThemeToggle from '../components/ui/ThemeToggle.jsx';
import 'leaflet/dist/leaflet.css';

export default function Registro() {
  const [rol, setRol] = useState('cliente');
  const [form, setForm] = useState({ nombre:'', apellido:'', cedula:'', correo:'', telefono:'', password:'', password2:'', especialidad:'', direccion:'', ciudad:'', nombreBarberia:'', nit:'', descripcion:'', capacidadBarberos: '', lat: null, lng: null });
  const [msg, setMsg] = useState(null);
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) { setMsg({ tipo: 'error', texto: 'Las contraseñas no coinciden.' }); return; }
    if (form.password.length < 6) { setMsg({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres.' }); return; }
    setCargando(true);
    setMsg(null);

    try {
      const payload = {
        correo: form.correo,
        contrasena: form.password,
      };

      if (rol === 'cliente') {
        payload.cedula_cliente = form.cedula;
        payload.nombre = form.nombre;
        payload.apellido = form.apellido;
        payload.telefono = form.telefono;
      } else if (rol === 'barbero') {
        payload.cedula_barbero = form.cedula;
        payload.nombre = form.nombre;
        payload.apellido = form.apellido;
        payload.telefono = form.telefono;
        payload.direccion = form.direccion;
        payload.ciudad = form.ciudad;
        if (form.especialidad) payload.id_especialidad = parseInt(form.especialidad.replace('E', ''), 10);
      } else if (rol === 'barberia') {
        payload.nombre = form.nombreBarberia;
        payload.nombre_dueno = form.nombre;
        payload.direccion = form.direccion;
        payload.ciudad = form.ciudad;
        payload.telefono = form.telefono;
        payload.nit = form.nit;
        payload.descripcion = form.descripcion;
        payload.num_trabajadores = parseInt(form.capacidadBarberos, 10) || 1;
      }

      const data = await api.post(`/auth/registro/${rol}`, payload);
      const extras = {};
      if (data.token) extras.token = data.token;
      if (data.cedula) extras.cedula = data.cedula;
      if (data.barberiaId) extras.barberiaId = data.barberiaId;
      login(data.nombre || form.nombre, rol, extras);
      setMsg({ tipo: 'success', texto: '¡Cuenta creada! Redirigiendo...' });
      setTimeout(() => navigate(rol === 'barbero' ? '/barbero' : rol === 'barberia' ? '/barberia' : '/cliente'), 800);
    } catch (err) {
      setMsg({ tipo: 'error', texto: err.message?.includes('Unique constraint')
        ? 'El correo o cédula ya están registrados.'
        : 'Error al crear la cuenta. Intenta de nuevo.' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="registro-page">
      <ThemeToggle variant="floating" />
      <div className="reg-wrap">
        <div className="reg-header">
          <div className="reg-logo" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><Scissors size={22} /> Style<span style={{ color: 'var(--cobre-light)' }}>Up</span></div>
          <h2 style={{ fontSize: '1.7rem', marginTop: 8 }}>Crea tu cuenta</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>Únete a StyleUp y gestiona tus citas fácilmente</p>
        </div>

        <div className="reg-card">
          <form onSubmit={handleSubmit}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12 }}>Tipo de cuenta</div>
            <div className="rol-tabs" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              {[
                { val: 'cliente',  icon: <User size={24} />, name: 'Cliente',  desc: 'Quiero agendar citas' },
                { val: 'barbero',  icon: <Scissors size={24} />, name: 'Barbero',  desc: 'Quiero gestionar mi agenda' },
                { val: 'barberia', icon: <Building2 size={24} />, name: 'Barbería', desc: 'Quiero gestionar mi negocio' },
              ].map((r) => (
                <div
                  key={r.val}
                  className={`rol-tab ${rol === r.val ? 'active' : ''}`}
                  onClick={() => setRol(r.val)}
                >
                  <div className="rol-tab-icon">{r.icon}</div>
                  <div className="rol-tab-name">{r.name}</div>
                  <div className="rol-tab-desc">{r.desc}</div>
                </div>
              ))}
            </div>

            <div className="section-title">Datos personales</div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Nombres *</label><input className="form-control" placeholder="Ej: Juan" value={form.nombre} onChange={set('nombre')} required /></div>
              <div className="form-group"><label className="form-label">Apellidos *</label><input className="form-control" placeholder="Ej: Pérez" value={form.apellido} onChange={set('apellido')} required /></div>
            </div>
            <div className="form-group"><label className="form-label">Cédula *</label><input className="form-control" placeholder="Ej: 1234567890" value={form.cedula} onChange={set('cedula')} required /></div>
            <div className="form-group"><label className="form-label">Correo electrónico *</label><input type="email" className="form-control" placeholder="ejemplo@correo.com" value={form.correo} onChange={set('correo')} required /></div>
            <div className="form-group"><label className="form-label">Teléfono *</label><input className="form-control" placeholder="Ej: 3001234567" value={form.telefono} onChange={set('telefono')} required /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Contraseña *</label><input type="password" className="form-control" placeholder="Mín. 6 caracteres" value={form.password} onChange={set('password')} required /></div>
              <div className="form-group"><label className="form-label">Confirmar *</label><input type="password" className="form-control" placeholder="Repite la contraseña" value={form.password2} onChange={set('password2')} required /></div>
            </div>

            {rol === 'barbero' && (
              <>
                <div className="section-title">Datos profesionales</div>
                <div className="form-group">
                  <label className="form-label">Especialidad *</label>
                  <select className="form-control" value={form.especialidad} onChange={set('especialidad')}>
                    <option value="">Selecciona una especialidad</option>
                    <option value="E001">Corte a tijera (30 min)</option>
                    <option value="E002">Degradado / Fade (25 min)</option>
                    <option value="E003">Undercut (35 min)</option>
                    <option value="E004">Afeitado con navaja (20 min)</option>
                    <option value="E006">Corte + Barba (45 min)</option>
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label className="form-label">Dirección</label><input className="form-control" placeholder="Calle 10 #5-32" value={form.direccion} onChange={set('direccion')} /></div>
                  <div className="form-group"><label className="form-label">Ciudad</label><input className="form-control" placeholder="Ej: Valledupar" value={form.ciudad} onChange={set('ciudad')} /></div>
                </div>
              </>
            )}

            {rol === 'barberia' && (
              <>
                <div className="section-title">Datos del negocio</div>
                <div className="form-group">
                  <label className="form-label">Nombre de la barbería *</label>
                  <input className="form-control" placeholder="Ej: BarberShop Style" value={form.nombreBarberia} onChange={set('nombreBarberia')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">NIT *</label>
                  <input className="form-control" placeholder="Ej: 900123456-1" value={form.nit} onChange={set('nit')} required />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Dirección *</label>
                    <input className="form-control" placeholder="Calle 10 #5-32" value={form.direccion} onChange={set('direccion')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ciudad *</label>
                    <input className="form-control" placeholder="Ej: Valledupar" value={form.ciudad} onChange={set('ciudad')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <input className="form-control" placeholder="Breve descripción de tu barbería" value={form.descripcion} onChange={set('descripcion')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Capacidad máxima de barberos *</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Ej: 5"
                    min="1"
                    max="20"
                    value={form.capacidadBarberos}
                    onChange={set('capacidadBarberos')}
                    required
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>
                    Número máximo de barberos que pueden trabajar en tu barbería
                  </div>
                </div>
                {/* Selector de ubicación — solo para barbería */}
                <div className="form-group" style={{ marginTop: 8 }}>
                  <label className="form-label">
                    Ubicación en el mapa *
                    <span style={{
                      color: 'var(--muted)', fontWeight: 400,
                      marginLeft: 6, textTransform: 'none', fontSize: '0.75rem',
                    }}>
                      (los clientes verán tu barbería aquí)
                    </span>
                  </label>
                  <SelectorUbicacion
                    valor={form.lat ? { lat: form.lat, lng: form.lng } : null}
                    onChange={(coords) => setForm({
                      ...form,
                      lat: coords?.lat ?? null,
                      lng: coords?.lng ?? null,
                    })}
                    colorPin="#e6b86a"
                    altura={260}
                  />
                </div>
              </>
            )}

            {msg && <div className={`alert alert-${msg.tipo === 'error' ? 'error' : 'success'}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{msg.tipo === 'success' && <CheckCircle size={16} />}{msg.texto}</div>}
            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: 8 }} disabled={cargando}>
              {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.87rem', color: 'var(--muted)' }}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          {' · '}<Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={14} /> Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}