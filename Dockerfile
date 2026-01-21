# ---------------------------
# 1. Build frontend
# ---------------------------
FROM node:24.12.0-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/chess-frontend/package*.json ./
RUN npm ci

COPY frontend/chess-frontend .
RUN npm run build


# ---------------------------
# 2. Build backend
# ---------------------------
FROM python:3.13-slim AS backend-build

WORKDIR /app

# Install runtime deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend ./backend

# delete unwanted stuff inside build stage
RUN rm -rf backend/.pytest_cache \
    backend/.venv \
    backend/__pycache__ \
    backend/stockfish/stockfish-win \
    backend/tests \
    backend/.gitignore \
    backend/requirements.txt

# Ensure stockfish is executable
RUN chmod +x backend/stockfish/stockfish-linux/stockfish-linux


# ---------------------------
# 3. Runtime image
# ---------------------------
FROM python:3.13-slim

WORKDIR /app

ENV PYTHONPATH=/app/backend

# Copy installed packages from build stage
COPY --from=backend-build /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=backend-build /usr/local/bin /usr/local/bin

# Copy backend
COPY --from=backend-build /app/backend ./backend
COPY --from=frontend-build /app/frontend/dist ./frontend/chess-frontend/dist

# Expose port
EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]