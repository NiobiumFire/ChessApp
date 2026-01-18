from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
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

# ---------- API ----------

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/engine-move")
def engine_move(body: EngineMoveRequest):
    try:
        return make_move(body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ---------- FRONTEND SERVING ----------

FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "chess-frontend" / "dist"

if FRONTEND_DIST.exists():
    # Serve static assets
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")
else:
    print("\033[93mWARNING: Frontend build not found.\033[0m")

# ---------- SPA FALLBACK ROUTE ----------

@app.get("/{full_path:path}", include_in_schema=False)
def spa_fallback(full_path: str):
    # Check if the requested file exists in dist
    requested_file = FRONTEND_DIST / full_path

    if requested_file.exists() and requested_file.is_file():
        return FileResponse(requested_file)

    # Otherwise return index.html
    return FileResponse(FRONTEND_DIST / "index.html")