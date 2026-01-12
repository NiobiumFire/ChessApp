import type { Square, Piece } from "chess.js";

export type Promotion = 'n' | 'b' | 'r' | 'q';

/**
 * Determine if a pawn should promote, and ask user which piece.
 * @returns Promotion piece, undefined if no promotion, or null if canceled.
 */
export function getPromotionPiece(piece : Piece, to : Square) : Promotion | undefined | null {
    const rank = Number(to[1]);
    const isPromotion = piece?.type === 'p' && ((piece.color === 'w' && rank === 8) || (piece.color === 'b' && rank === 1));

    if (!isPromotion) return undefined;

    const input = prompt('Choose promotion piece [\'n\', \'b\', \'r\', \'q\']');
    
    if (!input || !['n','b','r','q'].includes(input)){
      return null;
    }

    return input as Promotion;
  }