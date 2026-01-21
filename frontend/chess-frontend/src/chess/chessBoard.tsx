import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { CSSProperties } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import type { Square } from "chess.js";
import { getCheckSquareStyle, getMoveSquareStyle } from "@chess/squareStyles";
import { ChessGame } from "@chess/chessGame";
import type { GameDetail } from "@chess/gameDetail";

export function ChessBoard({
  gameDetail,
  setStatus,
}: {
  gameDetail: GameDetail;
  setStatus: (status: string) => void;
}) {
  const chessGame = useRef<ChessGame | null>(null);
  const enginePending = useRef(false);
  const [chessPosition, setChessPosition] = useState<string>();
  const [orientation, setOrientation] = useState<"w" | "b">("w");
  const [checkSquareStyle, setCheckSquareStyle] = useState<
    Record<string, CSSProperties>
  >({});
  const [lastMoveSquareStyle, setLastMoveSquareStyle] = useState<
    Record<string, CSSProperties>
  >({});
  const [currentMoveSquareStyle, setCurrentMoveSquareStyle] = useState<
    Record<string, CSSProperties>
  >({});
  const [allowDragging, setAllowDragging] = useState(true);
  //const [validMoveSquareStyle, setValidMoveSquareStyle] = useState<Record<string, CSSProperties>>({});

  const tryMove = useCallback(
    (from: Square, to: Square, promotionPiece: string | null): boolean => {
      if (!from || !to) return false;

      if (!chessGame.current) return false;

      const moveResult = chessGame.current.move(from, to, promotionPiece);

      if (!moveResult || !moveResult.success) return false;

      if (moveResult.checkSquare !== undefined)
        setCheckSquareStyle(getCheckSquareStyle(moveResult.checkSquare));

      setLastMoveSquareStyle(getMoveSquareStyle(from));
      setCurrentMoveSquareStyle(getMoveSquareStyle(to));

      //const validMoves = chessGame.moves({square: sourceSquare as Square, verbose: true });
      //const validSquares = validMoves.map(m => m.to as Square);
      //updateValidMoveSquareStyle(validSquares as Square[]);

      if (moveResult.status !== undefined) setStatus(moveResult.status);

      setChessPosition(chessGame.current.getFEN());

      return true;
    },
    [
      setLastMoveSquareStyle,
      setCurrentMoveSquareStyle,
      setStatus,
      setChessPosition,
    ]
  );

  const requestEngineMove = useCallback(async () => {
    if (!chessGame.current) return;

    if (chessGame.current.getTurn() === gameDetail.colour) return;

    try {
      const fen = chessGame.current.getFEN();
      const body = {
        fen: fen,
        skill_level: gameDetail.skillLevel
      };

      const BACKEND_URL = import.meta.env.VITE_CHESSAPP_BACKEND_URL || "";

      const response = await fetch(`${BACKEND_URL}/engine-move`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error("Engine error:", await response.text());
        return;
      }

      const move = await response.json();

      if (move?.promotion && !['n','b','r','q'].includes(move.promotion)) {
        throw new Error(`Invalid promotion value from engine: ${move.promotion}`);
      }

      await new Promise((res) => setTimeout(res, 200)); // add small delay
      tryMove(move.from, move.to, move.promotion);
    } catch (err) {
      console.error("Engine move failed:", err);
    }
  }, [gameDetail.colour, gameDetail.skillLevel, tryMove]);

  // drag and drop piece to move
  const handleDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      const { sourceSquare, targetSquare } = args;

      if (!sourceSquare || !targetSquare) return false;

      const from = sourceSquare as Square;
      const to = targetSquare as Square;

      const result = tryMove(from, to, null);
      setAllowDragging(!result);

      return result;
    },
    [tryMove]
  );

  // reset game and board
  useEffect(() => {
    chessGame.current = new ChessGame();
    setChessPosition(chessGame.current.getFEN());
    setCheckSquareStyle({});
    setLastMoveSquareStyle({});
    setCurrentMoveSquareStyle({});
    setOrientation(gameDetail.colour);
    setStatus("In Progress");
    setAllowDragging(gameDetail.colour == "w");
  }, [gameDetail.gameNumber, gameDetail.colour, setStatus]);

  // call the engine
  useEffect(() => {
    if (!chessGame.current) return;
    if (chessGame.current.gameIsOver()) {
      setAllowDragging(false);
      return;
    }
    if (chessGame.current.getTurn() === gameDetail.colour || enginePending.current) return;
      
    let cancelled = false;
    enginePending.current = true;

    requestEngineMove().finally(() => {
      enginePending.current = false;
      if (!cancelled && chessGame.current) {
        setAllowDragging(!chessGame.current!.gameIsOver());
      }
    });
    
    return () => { // prevent possible state update after unmount during engine request
      cancelled = true;
    };
  }, [gameDetail.colour, requestEngineMove, chessPosition]);

  const customSquareStyles = useMemo(
    () => ({
      ...checkSquareStyle,
      ...lastMoveSquareStyle,
      ...currentMoveSquareStyle,
      //...validMoveSquareStyle
    }),
    [checkSquareStyle, lastMoveSquareStyle, currentMoveSquareStyle]
  );

  const chessboardOptions = useMemo(
    () => ({
      boardStyle: {
        backgroundColor: "rgb(124, 94, 54)",
      },
      darkSquareStyle: { backgroundColor: "#769656" },
      lightSquareStyle: { backgroundColor: "#eeeed2" },
      position: chessPosition,
      onPieceDrop: handleDrop,
      squareStyles: customSquareStyles,
      boardOrientation:
        orientation === "w" ? "white" : ("black" as "white" | "black"),
      allowDragging: allowDragging,
    }),
    [chessPosition, handleDrop, customSquareStyles, orientation, allowDragging]
  );

  return (
      <Chessboard options={chessboardOptions} />
  );
}
