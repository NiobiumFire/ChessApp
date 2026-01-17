from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app
import pytest

client = TestClient(app)

@pytest.fixture
def mock_output():
    return {"from": "e2", "to": "e4", "promotion": "n"}

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_engine_move_valid_without_skill_level(mock_output):
    with patch("main.make_move") as mock_move:
        mock_move.return_value = mock_output

        response = client.post("/engine-move", json={"fen": "valid fen"})
        assert response.status_code == 200
        assert response.json() == mock_output

def test_engine_move_valid_with_skill_level(mock_output):
    with patch("main.make_move") as mock_move:
        mock_move.return_value = mock_output

        response = client.post("/engine-move", json={"fen": "valid fen", "skill_level": 3})
        assert response.status_code == 200
        assert response.json() == mock_output

# Input body is incorrect structure for the class EngineMoveRequest

def test_engine_move_missing_fen():
    response = client.post("/engine-move", json={"skill_level": 3})
    assert response.status_code == 422

def test_engine_move_invalid_fen_type():
    response = client.post("/engine-move", json={"fen": 123, "skill_level": 3})
    assert response.status_code == 422

def test_engine_move_invalid_skill_level_type():
    response = client.post("/engine-move", json={"fen": "valid fen", "skill_level": "high"})
    assert response.status_code == 422
