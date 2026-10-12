import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_QUANTITY_PER_ITEM,
  SHIPPING_FEES,
  calculateCart,
  calculateShipping,
  clampQuantity,
} from "@/features/cart/cart-calculations";
import type { Product } from "@/types";

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: "x",
    slug: "x",
    name: "Produit test",
    brand: "Test",
    category: "accessoires",
    condition: "neuf",
    price: 1000,
    stock: 50,
    shortDescription: "",
    description: "",
    image: "/x.svg",
    warrantyMonths: 0,
    featured: false,
    specs: [],
    ...overrides,
  };
}

const phone = makeProduct({ id: "phone", price: 89000, stock: 3 });
const cable = makeProduct({ id: "cable", price: 4500, stock: 100 });
const soldOut = makeProduct({ id: "sold-out", price: 20000, stock: 0 });
const catalog = new Map([phone, cable, soldOut].map((product) => [product.id, product]));
const find = (id: string) => catalog.get(id);

describe("clampQuantity", () => {
  it("limite la quantité au stock disponible", () => {
    expect(clampQuantity(5, phone)).toBe(3);
  });

  it("limite la quantité au maximum par article", () => {
    expect(clampQuantity(500, cable)).toBe(MAX_QUANTITY_PER_ITEM);
  });

  it("refuse les valeurs négatives, décimales ou invalides", () => {
    expect(clampQuantity(-2, cable)).toBe(0);
    expect(clampQuantity(2.7, cable)).toBe(2);
    expect(clampQuantity(Number.NaN, cable)).toBe(0);
  });
});

describe("calculateShipping", () => {
  it("applique les frais selon la zone", () => {
    expect(calculateShipping(10000, "abidjan")).toBe(SHIPPING_FEES.abidjan);
    expect(calculateShipping(10000, "interieur")).toBe(SHIPPING_FEES.interieur);
  });

  it("offre la livraison à partir du seuil", () => {
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD - 1, "abidjan")).toBe(SHIPPING_FEES.abidjan);
    expect(calculateShipping(FREE_SHIPPING_THRESHOLD, "interieur")).toBe(0);
  });

  it("ne facture pas de livraison pour un panier vide", () => {
    expect(calculateShipping(0, "abidjan")).toBe(0);
  });
});

describe("calculateCart", () => {
  it("calcule les lignes, le sous-total, la livraison et le total", () => {
    const cart = calculateCart(
      [
        { productId: "phone", quantity: 1 },
        { productId: "cable", quantity: 2 },
      ],
      find,
      "abidjan",
    );
    expect(cart.lines.map((line) => line.lineTotal)).toEqual([89000, 9000]);
    expect(cart.itemCount).toBe(3);
    expect(cart.subtotal).toBe(98000);
    expect(cart.shipping).toBe(1500);
    expect(cart.total).toBe(99500);
  });

  it("utilise toujours le prix du catalogue et plafonne au stock", () => {
    const cart = calculateCart([{ productId: "phone", quantity: 10 }], find, "interieur");
    expect(cart.lines[0].quantity).toBe(3);
    expect(cart.subtotal).toBe(267000);
    expect(cart.shipping).toBe(0);
    expect(cart.total).toBe(267000);
  });

  it("ignore les produits inconnus ou épuisés", () => {
    const cart = calculateCart(
      [
        { productId: "inconnu", quantity: 1 },
        { productId: "sold-out", quantity: 1 },
      ],
      find,
    );
    expect(cart.lines).toHaveLength(0);
    expect(cart.total).toBe(0);
  });
});
