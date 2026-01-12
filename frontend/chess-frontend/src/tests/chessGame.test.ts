import { describe, it, expect, vi } from 'vitest';
import { getPromotionPiece } from '@chess/promotion';
import { ChessGame } from '@chess/chessGame';

// Mock the promotion function
vi.mock('@chess/promotion', () => ({
  getPromotionPiece: vi.fn(),
}));

const mockedGetPromotionPiece = getPromotionPiece as unknown as ReturnType<typeof vi.fn>;

describe('ChessGame.move', () => {
  let game: ChessGame;

  it('allows normal legal move', () => {
    game = new ChessGame();
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('e2', 'e4'); // make the move 1. e4
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('In Progress');
  });

  it('prevents a move from an empty square', () => {
    game = new ChessGame();
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('a3', 'a4'); // no piece there
    expect(result.success).toBe(false);
  });

  it('prevents invalid move', () => {
    game = new ChessGame();
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('a2', 'a5'); // pawn cannot move 3 squares
    expect(result.success).toBe(false);
  });

  it('handles capture', () => {
    game = new ChessGame('rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2');
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('d4', 'e5'); // pawn captures
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnbqkbnr/pppp1ppp/8/4P3/8/8/PPP1PPPP/RNBQKBNR b KQkq - 0 2');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('In Progress');
  });

  it('handles check', () => {
    game = new ChessGame('rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('d1', 'h5'); // queen checks king
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnbqkbnr/ppppp1pp/8/5p1Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2');
    expect(result.checkSquare).toBe('e8');
    expect(result.status).toBe('In Progress');
  });

  it('handles checkmate by white', () => {
    game = new ChessGame('r1bqkbnr/ppp2ppp/2np4/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 2 4');
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('h5', 'f7');
    expect(result.success).toBe(true);
    expect(result.fen).toBe('r1bqkbnr/ppp2Qpp/2np4/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4');
    expect(result.checkSquare).toBe('e8');
    expect(result.status).toBe('White Wins');
  });

  it('handles checkmate by black', () => {
    game = new ChessGame('rnbqkbnr/pppp1ppp/8/4p3/5PP1/8/PPPPP2P/RNBQKBNR b KQkq - 0 2');
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('d8', 'h4');
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    expect(result.checkSquare).toBe('e1');
    expect(result.status).toBe('Black Wins');
  });

  it('handles stalemate', () => {
    game = new ChessGame('k7/8/1K1Q4/8/8/8/8/8 w - - 3 3');
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('d6', 'c7');
    expect(result.success).toBe(true);
    expect(result.fen).toBe('k7/2Q5/1K6/8/8/8/8/8 b - - 4 3');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('Draw (Stalemate)');
  });

  it('handles repetition', () => {
    game = new ChessGame('k7/8/1K6/3Q4/8/8/8/8 b - - 0 1');
    mockedGetPromotionPiece.mockReturnValue(undefined);

    const repeatCycle = () => {
      game.move('a8', 'b8');
      game.move('d5', 'e6');
      game.move('b8', 'a8');
      return game.move('e6', 'd5');
    };

    repeatCycle();
    const result = repeatCycle();

    expect(result.success).toBe(true);
    expect(result.fen).toBe('k7/8/1K6/3Q4/8/8/8/8 b - - 8 5');
    expect(result.checkSquare).toBe('a8');
    expect(result.status).toBe('Draw (Threefold Repetition)');
  });

  it('handles insufficient material', () => {
    game = new ChessGame('Qk6/8/1K6/8/8/8/8/8 b - - 0 1');
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('b8', 'a8');
    expect(result.success).toBe(true);
    expect(result.fen).toBe('k7/8/1K6/8/8/8/8/8 w - - 0 2');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('Draw (Insufficient Material)');
  });

  it('handles 50 move rule', () => {
    game = new ChessGame('8/8/8/2KNB3/8/3k4/8/8 b - - 99 50');
    mockedGetPromotionPiece.mockReturnValue(undefined);
    const result = game.move('d3', 'e4');
    expect(result.success).toBe(true);
    expect(result.fen).toBe('8/8/8/2KNB3/4k3/8/8/8 w - - 100 51');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('Draw (50 Moves)');
  });

  it('handles cancelled promotion', () => {
    game = new ChessGame('rnbqk1nr/ppp2ppp/8/4P3/1BP5/8/PP2KpPP/RN1Q1BNR b kq - 1 7');
    mockedGetPromotionPiece.mockReturnValue(null);
    const result = game.move('f7', 'g8');
    expect(result.success).toBe(false);
  });

  it('handles promotion', () => {
    game = new ChessGame('rnbqk1nr/ppp2ppp/8/4P3/1BP5/8/PP2KpPP/RN1Q1BNR b kq - 1 7');
    mockedGetPromotionPiece.mockReturnValue('n');
    const result = game.move('f2', 'g1');
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnbqk1nr/ppp2ppp/8/4P3/1BP5/8/PP2K1PP/RN1Q1BnR w kq - 0 8');
    expect(result.checkSquare).toBe('e2');
    expect(result.status).toBe('In Progress');
  });
});