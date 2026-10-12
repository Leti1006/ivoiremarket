import type { CartItem, CartLine, CartTotals, DeliveryZone, Product } from "@/types";

/** Quantité maximale par article, même si le stock est plus élevé. */
export const MAX_QUANTITY_PER_ITEM = 10;

/** Frais de livraison en FCFA selon la zone. */
export const SHIPPING_FEES: Record<DeliveryZone, number> = {
  abidjan: 1500,
  interieur: 3500,
};

/** Livraison offerte à partir de ce sous-total (FCFA). */
export const FREE_SHIPPING_THRESHOLD = 150000;

export const DELIVERY_ZONE_LABELS: Record<DeliveryZone, string> = {
  abidjan: "Abidjan",
  interieur: "Intérieur du pays",
};

export function maxQuantityFor(product: Product): number {
  return Math.max(0, Math.min(product.stock, MAX_QUANTITY_PER_ITEM));
}

/** Ramène une quantité demandée dans les limites autorisées (0 signifie « retirer »). */
export function clampQuantity(quantity: number, product: Product): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.min(Math.max(Math.trunc(quantity), 0), maxQuantityFor(product));
}

export function calculateShipping(subtotal: number, zone: DeliveryZone): number {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return SHIPPING_FEES[zone];
}

/**
 * Point de calcul unique du panier, utilisé par l'interface et par le serveur.
 * Les prix viennent toujours du catalogue : un article inconnu ou épuisé est ignoré
 * et les quantités sont limitées au stock.
 */
export function calculateCart(
  items: readonly CartItem[],
  findProduct: (id: string) => Product | undefined,
  zone: DeliveryZone = "abidjan",
): CartTotals {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = findProduct(item.productId);
    if (!product) continue;
    const quantity = clampQuantity(item.quantity, product);
    if (quantity === 0) continue;
    lines.push({ product, quantity, lineTotal: product.price * quantity });
  }
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const shipping = calculateShipping(subtotal, zone);
  return { lines, itemCount, subtotal, shipping, total: subtotal + shipping };
}
