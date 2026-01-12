from fastapi import FastAPI
import chess

print("main.py is loaded")

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/new-game")
def new_game():
    board = chess.Board() # create new chess game
    return {"fen": board.fen()}
