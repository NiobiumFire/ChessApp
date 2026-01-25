import { Chess } from "chess.js";
import type { Square } from "chess.js";

export type MoveResult = {
  success: boolean;
  fen?: string;
  checkSquare?: Square | null;
  status?: string;
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

  moveInvolvesPromotion(from: Square, to: Square): boolean {
    const piece = this.game.get(from);
    const isPawn = piece?.type === "p";
    const rank = Number(to[1]);
    const isLastRank =
      (piece?.color === "w" && rank === 8) ||
      (piece?.color === "b" && rank === 1);
    const isLegalMove = this.game
      .moves({ square: from })
      .some((m) => m.includes(to));
    return isPawn && isLastRank && isLegalMove;
  }

  move(from: Square, to: Square, promotion: string | undefined = undefined) : MoveResult {
    if (this.game.isGameOver()) return { success: false };

    const piece = this.game.get(from);
    if (!piece) return { success: false };

    try {
      const move = this.game.move({ from, to, promotion });
      if (!move) return { success: false };
    } catch {
      return { success: false };
    }

    const sideToMove = this.game.turn();

    const checkSquare = this.game.inCheck()
      ? this.game.findPiece({ type: "k", color: sideToMove })[0]
      : null;

    let status: string;

    if (!this.game.isGameOver()) {
      status = "In Progress";
    } else if (this.game.isCheckmate()) {
      status = sideToMove === "w" ? "Black Wins" : "White Wins";
    } else if (this.game.isDrawByFiftyMoves()) {
      status = "Draw (50 Moves)";
    } else if (this.game.isStalemate()) {
      status = "Draw (Stalemate)";
    } else if (this.game.isInsufficientMaterial()) {
      status = "Draw (Insufficient Material)";
    } else if (this.game.isThreefoldRepetition()) {
      status = "Draw (Threefold Repetition)";
    } else {
      status = "Draw";
    }

    return {
      success: true,
      fen: this.game.fen(),
      checkSquare,
      status,
    };
  }
}
