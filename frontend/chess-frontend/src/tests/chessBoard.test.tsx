import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
//import { ChessGame } from '@chess/chessGame';
import { ChessBoard } from '@chess/chessBoard';

import type { GameDetail } from "@chess/gameDetail";

type ChessboardProps = {
  options: {
    onPieceDrop: (args: { sourceSquare: string; targetSquare: string }) => boolean;
  };
};

let mockChessboardProps: ChessboardProps | null = null;

// Mock Chessboard so it doesn’t render a full board
vi.mock('react-chessboard', () => ({
  Chessboard: (props: ChessboardProps) => {
    mockChessboardProps = props;
    return <div data-testid="chessboard" {...props} />;
  }
}));

// Mock ChessGame
let createdChessGame: unknown = null;
vi.mock('@chess/chessGame', () => {
  return {
    ChessGame: class {
      getFEN = vi.fn(() => 'initial-fen');
      gameIsOver = vi.fn(() => 'false');
      move = vi.fn(() => ({
        success: true,
        fen: 'after-move-fen',
        checkSquare: 'e2',
        status: 'In Progress',
      }));
      constructor(){
         Object.assign(createdChessGame = {}, this);
      }
    }
  };
});

describe('ChessBoard', () => {
  const gameDetail = { gameNumber: 0, colour: 'w' } as GameDetail;
  const setStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    createdChessGame = null;
    render(<ChessBoard gameDetail={gameDetail} setStatus={setStatus} />);
  });

  it('renders ChessBoard and sets initial state', () => {
    // The component mounted successfully and did not crash
    // React successfully executed the render phase
    // The component returned JSX
    // No runtime error occurred during render or commit
    // The Chessboard child was rendered (via the mock)
    expect(screen.getByTestId('chessboard')).toBeInTheDocument();

    // 'new ChessGame' was called
     expect(createdChessGame).not.toBeNull();
    
    // The component performed its side effects
    // UseEffect ran exactly once
    // The parent was notified of the initial game state
    // Initialization completed successfully
    expect(setStatus).toHaveBeenCalledWith('In Progress');
    expect(setStatus).toHaveBeenCalledTimes(1);
  });

  it('calls move on piece drop and updates state', () => {
    // We test later that setStatus was called from handleDrop -> tryMove and aren't interested in it being called from the useEffect
    setStatus.mockClear();
    
    // Call onPieceDrop manually
    const result = mockChessboardProps!.options.onPieceDrop!({ sourceSquare: 'e2', targetSquare: 'e4' });

    // onPieceDrop called handleDrop, which returns true if ChessGame.current exists and ChessGame.move returned success: true
    expect(result).toBe(true);

    // Cast ChessGame as a Vitest mock, access the mocked instance
    // ChessGame.move should have been called
    const instance = createdChessGame as {
      move: ReturnType<typeof vi.fn>;
    };
    expect(createdChessGame).not.toBeNull();
    expect(instance.move).toHaveBeenCalledWith('e2', 'e4', null);

    // Status should be updated
    expect(setStatus).toHaveBeenCalledTimes(1);
    expect(setStatus).toHaveBeenCalledWith('In Progress');
  });
});
