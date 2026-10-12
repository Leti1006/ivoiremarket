import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { filterProducts, normalizeText, parseFilters } from "@/features/products/catalog";

describe("données de démonstration", () => {
  it("ont des identifiants et des slugs uniques", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it("ont des prix entiers et positifs en FCFA", () => {
    for (const product of products) {
      expect(Number.isInteger(product.price)).toBe(true);
      expect(product.price).toBeGreaterThan(0);
    }
  });
});

describe("normalizeText", () => {
  it("ignore les accents et la casse", () => {
    expect(normalizeText("  Écouteurs ")).toBe("ecouteurs");
  });
});

describe("parseFilters", () => {
  it("lit des paramètres valides", () => {
    const filters = parseFilters({ q: "galaxy", categorie: "smartphones", prixMax: "200000", tri: "prix-croissant", dispo: "1" });
    expect(filters).toEqual({
      query: "galaxy",
      category: "smartphones",
      brand: undefined,
      maxPrice: 200000,
      inStockOnly: true,
      sort: "prix-croissant",
    });
  });

  it("ignore les valeurs inconnues ou malveillantes", () => {
    const filters = parseFilters({ categorie: "<script>", marque: "Inconnue", prixMax: "-5", tri: "drop table" });
    expect(filters.category).toBeUndefined();
    expect(filters.brand).toBeUndefined();
    expect(filters.maxPrice).toBeUndefined();
    expect(filters.sort).toBe("pertinence");
  });
});

describe("filterProducts", () => {
  const base = parseFilters({});

  it("recherche sans tenir compte des accents", () => {
    const result = filterProducts(products, { ...base, query: "ecouteurs" });
    expect(result.map((p) => p.slug)).toContain("oraimo-freepods-4");
  });

  it("combine catégorie, prix maximum et stock", () => {
    const result = filterProducts(products, { ...base, category: "smartphones", maxPrice: 160000, inStockOnly: true });
    expect(result.length).toBeGreaterThan(0);
    for (const product of result) {
      expect(product.category).toBe("smartphones");
      expect(product.price).toBeLessThanOrEqual(160000);
      expect(product.stock).toBeGreaterThan(0);
    }
  });

  it("trie par prix croissant", () => {
    const prices = filterProducts(products, { ...base, sort: "prix-croissant" }).map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("ne modifie pas la liste d'origine", () => {
    const before = products.map((p) => p.id);
    filterProducts(products, { ...base, sort: "nom" });
    expect(products.map((p) => p.id)).toEqual(before);
  });
});
