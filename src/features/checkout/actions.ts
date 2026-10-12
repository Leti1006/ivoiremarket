"use server";

import { createSimulatedOrder, type OrderResult } from "./create-simulated-order";

/**
 * Action serveur appelée à la validation du formulaire.
 * COMMANDE SIMULÉE : aucune donnée n'est enregistrée, aucun paiement n'est effectué.
 */
export async function placeOrder(input: unknown): Promise<OrderResult> {
  return createSimulatedOrder(input);
}
