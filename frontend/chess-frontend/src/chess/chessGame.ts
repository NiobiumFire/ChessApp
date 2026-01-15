import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { getPromotionPiece } from "@chess/promotion";
import type { Promotion } from "@chess/promotion";

export type MoveResult = {
  success: boolean;
  fen?: string;
  checkSquare?: Square | null;
  status?: string
};

export class ChessGame {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  getFEN(): string {
    return this.game.fen();
  }

  getTurn(): string {
    return this.game.turn();
  }

  gameIsOver(): boolean {
    return this.game.isGameOver();
  }

  move(from: Square, to: Square, promotionPiece: string | null = null): MoveResult {
    if (this.game.isGameOver()) return { success: false };

    const piece = this.game.get(from);
    if (!piece) return { success: false };

    let promotion: Promotion | undefined;
    if (promotionPiece === null) {
      const result = getPromotionPiece(piece, to);
      if (result === null) return { success: false }; // cancelled for null, undefined if no promotion needed
      promotion = result;
    }
    else{
      promotion = promotionPiece as Promotion;
    }

    try {
        const move = this.game.move({ from, to, promotion });
        if (!move) return { success: false };
    }
    catch {
        return { success: false };
    }

    const sideToMove = this.game.turn();

    const checkSquare = this.game.inCheck()
      ? this.game.findPiece({ type: "k", color: sideToMove })[0]
      : null;

    let status: string;

    if (!this.game.isGameOver()) {
      status = 'In Progress';
    } else if (this.game.isCheckmate()) {
      status = sideToMove === 'w' ? 'Black Wins' : 'White Wins';
    } else if (this.game.isDrawByFiftyMoves()) {
      status = 'Draw (50 Moves)';
    } else if (this.game.isStalemate()) {
      status = 'Draw (Stalemate)';
    } else if (this.game.isInsufficientMaterial()) {
      status = 'Draw (Insufficient Material)';
    } else if (this.game.isThreefoldRepetition()) {
      status = 'Draw (Threefold Repetition)';
    } else {
      status = 'Draw';
    }

    return {
      success: true,
      fen: this.game.fen(),
      checkSquare,
      status,
    };
  }
}