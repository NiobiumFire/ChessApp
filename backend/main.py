from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import chess
import random

PROMOTION_MAP = {
    chess.QUEEN: "q",
    chess.ROOK: "r",
    chess.BISHOP: "b",
    chess.KNIGHT: "n",
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/new-game")
def new_game():
    board = chess.Board() # create new chess game
    return {"fen": board.fen()}

@app.get("/random-move")
def random_move(fen: str = Query(..., description="FEN string")):
    try:
        board = chess.Board(fen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if board.is_game_over():
        raise HTTPException(status_code=400, detail="Game is already over")

    moves = list(board.legal_moves)
    if not moves:
        raise HTTPException(status_code=400, detail="No legal moves")

    move = random.choice(moves)

    return {
        "from": chess.square_name(move.from_square),
        "to": chess.square_name(move.to_square),
        "promotion": (
            PROMOTION_MAP[move.promotion]
            if move.promotion
            else None
        )
    }