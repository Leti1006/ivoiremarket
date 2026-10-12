import { randomBytes } from "node:crypto";
import { getProductById } from "@/features/products/catalog";
import { calculateCart } from "@/features/cart/cart-calculations";
import type { SimulatedOrder } from "@/types";
import { normalizePhone, orderRequestSchema } from "./checkout-schema";

export type OrderResult =
  | { ok: true; order: SimulatedOrder }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

/** Référence lisible et difficile à deviner, par exemple « IM-20261012-7F3A9C ». */
export function createOrderReference(date: Date): string {
  const day = date.toISOString().slice(0, 10).replaceAll("-", "");
  return `IM-${day}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

/**
 * Logique métier de la commande simulée, indépendante de Next.js pour pouvoir être testée.
 * Elle revalide toutes les données, recalcule les montants à partir du catalogue
 * (les prix envoyés par le navigateur ne sont jamais utilisés) et ne persiste RIEN.
 */
export function createSimulatedOrder(input: unknown, now = new Date()): OrderResult {
  const parsed = orderRequestSchema.safeParse(input);
  if (!parsed.success) {
    const itemsIssue = parsed.error.issues.find((issue) => issue.path[0] === "items");
    const customerErrors = parsed.error.issues
      .filter((issue) => issue.path[0] === "customer" && typeof issue.path[1] === "string")
      .reduce<Record<string, string[]>>((acc, issue) => {
        const field = issue.path[1] as string;
        (acc[field] ??= []).push(issue.message);
        return acc;
      }, {});
    return {
      ok: false,
      message: itemsIssue
        ? itemsIssue.path.length === 1
          ? itemsIssue.message
          : "Le panier contient des articles invalides."
        : "Certaines informations sont invalides. Vérifiez le formulaire.",
      fieldErrors: customerErrors,
    };
  }

  const { customer, items } = parsed.data;
  const cart = calculateCart(items, getProductById, customer.deliveryZone);
  if (cart.lines.length === 0) {
    return { ok: false, message: "Les articles de votre panier ne sont plus disponibles." };
  }

  return {
    ok: true,
    order: {
      reference: createOrderReference(now),
      createdAt: now.toISOString(),
      customerName: customer.fullName,
      phone: normalizePhone(customer.phone),
      city: customer.city,
      deliveryZone: customer.deliveryZone,
      paymentMethod: customer.paymentMethod,
      lines: cart.lines.map((line) => ({
        productId: line.product.id,
        name: line.product.name,
        quantity: line.quantity,
        unitPrice: line.product.price,
        lineTotal: line.lineTotal,
      })),
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      total: cart.total,
    },
  };
}
