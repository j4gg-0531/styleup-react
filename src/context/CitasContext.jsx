// src/context/CitasContext.jsx
// Estado global de citas, disponible en toda la app.

import { createContext, useState, useCallback } from 'react';
import { citasService } from '../services/citasService';

export const CitasContext = createContext(null);

export function CitasProvider({ children }) {
  const [citas, setCitas] = useState([]);

  // Carga las citas de un cliente desde el servicio
  // useCallback evita que la función se recree en cada render
  const cargarCitas = useCallback(async (clienteNombre) => {
    const data = await citasService.getCitasByCliente(clienteNombre);
    setCitas(data);
  }, []);

  // Agrega una nueva cita y actualiza el estado local
  const agregarCita = async (datosCita) => {
    const nueva = await citasService.agregarCita(datosCita);
    setCitas((prev) => [...prev, nueva]);
    return nueva;
  };

  // Cancela una cita y actualiza el estado local
  const cancelarCita = async (citaId) => {
    await citasService.cancelarCita(citaId);
    setCitas((prev) =>
      prev.map((c) =>
        c.id === citaId ? { ...c, estado: 'cancelada' } : c
      )
    );
  };

  return (
    <CitasContext.Provider value={{ citas, cargarCitas, agregarCita, cancelarCita }}>
      {children}
    </CitasContext.Provider>
  );
}