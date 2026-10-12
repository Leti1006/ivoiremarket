import { describe, expect, it } from "vitest";
import { checkoutSchema } from "@/features/checkout/checkout-schema";
import { createOrderReference, createSimulatedOrder } from "@/features/checkout/create-simulated-order";
import { parseStoredCart } from "@/features/cart/cart-storage";

const validCustomer = {
  fullName: "Awa Koné",
  phone: "07 08 09 10 11",
  email: "",
  deliveryZone: "abidjan",
  city: "Cocody",
  address: "Riviera 2, près de la pharmacie",
  paymentMethod: "livraison",
  notes: "",
  acceptTerms: true,
  website: "",
} as const;

describe("checkoutSchema", () => {
  it("accepte un formulaire valide", () => {
    expect(checkoutSchema.safeParse(validCustomer).success).toBe(true);
  });

  it.each(["0708091011", "+225 07 08 09 10 11", "27.22.33.44.55"])("accepte le numéro %s", (phone) => {
    expect(checkoutSchema.safeParse({ ...validCustomer, phone }).success).toBe(true);
  });

  it.each(["12345", "08 08 09 10 11", "07080910111"])("refuse le numéro %s", (phone) => {
    expect(checkoutSchema.safeParse({ ...validCustomer, phone }).success).toBe(false);
  });

  it("refuse un e-mail invalide mais accepte un e-mail vide", () => {
    expect(checkoutSchema.safeParse({ ...validCustomer, email: "pas-un-email" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validCustomer, email: "awa@example.ci" }).success).toBe(true);
  });

  it("exige la case de confirmation et un champ piège vide", () => {
    expect(checkoutSchema.safeParse({ ...validCustomer, acceptTerms: false }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...validCustomer, website: "spam" }).success).toBe(false);
  });
});

describe("createSimulatedOrder", () => {
  const now = new Date("2026-10-12T10:00:00Z");

  it("recalcule les montants à partir du catalogue", () => {
    const result = createSimulatedOrder(
      {
        customer: validCustomer,
        items: [
          { productId: "p-003", quantity: 1 },
          { productId: "p-014", quantity: 2 },
        ],
        // Un prix envoyé par le navigateur doit être ignoré.
        total: 1,
      },
      now,
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.subtotal).toBe(89000 + 2 * 4500);
    expect(result.order.shipping).toBe(1500);
    expect(result.order.total).toBe(99500);
    expect(result.order.phone).toBe("0708091011");
    expect(result.order.reference).toMatch(/^IM-20261012-[0-9A-F]{6}$/);
  });

  it("refuse un panier vide", () => {
    const result = createSimulatedOrder({ customer: validCustomer, items: [] }, now);
    expect(result).toMatchObject({ ok: false, message: "Votre panier est vide." });
  });

  it("refuse un panier qui ne contient que des articles indisponibles", () => {
    const result = createSimulatedOrder({ customer: validCustomer, items: [{ productId: "p-005", quantity: 1 }] }, now);
    expect(result.ok).toBe(false);
  });

  it("renvoie les erreurs par champ", () => {
    const result = createSimulatedOrder({ customer: { ...validCustomer, phone: "123" }, items: [{ productId: "p-003", quantity: 1 }] }, now);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.fieldErrors?.phone?.[0]).toContain("Numéro ivoirien invalide");
  });

  it("génère des références différentes", () => {
    expect(createOrderReference(now)).not.toBe(createOrderReference(now));
  });
});

describe("parseStoredCart", () => {
  it("lit un panier valide", () => {
    expect(parseStoredCart('[{"productId":"p-001","quantity":2}]')).toEqual([{ productId: "p-001", quantity: 2 }]);
  });

  it("renvoie un panier vide pour un contenu absent, corrompu ou falsifié", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("{pas du json")).toEqual([]);
    expect(parseStoredCart('[{"productId":"p-001","quantity":-3}]')).toEqual([]);
    expect(parseStoredCart('{"productId":"p-001"}')).toEqual([]);
  });
});
