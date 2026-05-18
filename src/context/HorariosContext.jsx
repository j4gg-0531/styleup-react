// src/context/HorariosContext.jsx
import { createContext, useState, useCallback } from 'react';
import { horariosService } from '../services/horariosService';

export const HorariosContext = createContext(null);

export function HorariosProvider({ children }) {
  const [horarios, setHorarios] = useState([]);

  // Carga los horarios de un barbero
  const cargarHorarios = useCallback((barberoNombre) => {
    const data = horariosService.getHorariosByBarbero(barberoNombre);
    setHorarios(data);
  }, []);

  // Agrega un nuevo bloque de horario
  const agregarHorario = (datos) => {
    const nuevo = horariosService.agregarHorario(datos);
    setHorarios((prev) => [...prev, nuevo]);
    return nuevo;
  };

  // Elimina un bloque de horario
  const eliminarHorario = (id) => {
    horariosService.eliminarHorario(id);
    setHorarios((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <HorariosContext.Provider value={{ horarios, cargarHorarios, agregarHorario, eliminarHorario }}>
      {children}
    </HorariosContext.Provider>
  );
}