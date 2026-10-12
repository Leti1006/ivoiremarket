"use client";

import { useMemo } from "react";
import { getProductById } from "@/features/products/catalog";
import type { DeliveryZone } from "@/types";
import { calculateCart } from "./cart-calculations";
import { cartActions, useCartItems } from "./cart-store";

/** Panier calculé (lignes, sous-total, livraison, total) et actions associées. */
export function useCart(zone: DeliveryZone = "abidjan") {
  const items = useCartItems();
  const totals = useMemo(() => calculateCart(items, getProductById, zone), [items, zone]);
  return { items, ...totals, ...cartActions };
}
