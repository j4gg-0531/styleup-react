// src/context/useHorarios.js
import { useContext } from 'react';
import { HorariosContext } from './HorariosContext';

export function useHorarios() {
  return useContext(HorariosContext);
}