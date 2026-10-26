import { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const quitar = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback((tipo, mensaje, duracion = 3500) => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, tipo, mensaje }]);
    setTimeout(() => quitar(id), duracion);
  }, [quitar]);

  const toast = {
    success: (msg, d) => mostrar('success', msg, d),
    error:   (msg, d) => mostrar('error', msg, d),
    info:    (msg, d) => mostrar('info', msg, d),
    warning: (msg, d) => mostrar('warning', msg, d),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, quitar }}>
      {children}
    </ToastContext.Provider>
  );
}
