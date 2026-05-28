import { useState, useEffect } from 'react';

const getTheme = () => localStorage.getItem('styleup_theme') || 'dark';

export default function ThemeToggle() {
  const [tema, setTema] = useState(getTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    localStorage.setItem('styleup_theme', tema);
  }, [tema]);

  const toggleTema = () => setTema((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <button
      onClick={toggleTema}
      className="theme-toggle"
      aria-label={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      {tema === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
