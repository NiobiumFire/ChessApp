import type { Square } from "chess.js";

export function getCheckSquareStyle(checkSquare: Square | null): Record<string, React.CSSProperties> {
  if (!checkSquare) return {};
  return {
    [checkSquare]: {
      background: "radial-gradient(circle, #dd4646ff 40%, transparent 70%)",
    },
  };
}

export function getMoveSquareStyle(square: Square): Record<string, React.CSSProperties> {
  return {
    [square]: {
      boxShadow: "inset 0 0 2px 5px rgba(136, 252, 4, 1)",
    },
  };
}

// function updateValidMoveSquareStyle(validSquares : Square[]){
      //   const styles: Record<string, React.CSSProperties> = {};
      //   validSquares.forEach(square => {
      //     styles[square] = {
      //       background: "radial-gradient(circle, rgba(71, 0, 119, 0.8) 40%, transparent 40%)",
      //     };
      //   });

      //   setValidMoveSquareStyle(styles);
      // }