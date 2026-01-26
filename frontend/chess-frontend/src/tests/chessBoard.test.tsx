import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
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
      gameIsOver = vi.fn(() => true); // true prevents the test trying to call the engine to repond to a move
      moveInvolvesPromotion = vi.fn(() => false)
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
      moveInvolvesPromotion: ReturnType<typeof vi.fn>;
    };
    expect(createdChessGame).not.toBeNull();
    expect(instance.moveInvolvesPromotion).toHaveBeenCalledWith('e2', 'e4');
    expect(instance.move).toHaveBeenCalledWith('e2', 'e4', undefined);

    // Status should be updated
    expect(setStatus).toHaveBeenCalledTimes(1);
    expect(setStatus).toHaveBeenCalledWith('In Progress');
  });

  it('handles promotion correctly', async () => {
    const instance = createdChessGame as {
        move: ReturnType<typeof vi.fn>;
        moveInvolvesPromotion: ReturnType<typeof vi.fn>;
    };

    instance.moveInvolvesPromotion.mockReturnValue(true);

    const fakeSquare = document.createElement("div");
    fakeSquare.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 100,
        bottom: 200,
        width: 50,
        height: 50,
      } as DOMRect);

    vi.spyOn(document, "querySelector").mockImplementation((selector: string) => {
      if (selector.includes("data-square")) return fakeSquare;
      return null;
    });

    const result = mockChessboardProps!.options.onPieceDrop!({
      sourceSquare: "e7",
      targetSquare: "e8",
    });

    expect(instance.moveInvolvesPromotion).toHaveBeenCalled();
    expect(result).toBe(false); // promotion move returns false immediately from handleDrop and the promotion modal subsequently triggers tryMove

    const knightButton = await screen.findByRole("button", { name: "Promote to N" });
    expect(knightButton).toBeInTheDocument();
    knightButton.click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(instance.move).toHaveBeenCalledWith("e7", "e8", "n");
  });
});
