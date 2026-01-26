import { useCallback, useState } from "react";

export type Promotion = "n" | "b" | "r" | "q";

export function usePromotion() {
    const [promotionResolverFunction, setPromotionResolverFunction] = useState<((p?: Promotion) => void) | null>(null);

    // store a function in state that represents “finishing the async question”, and the modal’s only job is to call it with the user’s answer
    const requestPromotion = useCallback(() => {
        return new Promise<Promotion | undefined>((promiseResolver) => {
            setPromotionResolverFunction(() => (p?: Promotion) => {
                promiseResolver(p);
                setPromotionResolverFunction(null);
            });
        });
    }, []);

    return { requestPromotion, promotionResolverFunction };
}