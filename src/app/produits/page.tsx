import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORY_LABELS, filterProducts, getAllProducts, parseFilters } from "@/features/products/catalog";
import { CatalogFilters } from "@/features/products/components/catalog-filters";
import { ProductGrid } from "@/features/products/components/product-grid";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Tous nos smartphones, tablettes, montres, produits audio et accessoires, avec recherche et filtres.",
};

export default function CatalogPage({ searchParams }: PageProps<"/produits">) {
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold">Catalogue</h1>
      {/* Les paramètres d'URL ne sont connus qu'à la requête : cette partie est rendue dans un Suspense. */}
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CatalogResults({ searchParams }: Pick<PageProps<"/produits">, "searchParams">) {
  const filters = parseFilters(await searchParams);
  const results = filterProducts(getAllProducts(), filters);
  const filterKey = JSON.stringify(filters);

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside>
        {/* La clé recrée le formulaire quand l'URL change, pour afficher les bonnes valeurs. */}
        <CatalogFilters key={filterKey} filters={filters} />
      </aside>
      <section aria-labelledby="results-title" className="grid content-start gap-4">
        <h2 id="results-title" className="text-sm text-muted-foreground" aria-live="polite" data-testid="results-count">
          {results.length} produit{results.length > 1 ? "s" : ""}
          {filters.category ? ` dans « ${CATEGORY_LABELS[filters.category]} »` : ""}
          {filters.query ? ` pour « ${filters.query} »` : ""}
        </h2>
        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
            <PackageX className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="font-semibold">Aucun produit ne correspond à votre recherche.</p>
            <p className="text-sm text-muted-foreground">Essayez un autre mot-clé ou retirez des filtres.</p>
            <Button asChild variant="outline">
              <Link href="/produits">Voir tous les produits</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]" aria-busy="true" aria-label="Chargement du catalogue">
      <Skeleton className="h-96" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}
