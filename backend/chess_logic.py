import chess
import chess.engine
from pydantic import BaseModel
import os
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STOCKFISH_PATH = os.path.join(BASE_DIR, "stockfish", "stockfish.exe")

#engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH) # use engine per request so as not to have a long running engine in Azure App Service

PROMOTION_MAP = {
    chess.QUEEN: "q",
    chess.ROOK: "r",
    chess.BISHOP: "b",
    chess.KNIGHT: "n",
}

class EngineMoveRequest(BaseModel):
    fen: str
    skill_level: int = 5

def make_move(engine_move_request: EngineMoveRequest):
    if engine_move_request.skill_level < -1 or engine_move_request.skill_level > 20:
        raise ValueError("Invalid skill level")

    try:
        board = chess.Board(engine_move_request.fen)
    except Exception as e:
        raise ValueError(f"Invalid FEN: {e}")

    if board.is_game_over():
        raise ValueError("Game is already over")
    
    moves = list(board.legal_moves)
    if not moves:
        raise ValueError("No legal moves") # this should basically never raise if we assume python-chess will correctly evaluate valid fen and game-over states, but wil lleave in to be conservative. Not unit tested.

    if engine_move_request.skill_level == -1:
        move = random.choice(moves)
    else:
        try:
            with chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH) as engine:
                engine.configure({
                    "Skill Level": engine_move_request.skill_level,
                    "Threads": 1,
                    "Hash": 16
                })
                result = engine.play(board, chess.engine.Limit(time=0.1))
                move = result.move
        except Exception as e:
            raise ValueError(f"Stockfish failed: {e}")

    return {
        "from": chess.square_name(move.from_square),
        "to": chess.square_name(move.to_square),
        "promotion": (
            PROMOTION_MAP[move.promotion]
            if move.promotion
            else None
        )
    }