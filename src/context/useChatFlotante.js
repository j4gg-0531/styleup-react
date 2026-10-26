// src/context/useChatFlotante.js
import { useContext } from 'react';
import { ChatFlotanteContext } from './ChatFlotanteContext';

export function useChatFlotante() {
  return useContext(ChatFlotanteContext);
}