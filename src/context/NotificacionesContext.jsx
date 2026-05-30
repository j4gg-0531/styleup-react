import { createContext, useState, useCallback } from 'react';
import { notificacionesService } from '../services/notificacionesService';

export const NotificacionesContext = createContext(null);

export function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);

  const cargarNotificaciones = useCallback((rol, nombre) => {
    const data = notificacionesService.getByUsuario(rol, nombre);
    setNotificaciones(data);
  }, []);

  const crearNotificacion = (datos) => {
    const nueva = notificacionesService.crear(datos);
    setNotificaciones((prev) => [nueva, ...prev]);
    return nueva;
  };

  const marcarLeida = (id) => {
    notificacionesService.marcarLeida(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const marcarTodasLeidas = (rol, nombre) => {
    notificacionesService.marcarTodasLeidas(rol, nombre);
    setNotificaciones((prev) =>
      prev.map((n) =>
        n.paraRol === rol && n.paraNombre === nombre ? { ...n, leida: true } : n
      )
    );
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        noLeidas,
        cargarNotificaciones,
        crearNotificacion,
        marcarLeida,
        marcarTodasLeidas,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  );
}
