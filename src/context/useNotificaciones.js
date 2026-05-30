import { useContext } from 'react';
import { NotificacionesContext } from './NotificacionesContext';

export function useNotificaciones() {
  return useContext(NotificacionesContext);
}
