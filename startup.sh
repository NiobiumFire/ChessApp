#!/usr/bin/env bash
set -e

# Make Stockfish executable
chmod +x backend/stockfish/stockfish-linux/stockfish-linux

# Start the server
uvicorn main:app --host 0.0.0.0 --port $PORT