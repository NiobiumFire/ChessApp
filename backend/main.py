from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from chess_logic import EngineMoveRequest, make_move
import os

origins = os.getenv("VITE_CHESSAPP_FRONTEND_URL", "").split(",")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/engine-move")
def engine_move(body: EngineMoveRequest):
    try:
        return make_move(body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))