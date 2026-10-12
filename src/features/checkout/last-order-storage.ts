import type { SimulatedOrder } from "@/types";

const LAST_ORDER_KEY = "ivoiremarket:derniere-commande";

/** Garde la dernière commande simulée le temps de la session, pour la page de confirmation. */
// Copie en mémoire : useSyncExternalStore exige un instantané stable entre deux lectures.
let snapshot: SimulatedOrder | null | undefined;

export function saveLastOrder(order: SimulatedOrder) {
  snapshot = order;
  try {
    window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Stockage indisponible : la page de confirmation affichera un message générique.
  }
}

export function readLastOrder(): SimulatedOrder | null {
  try {
    const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      "reference" in value &&
      typeof value.reference === "string" &&
      "lines" in value &&
      Array.isArray(value.lines)
    ) {
      return value as SimulatedOrder;
    }
    return null;
  } catch {
    return null;
  }
}

/** Instantané stable de la dernière commande, pour useSyncExternalStore. */
export function getLastOrderSnapshot(): SimulatedOrder | null {
  if (snapshot === undefined) snapshot = readLastOrder();
  return snapshot;
}
