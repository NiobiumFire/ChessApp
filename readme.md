# ♟️ Chess Web App

A single-player chess web application where users play against a computer opponent with configurable strength.

The frontend is built with React + TypeScript, and the backend uses Python + FastAPI, powered by Stockfish for AI move calculation. The project is focusesed on a correctness, clean UI and architecture, and future extensibility.

## 🚀 Features
- Play chess against a computer opponent
- Adjustable AI strength (Stockfish)
- Legal move validation and game state enforcement
- Modern, responsive chessboard UI
- Fast frontend development powered by Vite

## 🛠️ Tech Stack
### Frontend
- React
- TypeScript
- Vite
- react-chessboard – chessboard UI
- chess.js – move validation and game logic
- Vitest – frontend unit testing

### Backend
- Python
- FastAPI
- uvicorn – ASGI server
- python-chess – chess rules, board state, formats
- Stockfish – chess engine
- Pytest – backend unit testing

## 🧑‍💻 Recommended VS Code Extensions
- Python (Microsoft)
- Pylance – Python language server & autocomplete
- ESLint – JavaScript/TypeScript linting
- Prettier – consistent code formatting
- Docker – for future containerization

## ⚙️ Setup & Installation
### Frontend Setup
```
cd frontend

# Create Vite React + TypeScript project
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm create vite@latest
# Select:
# - React
# - TypeScript

# Go to frontend project folder
cd frontend/chess-frontend

# Install chess libraries
npm install react-chessboard chess.js @types/chess.js
```

### Frontend Testing Setup
```
npm install --save-dev vitest @vitest/ui jsdom
npm install --save-dev vite-tsconfig-paths
npm install --save-dev @testing-library/react @testing-library/user-event
npm install --save-dev @testing-library/jest-dom @types/testing-library__jest-dom
```

### Backend Setup
```
cd backend

# Create virtual environment
python -m venv .venv

# Activate venv (PowerShell)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```
### Git Hooks (Optional)
For preventing commits on failed tests. Run from the repository root:
```
npm install -D husky
npx husky init
```

### Environment Variables
Set the following environment variable for the frontend:
```
VITE_CHESSAPP_BACKEND_URL=<backend-url>
```

## ▶️ Running the Project
### Frontend
```
cd frontend/chess-frontend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm run dev
```
The frontend will be available at http://localhost:5173.

### Backend
```
cd backend
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```
The API will be available at http://localhost:8000.

## 🧪 Testing
### Frontend Tests
```
cd frontend/chess-frontend
npm run test
```

### Backend Tests
```
cd backend
./.venv/Scripts/python.exe -m pytest
```

## ❌ Not Included (By Design)

- Multiplayer support
- User accounts or authentication
- Game persistence (save/load games)

This project is intentionally focused on single-player chess vs computer.

## 🐳 Future Improvements
- Dockerize frontend and backend
- Improved AI configuration (time controls, depth settings)
- UI/UX polish
- Game analysis

## 📜 License
This project is open-source. Feel free to fork, modify, and experiment.
