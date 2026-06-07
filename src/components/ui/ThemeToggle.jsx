import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

// ── Hook ──
export function useTheme() {
  const [tema, setTema] = useState(() => localStorage.getItem('styleup_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('styleup_theme', tema);
  }, [tema]);

  const toggleTema = () => setTema((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return { tema, toggleTema };
}

// ── Componente visual con variant ──
export default function ThemeToggle({ variant = 'floating' }) {
  const { tema, toggleTema } = useTheme();

  const floatingStyle = {
    position: 'fixed',
    top: 20,
    right: 24,
    zIndex: 999,
    width: 40, height: 40,
    borderRadius: '50%',
    border: '1.5px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-md)',
    transition: 'all var(--transition)',
  };

  const navbarStyle = {
    background: 'transparent',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    padding: 8,
    color: 'var(--text)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition)',
  };

  return (
    <button
      onClick={toggleTema}
      style={variant === 'floating' ? floatingStyle : navbarStyle}
      aria-label={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {tema === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
