export type Promotion = "n" | "b" | "r" | "q";

/**
 * Ask user which piece a pawn should promote to.
 * @returns Promotion piece or null if canceled.
 */
export function getPromotionPiece(): Promotion | undefined {
  const input = prompt(
    "Choose promotion piece ['n', 'b', 'r', 'q']",
  )?.trim().toLowerCase();

  if (!input || !["n", "b", "r", "q"].includes(input)) {
    return undefined;
  }

  return input as Promotion;
}
