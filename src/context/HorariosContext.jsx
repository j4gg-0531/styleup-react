import { createContext, useState, useCallback } from 'react';
import { horariosService } from '../services/horariosService';

export const HorariosContext = createContext(null);

export function HorariosProvider({ children }) {
  const [horarios, setHorarios] = useState([]);

  const cargarHorarios = useCallback(async (cedula) => {
    try {
      const data = await horariosService.getHorariosByCedula(cedula);
      setHorarios(data);
    } catch {
      setHorarios([]);
    }
  }, []);

  const agregarHorario = async (datos, cedula) => {
    try {
      await horariosService.agregarHorario(datos, cedula);
      await cargarHorarios(cedula);
    } catch { /* silent */ }
  };

  const eliminarHorario = async (cedula, dia) => {
    try {
      await horariosService.eliminarHorario(cedula, dia);
      setHorarios((prev) => prev.filter((h) => h.dia !== dia));
    } catch { /* silent */ }
  };

  return (
    <HorariosContext.Provider value={{ horarios, cargarHorarios, agregarHorario, eliminarHorario }}>
      {children}
    </HorariosContext.Provider>
  );
}
