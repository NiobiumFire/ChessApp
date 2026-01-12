import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { Chessboard } from 'react-chessboard';
import type { PieceDropHandlerArgs } from "react-chessboard";
import type { Square } from "chess.js";
import { getCheckSquareStyle, getMoveSquareStyle } from "@chess/squareStyles";
import { ChessGame } from "@chess/chessGame";
import type { GameDetail } from "@chess/gameDetail";

export function ChessBoard({ gameDetail, setStatus } : { gameDetail: GameDetail, setStatus: (status: string) => void }) {
  const chessGame = useRef<ChessGame | null>(null);
  const [chessPosition, setChessPosition] = useState<string>();
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [checkSquareStyle, setCheckSquareStyle] = useState<Record<string, CSSProperties>>({});
  const [lastMoveSquareStyle, setLastMoveSquareStyle] = useState<Record<string, CSSProperties>>({});
  const [currentMoveSquareStyle, setCurrentMoveSquareStyle] = useState<Record<string, CSSProperties>>({});
  //const [validMoveSquareStyle, setValidMoveSquareStyle] = useState<Record<string, CSSProperties>>({});

  // reset game and board
  useEffect(() => {
    chessGame.current = new ChessGame();
    setChessPosition(chessGame.current.getFEN());
    setCheckSquareStyle({});
    setLastMoveSquareStyle({});
    setCurrentMoveSquareStyle({});
    setOrientation(gameDetail.colour);
    setStatus('In Progress');
    console.log("test");
  }, [gameDetail, setStatus]);

  const tryMove = useCallback((from: Square, to: Square) : boolean => {
    if (!from || !to) return false;

    if (!chessGame.current) return false;

    const moveResult = chessGame.current?.move(from, to, true);

    if (!moveResult || !moveResult.success) return false;

    if (moveResult.checkSquare !== undefined) setCheckSquareStyle(getCheckSquareStyle(moveResult.checkSquare));
    setLastMoveSquareStyle(getMoveSquareStyle(from));
    setCurrentMoveSquareStyle(getMoveSquareStyle(to));

    //const validMoves = chessGame.moves({square: sourceSquare as Square, verbose: true });
    //const validSquares = validMoves.map(m => m.to as Square);
    //updateValidMoveSquareStyle(validSquares as Square[]);

    if (moveResult.status !== undefined) setStatus(moveResult.status);

    setChessPosition(chessGame.current.getFEN());
    return true;
  }, [setLastMoveSquareStyle, setCurrentMoveSquareStyle, setStatus, setChessPosition]);

  // drag and drop piece to move
  const handleDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
        const { sourceSquare, targetSquare } = args;

        if (!sourceSquare || !targetSquare) return false;

        const from = sourceSquare as Square;
        const to = targetSquare as Square;

        return tryMove(from, to);
    },
      [tryMove]
  );

  const customSquareStyles = useMemo(() => ({
    ...checkSquareStyle,
    ...lastMoveSquareStyle,
    ...currentMoveSquareStyle,
    //...validMoveSquareStyle
  }), [checkSquareStyle, lastMoveSquareStyle, currentMoveSquareStyle]);


  const chessboardOptions = useMemo(() => ({
    boardStyle: {
      backgroundColor: "#258f2eff",
    },
    darkSquareStyle: { backgroundColor: "#769656" },
    lightSquareStyle: { backgroundColor: "#eeeed2" },
    position: chessPosition,
    onPieceDrop: handleDrop,
    squareStyles: customSquareStyles,
    boardOrientation: orientation,
  }), [chessPosition, handleDrop, customSquareStyles, orientation]);

  return (
    <div className="chessboard-style">
      <Chessboard
        options = {chessboardOptions}
      />
    </div>
  );
};
