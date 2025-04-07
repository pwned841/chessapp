/**
 * Configuration et utilitaires pour les composants d'échecs
 */

import { Chess } from 'chess.js';

// Initialisation et validation des positions FEN
export function validateAndCreateChess(fen?: string): Chess {
  const chess = new Chess();
  
  if (!fen || fen === 'start' || fen === 'root') {
    return chess;
  }
  
  try {
    chess.load(fen);
    return chess;
  } catch (error) {
    console.error('Position FEN invalide:', error);
    return new Chess(); // Position par défaut
  }
}

// Position initiale standard
export const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

// Générateur d'identifiants uniques pour les éléments d'échecs
export function generateUniqueId(prefix: string = 'chess'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}
