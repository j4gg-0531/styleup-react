import { createContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { serviciosService } from '../services/serviciosService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const stored = sessionStorage.getItem('su_user');
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

  useEffect(() => {
    serviciosService.init();
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('su_user');
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (!parsed?.token) return;
    api.get('/especialidades').catch(() => {
      sessionStorage.removeItem('su_user');
      setUser(null);
    });
  }, []);

  const login = (nombre, rol, extras = {}) => {
    const u = { nombre, rol, token: extras.token || null, barberiaId: extras.barberiaId || null, cedula: extras.cedula || null };
    sessionStorage.setItem('su_user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    sessionStorage.removeItem('su_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
