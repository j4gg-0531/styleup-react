import { createContext, useState, useCallback } from 'react';
import { notificacionesService } from '../services/notificacionesService';

export const NotificacionesContext = createContext(null);

export function NotificacionesProvider({ children }) {
  const [notificaciones, setNotificaciones] = useState([]);

  const cargarNotificaciones = useCallback(async (rol, nombre) => {
    const data = await notificacionesService.getByUsuario(rol, nombre);
    setNotificaciones(data);
  }, []);

  const crearNotificacion = async (datos) => {
    const nueva = await notificacionesService.crear(datos);
    setNotificaciones((prev) => [nueva, ...prev]);
    return nueva;
  };

  const marcarLeida = async (id) => {
    await notificacionesService.marcarLeida(id);
    setNotificaciones((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  };

  const marcarTodasLeidas = async (rol, nombre) => {
    await notificacionesService.marcarTodasLeidas(rol, nombre);
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
