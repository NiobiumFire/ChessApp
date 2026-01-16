from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from chessLogic import EngineMoveRequest, make_move

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

@app.post("/engine-move")
def engine_move(body: EngineMoveRequest):
    try:
        return make_move(body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))