import { describe, it, expect } from 'vitest';
import { ChessGame } from '@chess/chessGame';


describe('ChessGame.moveInvolvesPromotion', () => {
  it('returns false when piece is not a pawn', () => {  // pawn ✘, last rank ✔, legal ✔
    const game = new ChessGame('rnbqkb1r/pppp1ppp/2N5/8/8/8/PPPn1PPP/RNBQKB1R w KQkq - 0 5');
    const result = game.moveInvolvesPromotion('c6', 'd8');
    expect(result).toBe(false);
  });

  it('returns false when pawn does not reach promotion rank', () => { // pawn ✔, last rank ✘, legal ✔
    const game = new ChessGame();
    const result = game.moveInvolvesPromotion('e2', 'e4');
    expect(result).toBe(false);
  });

  it('returns false when promotion move is illegal', () => { // pawn ✔, last rank ✔, legal ✘
    const game = new ChessGame();
    const result = game.moveInvolvesPromotion('e2', 'e8');
    expect(result).toBe(false);
  });

  it('works for white pawn promotion', () => {
    const game = new ChessGame('rnbqkbnr/2Pp1ppp/p7/4p3/8/8/PP1PPPPP/RNBQKBNR w KQkq - 0 5');
    const result = game.moveInvolvesPromotion('c7', 'b8');
    expect(result).toBe(true);
  });

  it('works for black pawn promotion', () => {
    const game = new ChessGame('rnbqkbnr/ppp1pppp/8/3P4/2P5/8/PP4pP/RNBQKBNR b KQkq - 0 5');
    const result = game.moveInvolvesPromotion('g2', 'h1');
    expect(result).toBe(true);
  });
});

describe('ChessGame.move', () => {
  it('allows normal legal move', () => {
    const game = new ChessGame();
    const result = game.move('e2', 'e4', undefined); // make the move 1. e4
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('In Progress');
  });

  it('prevents a move from an empty square', () => {
    const game = new ChessGame();
    const result = game.move('a3', 'a4', undefined); // no piece there
    expect(result.success).toBe(false);
  });

  it('prevents invalid move', () => {
    const game = new ChessGame();
    const result = game.move('a2', 'a5', undefined); // pawn cannot move 3 squares
    expect(result.success).toBe(false);
  });

  it('handles capture', () => {
    const game = new ChessGame('rnbqkbnr/pppp1ppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2');
    const result = game.move('d4', 'e5', undefined); // pawn captures
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnbqkbnr/pppp1ppp/8/4P3/8/8/PPP1PPPP/RNBQKBNR b KQkq - 0 2');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('In Progress');
  });

  it('handles check', () => {
    const game = new ChessGame('rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const result = game.move('d1', 'h5', undefined); // queen checks king
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnbqkbnr/ppppp1pp/8/5p1Q/4P3/8/PPPP1PPP/RNB1KBNR b KQkq - 1 2');
    expect(result.checkSquare).toBe('e8');
    expect(result.status).toBe('In Progress');
  });

  it('handles checkmate by white', () => {
    const game = new ChessGame('r1bqkbnr/ppp2ppp/2np4/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 2 4');
    const result = game.move('h5', 'f7', undefined);
    expect(result.success).toBe(true);
    expect(result.fen).toBe('r1bqkbnr/ppp2Qpp/2np4/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4');
    expect(result.checkSquare).toBe('e8');
    expect(result.status).toBe('White Wins');
  });

  it('handles checkmate by black', () => {
    const game = new ChessGame('rnbqkbnr/pppp1ppp/8/4p3/5PP1/8/PPPPP2P/RNBQKBNR b KQkq - 0 2');
    const result = game.move('d8', 'h4', undefined);
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnb1kbnr/pppp1ppp/8/4p3/5PPq/8/PPPPP2P/RNBQKBNR w KQkq - 1 3');
    expect(result.checkSquare).toBe('e1');
    expect(result.status).toBe('Black Wins');
  });

  it('handles stalemate', () => {
    const game = new ChessGame('k7/8/1K1Q4/8/8/8/8/8 w - - 3 3');
    const result = game.move('d6', 'c7', undefined);
    expect(result.success).toBe(true);
    expect(result.fen).toBe('k7/2Q5/1K6/8/8/8/8/8 b - - 4 3');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('Draw (Stalemate)');
  });

  it('handles repetition', () => {
    const game = new ChessGame('k7/8/1K6/3Q4/8/8/8/8 b - - 0 1');

    const repeatCycle = () => {
      game.move('a8', 'b8', undefined);
      game.move('d5', 'e6', undefined);
      game.move('b8', 'a8', undefined);
      return game.move('e6', 'd5', undefined);
    };

    repeatCycle();
    const result = repeatCycle();

    expect(result.success).toBe(true);
    expect(result.fen).toBe('k7/8/1K6/3Q4/8/8/8/8 b - - 8 5');
    expect(result.checkSquare).toBe('a8');
    expect(result.status).toBe('Draw (Threefold Repetition)');
  });

  it('handles insufficient material', () => {
    const game = new ChessGame('Qk6/8/1K6/8/8/8/8/8 b - - 0 1');
    const result = game.move('b8', 'a8', undefined);
    expect(result.success).toBe(true);
    expect(result.fen).toBe('k7/8/1K6/8/8/8/8/8 w - - 0 2');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('Draw (Insufficient Material)');
  });

  it('handles 50 move rule', () => {
    const game = new ChessGame('8/8/8/2KNB3/8/3k4/8/8 b - - 99 50');
    const result = game.move('d3', 'e4', undefined);
    expect(result.success).toBe(true);
    expect(result.fen).toBe('8/8/8/2KNB3/4k3/8/8/8 w - - 100 51');
    expect(result.checkSquare).toBeNull();
    expect(result.status).toBe('Draw (50 Moves)');
  });

  it('handles cancelled promotion', () => {
    const game = new ChessGame('rnbqk1nr/ppp2ppp/8/4P3/1BP5/8/PP2KpPP/RN1Q1BNR b kq - 1 7');
    const result = game.move('f7', 'g8', undefined);
    expect(result.success).toBe(false);
  });

  it('handles promotion', () => {
    const game = new ChessGame('rnbqk1nr/ppp2ppp/8/4P3/1BP5/8/PP2KpPP/RN1Q1BNR b kq - 1 7');
    const result = game.move('f2', 'g1', 'n');
    expect(result.success).toBe(true);
    expect(result.fen).toBe('rnbqk1nr/ppp2ppp/8/4P3/1BP5/8/PP2K1PP/RN1Q1BnR w kq - 0 8');
    expect(result.checkSquare).toBe('e2');
    expect(result.status).toBe('In Progress');
  });
});