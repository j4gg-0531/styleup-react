// src/context/useCitas.js
// Hook para usar el contexto de citas fácilmente desde cualquier componente

import { useContext } from 'react';
import { CitasContext } from './CitasContext';

export function useCitas() {
  return useContext(CitasContext);
}