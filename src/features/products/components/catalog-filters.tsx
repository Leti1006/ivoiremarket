import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFCFA } from "@/lib/format";
import { NativeSelect } from "@/components/ui/native-select";
import { CATEGORIES } from "@/types";
import { CATEGORY_LABELS, SORT_OPTIONS, getBrands, type ProductFilters } from "@/features/products/catalog";

const PRICE_STEPS = [25000, 100000, 200000, 350000];

/**
 * Filtres du catalogue sous forme de formulaire GET : les critères sont dans l'URL,
 * donc partageables, et le filtrage est fait côté serveur (pas de JavaScript requis).
 */
export function CatalogFilters({ filters }: { filters: ProductFilters }) {
  const brands = getBrands();
  return (
    <form action="/produits" className="grid gap-4 rounded-xl border bg-card p-4 shadow-sm" aria-label="Filtrer le catalogue">
      <p className="flex items-center gap-2 font-semibold">
        <SlidersHorizontal className="size-4" aria-hidden="true" /> Filtres
      </p>

      <div className="grid gap-1.5">
        <label htmlFor="filter-q" className="text-sm font-medium">
          Recherche
        </label>
        <Input id="filter-q" name="q" type="search" defaultValue={filters.query} placeholder="Ex. : Samsung, écouteurs" />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="filter-category" className="text-sm font-medium">
          Catégorie
        </label>
        <NativeSelect id="filter-category" name="categorie" defaultValue={filters.category ?? ""}>
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="filter-brand" className="text-sm font-medium">
          Marque
        </label>
        <NativeSelect id="filter-brand" name="marque" defaultValue={filters.brand ?? ""}>
          <option value="">Toutes les marques</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="filter-price" className="text-sm font-medium">
          Prix maximum
        </label>
        <NativeSelect id="filter-price" name="prixMax" defaultValue={filters.maxPrice?.toString() ?? ""}>
          <option value="">Sans limite</option>
          {PRICE_STEPS.map((step) => (
            <option key={step} value={step}>
              {formatFCFA(step)}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="filter-sort" className="text-sm font-medium">
          Trier par
        </label>
        <NativeSelect id="filter-sort" name="tri" defaultValue={filters.sort}>
          {Object.entries(SORT_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="dispo"
          value="1"
          defaultChecked={filters.inStockOnly}
          className="size-4 accent-[var(--primary)]"
        />
        En stock uniquement
      </label>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          Appliquer
        </Button>
        <Button asChild variant="outline">
          <Link href="/produits">Réinitialiser</Link>
        </Button>
      </div>
    </form>
  );
}
