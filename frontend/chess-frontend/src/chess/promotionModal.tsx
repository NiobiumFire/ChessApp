import { useEffect, useState } from "react";
import type { Promotion } from "@chess/usePromotion";
import { promotionImages } from "@chess/promotionPieces"

type Anchor = { left: number; top: number; width: number };

export function PromotionModal({ promotionResolverFunction, promotionSquare, colour }: { promotionResolverFunction: ((p?: Promotion) => void) | null, promotionSquare: string | null, colour: 'w' | 'b' }) {
    const [anchor, setAnchor] = useState<Anchor | null>(null);

    // Measure the square when the modal opens
    useEffect(() => {
        if (!promotionResolverFunction) return;

        const raf = requestAnimationFrame(() => {
            const square = document.querySelector(`[data-square="${promotionSquare}"]`) as HTMLElement | null;

            if (!square) return;

            const rect = square.getBoundingClientRect();

            setAnchor({
                left: rect.left + rect.width / 2,
                top: rect.bottom,
                width: rect.width
            });
        }
    );

    return () => cancelAnimationFrame(raf);
    }, [promotionResolverFunction, promotionSquare]);


    if (!promotionResolverFunction || !anchor) return null;
    return (
        <div className="modal-backdrop" onClick={() => promotionResolverFunction(undefined)}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ left: anchor.left, top: anchor.top, width: anchor.width }}>
                {(["n", "b", "r", "q"] as Promotion[]).map((p) => (
                    <button key={p} onClick={() => { promotionResolverFunction(p) }} aria-label={`Promote to ${p.toUpperCase()}`}>
                        <img
                            src={promotionImages[colour][p]}
                            alt={p.toUpperCase()}
                            className="promotion-piece-img"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}