"use client";

import { useSyncExternalStore } from "react";
import { getProductById } from "@/features/products/catalog";
import type { CartItem } from "@/types";
import { clampQuantity } from "./cart-calculations";
import { CART_STORAGE_KEY, parseStoredCart } from "./cart-storage";

/*
 * Petit magasin de données (store) pour le panier, sans bibliothèque externe.
 * Il garde les articles en mémoire, les recopie dans localStorage pour qu'ils survivent
 * à l'actualisation de la page, et se synchronise entre plusieurs onglets.
 */

const EMPTY_CART: CartItem[] = [];
let items: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): CartItem[] {
  try {
    return parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY));
  } catch {
    return [];
  }
}

function getSnapshot(): CartItem[] {
  if (items === null) items = readFromStorage();
  return items;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

function setItems(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Stockage indisponible (navigation privée stricte) : le panier reste en mémoire.
  }
  listeners.forEach((listener) => listener());
}

function onStorage(event: StorageEvent) {
  if (event.key !== CART_STORAGE_KEY) return;
  items = parseStoredCart(event.newValue);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export const cartActions = {
  /** Ajoute un article ; la quantité totale est limitée au stock disponible. */
  add(productId: string, quantity = 1) {
    const product = getProductById(productId);
    if (!product) return;
    const current = getSnapshot();
    const existing = current.find((item) => item.productId === productId);
    const nextQuantity = clampQuantity((existing?.quantity ?? 0) + quantity, product);
    if (nextQuantity === 0) return;
    setItems(
      existing
        ? current.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item))
        : [...current, { productId, quantity: nextQuantity }],
    );
  },
  setQuantity(productId: string, quantity: number) {
    const product = getProductById(productId);
    if (!product) return;
    const nextQuantity = clampQuantity(quantity, product);
    const current = getSnapshot();
    setItems(
      nextQuantity === 0
        ? current.filter((item) => item.productId !== productId)
        : current.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item)),
    );
  },
  remove(productId: string) {
    setItems(getSnapshot().filter((item) => item.productId !== productId));
  },
  clear() {
    setItems([]);
  },
};

/** Articles du panier ; vide pendant le rendu serveur. */
export function useCartItems(): CartItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const noopSubscribe = () => () => {};

/** Vaut false pendant le rendu serveur et l'hydratation, puis true dans le navigateur. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
