from unittest.mock import patch, MagicMock
import chess
from chess_logic import EngineMoveRequest, make_move
import pytest

@pytest.fixture
def fake_move():
    return chess.Move.from_uci("e2e4")

def test_invalid_skill_level_too_low():
    req = EngineMoveRequest(fen=chess.STARTING_FEN, skill_level=-2)
    with pytest.raises(ValueError, match="Invalid skill level"):
        make_move(req)

def test_invalid_skill_level_too_high():
    req = EngineMoveRequest(fen=chess.STARTING_FEN, skill_level=21)
    with pytest.raises(ValueError, match="Invalid skill level"):
        make_move(req)

def test_invalid_fen():
    req = EngineMoveRequest(fen="not a fen", skill_level=5)
    with pytest.raises(ValueError, match="Invalid FEN"):
        make_move(req)

def test_game_over_checkmate():
    # Checkmate position: black king is checkmated
    fen = "r1bqkbnr/ppp2Qpp/2np4/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4"
    req = EngineMoveRequest(fen=fen, skill_level=5)
    with pytest.raises(ValueError, match="Game is already over"):
        make_move(req)

def test_game_over_stalemate():
    # Stalemate position (black to move, no legal moves)
    fen = "7k/5Q2/6K1/8/8/8/8/8 b - - 0 1"
    req = EngineMoveRequest(fen=fen, skill_level=5)
    with pytest.raises(ValueError, match="Game is already over"):
        make_move(req)

def test_random_move_is_used_when_skill_level_is_minus_one(fake_move):
    req = EngineMoveRequest(fen=chess.STARTING_FEN, skill_level=-1)

    with patch("chess_logic.random.choice", return_value=fake_move):
        result = make_move(req)

    assert result == {"from": "e2", "to": "e4", "promotion": None}

def test_stockfish_move_returns_expected_format(fake_move):
    req = EngineMoveRequest(fen=chess.STARTING_FEN, skill_level=5)

    # Create a fake engine with a fake play() result
    fake_engine = MagicMock()
    fake_engine.play.return_value = MagicMock(move=fake_move)

    # Make popen_uci return a context manager that yields fake_engine ('with' statement)
    fake_context = MagicMock()
    fake_context.__enter__.return_value = fake_engine
    fake_context.__exit__.return_value = False

    with patch("chess_logic.chess.engine.SimpleEngine.popen_uci", return_value=fake_context):
        result = make_move(req)

    assert result == {"from": "e2", "to": "e4", "promotion": None}

def test_stockfish_failure_raises_value_error():
    req = EngineMoveRequest(fen=chess.STARTING_FEN, skill_level=5)

    with patch("chess_logic.chess.engine.SimpleEngine.popen_uci", side_effect=Exception("boom")):
        with pytest.raises(ValueError, match="Stockfish failed"):
            make_move(req)

def test_promotion_move():
    req = EngineMoveRequest(fen=chess.STARTING_FEN, skill_level=-1)

    fake_move = chess.Move.from_uci("e7e8r")  # promotion to rook

    with patch("chess_logic.random.choice", return_value=fake_move):
        result = make_move(req)

    assert result == {"from": "e7", "to": "e8", "promotion": "r"}
