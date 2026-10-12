import { products } from "@/data/products";
import { CATEGORIES, type Category, type Product } from "@/types";

export const CATEGORY_LABELS: Record<Category, string> = {
  smartphones: "Smartphones",
  tablettes: "Tablettes",
  audio: "Audio",
  montres: "Montres connectées",
  accessoires: "Accessoires",
};

export const SORT_OPTIONS = {
  pertinence: "Pertinence",
  "prix-croissant": "Prix croissant",
  "prix-decroissant": "Prix décroissant",
  nom: "Nom (A à Z)",
} as const;
export type SortOption = keyof typeof SORT_OPTIONS;

/** Critères de recherche du catalogue, déjà validés. */
export interface ProductFilters {
  query: string;
  category?: Category;
  brand?: string;
  maxPrice?: number;
  inStockOnly: boolean;
  sort: SortOption;
}

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured);
}

export function getBrands(): string[] {
  return [...new Set(products.map((product) => product.brand))].sort((a, b) => a.localeCompare(b, "fr"));
}

/** Produits de la même catégorie, pour les suggestions de la fiche produit. */
export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter((candidate) => candidate.category === product.category && candidate.id !== product.id)
    .slice(0, limit);
}

/** Retire les accents et met en minuscules pour une recherche tolérante ("ecouteurs" trouve "écouteurs"). */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

type SearchParamValue = string | string[] | undefined;

function firstValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Transforme les paramètres d'URL (non fiables) en filtres valides.
 * Toute valeur inconnue est ignorée plutôt que de provoquer une erreur.
 */
export function parseFilters(params: Record<string, SearchParamValue>): ProductFilters {
  const query = (firstValue(params.q) ?? "").slice(0, 80);
  const categoryParam = firstValue(params.categorie);
  const category = CATEGORIES.find((value) => value === categoryParam);
  const brandParam = firstValue(params.marque);
  const brand = getBrands().find((value) => value === brandParam);
  const maxPriceValue = Number(firstValue(params.prixMax));
  const maxPrice = Number.isInteger(maxPriceValue) && maxPriceValue > 0 ? maxPriceValue : undefined;
  const sortParam = firstValue(params.tri);
  const sort: SortOption = sortParam && sortParam in SORT_OPTIONS ? (sortParam as SortOption) : "pertinence";
  const inStockOnly = firstValue(params.dispo) === "1";
  return { query, category, brand, maxPrice, inStockOnly, sort };
}

export function filterProducts(list: readonly Product[], filters: ProductFilters): Product[] {
  const terms = normalizeText(filters.query).split(/\s+/).filter(Boolean);

  const result = list.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.brand && product.brand !== filters.brand) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    if (filters.inStockOnly && product.stock <= 0) return false;
    if (terms.length === 0) return true;
    const haystack = normalizeText(
      [product.name, product.brand, CATEGORY_LABELS[product.category], product.shortDescription].join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });

  switch (filters.sort) {
    case "prix-croissant":
      return result.sort((a, b) => a.price - b.price);
    case "prix-decroissant":
      return result.sort((a, b) => b.price - a.price);
    case "nom":
      return result.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    default:
      return result;
  }
}
