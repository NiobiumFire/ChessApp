import { describe, it, expect, afterEach, vi } from 'vitest';
import { getPromotionPieceFromPrompt } from '@chess/promotion';

describe('getPromotionPiece', () => {
  const originalPrompt = globalThis.prompt;

  afterEach(() => {
    globalThis.prompt = originalPrompt;
  });

  it('returns null if user cancels', () => {
    globalThis.prompt = vi.fn(() => null);
    expect(getPromotionPieceFromPrompt()).toBeUndefined();
  });

  it('returns null if user inputs invalid piece', () => {
    globalThis.prompt = vi.fn(() => 'k');
    expect(getPromotionPieceFromPrompt()).toBeUndefined();
  });

  it('returns \'r\' for captial input with spaces', () => {
    globalThis.prompt = vi.fn(() => ' R ');
    expect(getPromotionPieceFromPrompt()).toBe('r');
  });
});
