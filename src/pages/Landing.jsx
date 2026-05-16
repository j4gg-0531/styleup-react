import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <span>✂</span> Style<span style={{ color: 'var(--red-light)' }}>Up</span>
        </div>
        <div className="navbar-links">
          <Link to="/login" className="btn btn-outline btn-sm">Iniciar sesión</Link>
          <Link to="/registro" className="btn btn-primary btn-sm">Crear cuenta</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-eyebrow">✂ Sistema de Barbería</div>
            <h1 className="hero-title">
              Gestiona tu barbería<br />
              con <span className="accent">estilo</span>
            </h1>
            <p className="hero-desc">
              StyleUp centraliza el agendamiento de citas, la gestión de barberos,
              horarios y recordatorios automáticos en una sola plataforma moderna.
            </p>
            <div className="hero-cta">
              <Link to="/registro" className="btn btn-primary btn-lg">Comenzar gratis</Link>
              <Link to="/login" className="btn btn-outline btn-lg">Iniciar sesión</Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="deco-card">
              <div className="deco-card-top">
                <div className="deco-avatar">💈</div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nueva cita</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>hace 2 min</div>
                </div>
                <span className="badge badge-green" style={{ marginLeft: 'auto' }}>Confirmada</span>
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--muted)' }}>
                📅 Mañana · 10:00 AM<br />✂ Corte a tijera · Juan Pérez
              </div>
            </div>
            <div className="deco-card">
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                Panel del barbero
              </div>
              <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
                {[['8','citas hoy','var(--gold)'],['3','pendientes','var(--red-light)'],['5','completadas','#2ecc71']].map(([n,l,c]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.6rem', color: c }}>{n}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-header">
          <h2 style={{ fontSize: '2rem' }}>¿Por qué StyleUp?</h2>
          <div className="gold-line" style={{ margin: '12px auto' }} />
          <p style={{ color: 'var(--muted)', maxWidth: 520, margin: '0 auto' }}>
            Todo lo que necesita una barbería moderna en un solo lugar.
          </p>
        </div>
        <div className="features-grid">
          {[
            { icon: '📅', title: 'Agendamiento inteligente', desc: 'Wizard paso a paso para reservar citas sin conflictos de horario ni doble ocupación.' },
            { icon: '🔔', title: 'Recordatorios Telegram', desc: 'Notificaciones automáticas vía Telegram antes de cada cita para reducir inasistencias.' },
            { icon: '📊', title: 'Reportes y métricas', desc: 'Dashboard con estadísticas de barberos más solicitados y servicios más demandados.' },
          ].map((f) => (
            <div key={f.title} className="feature-item">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="roles">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem' }}>Dos roles, una plataforma</h2>
          <div className="gold-line" style={{ margin: '12px auto' }} />
        </div>
        <div className="roles-grid">
          {[
            {
              cls: 'client', icon: '👤', title: 'Cliente', btnCls: 'btn-outline',
              desc: 'Agenda citas, consulta tu historial y gestiona tu perfil desde cualquier lugar.',
              perks: ['Reservar citas en pocos pasos', 'Ver historial completo', 'Recordatorios por Telegram', 'Actualizar perfil'],
            },
            {
              cls: 'barber', icon: '💈', title: 'Barbero', btnCls: 'btn-primary',
              desc: 'Configura tu disponibilidad, revisa tus citas del día y gestiona tu perfil profesional.',
              perks: ['Configurar horarios', 'Ver citas por fecha', 'Gestionar especialidad', 'Vincular Telegram'],
            },
          ].map((r) => (
            <div key={r.title} className={`role-card ${r.cls}`}>
              <div className="role-icon">{r.icon}</div>
              <div className="role-title">{r.title}</div>
              <div className="role-desc">{r.desc}</div>
              <ul className="role-perks">
                {r.perks.map((p) => <li key={p}>{p}</li>)}
              </ul>
              <Link to="/registro" className={`btn ${r.btnCls} btn-sm`}>
                Registrarse como {r.title.toLowerCase()}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer>
        <div className="footer-brand">✂ StyleUp</div>
        <div>Sistema de Gestión de Barbería · Prototipo Web 2025</div>
      </footer>
    </>
  );
}