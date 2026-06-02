import { Link } from 'react-router-dom';
import { Scissors, Calendar, User, Building2, Clock } from 'lucide-react';

function RolSection({ titulo, desc, imagen, children, invertido }) {
  return (
    <section style={{
      padding: '80px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: 60,
      flexDirection: invertido ? 'row-reverse' : 'row',
      flexWrap: 'wrap',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        flex: '1 1 300px', maxWidth: 480,
        textAlign: invertido ? 'right' : 'left',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem', fontWeight: 700, marginBottom: 8,
        }}>
          {children}
        </h2>
        <p style={{
          fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7,
          marginBottom: 24,
        }}>
          {desc}
        </p>
        <Link to="/registro" className="btn btn-primary">
          {titulo}
        </Link>
      </div>

      <div style={{
        flex: '1 1 300px', maxWidth: 420,
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        borderRadius: 16, padding: 24,
        boxShadow: 'var(--shadow-md)',
      }}>
        {imagen}
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Scissors size={20} /> Style<span style={{ color: 'var(--cobre-light)' }}>Up</span>
        </div>
        <div className="navbar-links">
          <Link to="/login" className="btn btn-outline btn-sm">Iniciar sesión</Link>
          <Link to="/registro" className="btn btn-primary btn-sm">Crear cuenta</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        padding: '60px 80px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 60, flexWrap: 'wrap',
        minHeight: '70vh',
        background:
          'radial-gradient(ellipse at 20% 50%, rgba(201,123,58,0.1) 0%, transparent 60%),' +
          'radial-gradient(ellipse at 80% 20%, rgba(230,184,106,0.06) 0%, transparent 50%),' +
          'var(--bg)',
      }}>
        <div style={{ flex: '1 1 300px', maxWidth: 520 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
            fontWeight: 900, lineHeight: 1.08, marginBottom: 16,
          }}>
            La plataforma que une a{' '}
            <span style={{ color: 'var(--cobre-light)' }}>clientes</span>,{' '}
            <span style={{ color: 'var(--gold)' }}>barberos</span> y{' '}
            <span style={{ color: 'var(--cobre)' }}>barberías</span>.
          </h1>
          <p style={{
            fontSize: '1.05rem', color: 'var(--muted)',
            lineHeight: 1.7, marginBottom: 28, maxWidth: 440,
          }}>
            Cada rol tiene su propia vista con las herramientas que necesita.
            Nada más, nada menos.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/registro" className="btn btn-primary btn-lg">Comenzar gratis</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Iniciar sesión</Link>
          </div>
        </div>

        <div style={{
          flex: '1 1 280px', maxWidth: 380,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {[
            { label: 'Clientes activos', value: '12', color: '#3498db', icon: <User size={20} /> },
            { label: 'Barberos disponibles', value: '8', color: 'var(--cobre-light)', icon: <Scissors size={20} /> },
            { label: 'Barberías registradas', value: '3', color: 'var(--gold)', icon: <Building2 size={20} /> },
          ].map(({ label, value, color, icon }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 20px',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${color}15`,
                border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', color,
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Clientes ── */}
      <RolSection
        titulo="Registrarse como cliente"
        desc="Reserva tus citas en segundos desde cualquier lugar. Sin llamadas, sin esperar confirmación. Solo eliges barbero, servicio y horario."
        invertido={false}
        imagen={
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1rem', fontWeight: 700, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Calendar size={16} style={{ color: '#3498db' }} />
              Agendar cita
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Barbero', value: 'Juan Pérez' },
                { label: 'Servicio', value: 'Corte a tijera' },
                { label: 'Fecha', value: 'Mañana, 10:00 AM' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: 8,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  fontSize: '0.82rem',
                }}>
                  <span style={{ color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 12, padding: '8px 12px', borderRadius: 8,
              background: 'rgba(46,204,113,0.1)',
              border: '1px solid rgba(46,204,113,0.2)',
              color: '#2ecc71', fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              ✓ Cita confirmada
            </div>
          </div>
        }>
        Clientes
      </RolSection>

      {/* ── Barbero ── */}
      <RolSection
        titulo="Registrarse como barbero"
        desc="Organiza tu agenda, configura tus servicios y precios, y recibe notificaciones de tus próximas citas directamente en Telegram."
        invertido={true}
        imagen={
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1rem', fontWeight: 700, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Clock size={16} style={{ color: 'var(--cobre-light)' }} />
              Mis horarios — hoy
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { time: '9:00 AM', client: '—', state: 'libre' },
                { time: '10:00 AM', client: 'Juan Pérez', state: 'ocupado' },
                { time: '11:30 AM', client: 'Carlos López', state: 'ocupado' },
                { time: '1:00 PM', client: '—', state: 'libre' },
              ].map(({ time, client, state }) => (
                <div key={time} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  fontSize: '0.82rem',
                }}>
                  <span style={{ fontWeight: 600, width: 70 }}>{time}</span>
                  <span style={{
                    flex: 1, color: state === 'libre' ? 'var(--muted)' : 'var(--text)',
                  }}>
                    {client}
                  </span>
                  <span style={{
                    fontSize: '0.72rem', padding: '2px 8px', borderRadius: 6,
                    background: state === 'libre'
                      ? 'rgba(46,204,113,0.1)'
                      : 'rgba(230,184,106,0.1)',
                    color: state === 'libre' ? '#2ecc71' : 'var(--gold)',
                    fontWeight: 600,
                  }}>
                    {state === 'libre' ? 'Disponible' : 'Ocupado'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        }>
        Barberos
      </RolSection>

      {/* ── Barbería ── */}
      <RolSection
        titulo="Registrar mi barbería"
        desc="Administra tu equipo de barberos, publica ofertas de trabajo, controla los horarios de todos y revisa las métricas de tu negocio."
        invertido={false}
        imagen={
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1rem', fontWeight: 700, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Building2 size={16} style={{ color: 'var(--gold)' }} />
              BarberShop Style — Resumen
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16,
            }}>
              {[
                { num: '3', label: 'barberos', color: 'var(--cobre-light)' },
                { num: '2', label: 'ofertas', color: 'var(--gold)' },
              ].map(({ num, label, color }) => (
                <div key={label} style={{
                  padding: '12px 8px', borderRadius: 10,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '1.4rem', fontWeight: 900, color, lineHeight: 1,
                  }}>
                    {num}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 4 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              padding: 12, borderRadius: 10,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              fontSize: '0.82rem',
            }}>
              <div style={{ color: 'var(--muted)', marginBottom: 8, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Citas de la semana
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', marginBottom: 8, overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, var(--cobre), var(--gold))' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '0.72rem' }}>
                <span>Lun — Vie</span>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>65% ocupado</span>
              </div>
            </div>
          </div>
        }>
        Barberías
      </RolSection>

      {/* ── CTA final ── */}
      <section style={{
        padding: '60px 80px', textAlign: 'center',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem', fontWeight: 900, marginBottom: 12,
        }}>
          ¿Listo para probarlo?
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: '1rem' }}>
          Crea tu cuenta gratis. No necesitas tarjeta.
        </p>
        <Link to="/registro" className="btn btn-primary btn-lg">Comenzar gratis</Link>
      </section>

      <footer>
        <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Scissors size={18} /> StyleUp
        </div>
        <div>Sistema de Gestión de Barbería · Prototipo Web 2025</div>
      </footer>
    </>
  );
}
