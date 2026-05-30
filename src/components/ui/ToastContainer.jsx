import { useContext, useState, useEffect } from 'react';
import { ToastContext } from '../../context/ToastContext.jsx';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ESTILOS = {
  success: { bg: 'rgba(46,204,113,0.12)', border: '#2ecc71', icon: '#2ecc71', progress: '#2ecc71' },
  error:   { bg: 'rgba(231,76,60,0.12)',   border: '#e74c3c', icon: '#e74c3c', progress: '#e74c3c' },
  info:    { bg: 'rgba(52,152,219,0.12)',  border: '#3498db', icon: '#3498db', progress: '#3498db' },
  warning: { bg: 'rgba(241,196,15,0.12)',  border: '#f1c40f', icon: '#f1c40f', progress: '#f1c40f' },
};

const ICONOS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

function ToastItem({ t, onClose }) {
  const estilo = ESTILOS[t.tipo] || ESTILOS.info;
  const Icono = ICONOS[t.tipo] || Info;
  const [progreso, setProgreso] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const dur = 3500;
    const id = setInterval(() => {
      const pct = Math.max(0, 100 - ((Date.now() - start) / dur) * 100);
      setProgreso(pct);
      if (pct <= 0) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 14px', borderRadius: 10,
        background: estilo.bg,
        border: '1px solid',
        borderColor: estilo.border,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        minWidth: 300, maxWidth: 420,
        position: 'relative', overflow: 'hidden',
        animation: 'toastSlideIn 0.3s ease-out',
      }}
    >
      <Icono size={18} style={{ color: estilo.icon, flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, fontSize: '0.85rem', lineHeight: 1.4, color: 'var(--text)' }}>
        {t.mensaje}
      </div>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 2, color: 'var(--muted)', flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, height: 3,
          width: `${progreso}%`,
          background: estilo.progress,
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, quitar } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastFadeOut {
          from { transform: translateX(0); opacity: 1; }
          to   { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          display: 'flex', flexDirection: 'column', gap: 8,
          pointerEvents: 'auto',
        }}
      >
        {toasts.slice(-3).map((t) => (
          <ToastItem key={t.id} t={t} onClose={() => quitar(t.id)} />
        ))}
      </div>
    </>
  );
}
