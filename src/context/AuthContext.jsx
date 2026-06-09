import { createContext, useState } from 'react';

// Creamos el "contenedor" del estado de sesión
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Intentamos recuperar la sesión guardada (igual que sessionStorage del original)
  const stored = sessionStorage.getItem('su_user');
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

  const login = (nombre, rol, extras = {}) => {
    const u = { nombre, rol, token: extras.token || null, barberiaId: extras.barberiaId || null };
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

// Hook personalizado para usar la sesión desde cualquier componente
