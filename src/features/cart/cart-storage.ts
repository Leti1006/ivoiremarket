import { z } from "zod";
import type { CartItem } from "@/types";

export const CART_STORAGE_KEY = "ivoiremarket:panier:v1";

const storedCartSchema = z
  .array(
    z.object({
      productId: z.string().min(1).max(40),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .max(50);

/**
 * Lit le panier enregistré dans le navigateur. Le contenu de localStorage peut avoir été
 * modifié à la main : il est donc validé et un contenu invalide donne un panier vide.
 */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const result = storedCartSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}
