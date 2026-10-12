import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { CATEGORY_LABELS } from "@/features/products/catalog";
import { Price } from "./price";
import { ConditionBadge, StockBadge } from "./stock-badge";

/** Carte produit du catalogue (composant serveur, aucun JavaScript envoyé). */
export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
      data-testid="product-card"
    >
      <div className="relative aspect-square bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform group-hover:scale-[1.02]"
          unoptimized
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
            -{discount} %
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {product.brand} · {CATEGORY_LABELS[product.category]}
        </p>
        <h3 className="font-semibold leading-snug">
          {/* Le lien couvre toute la carte grâce au pseudo-élément. */}
          <Link href={`/produits/${product.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <StockBadge product={product} />
          <ConditionBadge product={product} />
        </div>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
      </div>
    </article>
  );
}
