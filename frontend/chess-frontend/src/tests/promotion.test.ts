import { describe, it, expect, afterEach, vi } from 'vitest';
import { getPromotionPiece } from '@chess/promotion';
import type { Piece } from "chess.js";

describe('getPromotionPiece', () => {
  const originalPrompt = globalThis.prompt;

  afterEach(() => {
    globalThis.prompt = originalPrompt;
  });

  it('returns undefined if piece is not a pawn', () => {
    const piece = { type: 'n', color: 'w' } as Piece;
    expect(getPromotionPiece(piece, 'e8')).toBeUndefined();
  });

  it('returns undefined if white pawn not on promotion rank', () => {
    const piece = { type: 'p', color: 'w' } as Piece;
    expect(getPromotionPiece(piece, 'e7')).toBeUndefined();
  });

  it('returns null if user cancels', () => {
    globalThis.prompt = vi.fn(() => null);
    const piece = { type: 'p', color: 'w' } as Piece;
    expect(getPromotionPiece(piece, 'e8')).toBeNull();
  });

  it('returns null if user inputs invalid piece', () => {
    globalThis.prompt = vi.fn(() => 'k');
    const piece = { type: 'p', color: 'w' } as Piece;
    expect(getPromotionPiece(piece, 'e8')).toBeNull();
  });

  it('works for white pawn promotion', () => {
    globalThis.prompt = vi.fn(() => 'r');
    const piece = { type: 'p', color: 'w' } as Piece;
    expect(getPromotionPiece(piece, 'e8')).toBe('r');
  });

  it('works for black pawn promotion', () => {
    globalThis.prompt = vi.fn(() => 'n');
    const piece = { type: 'p', color: 'b' } as Piece;
    expect(getPromotionPiece(piece, 'a1')).toBe('n');
  });
});
