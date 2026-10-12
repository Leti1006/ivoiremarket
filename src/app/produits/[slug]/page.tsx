import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { formatFCFA } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEES } from "@/features/cart/cart-calculations";
import {
  CATEGORY_LABELS,
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/features/products/catalog";
import { AddToCart } from "@/features/products/components/add-to-cart";
import { Price } from "@/features/products/components/price";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ConditionBadge, StockBadge } from "@/features/products/components/stock-badge";

/** Toutes les fiches produits sont générées à la compilation (pages statiques, rapides et bien référencées). */
export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produits/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: product.name,
    description: `${product.shortDescription} ${formatFCFA(product.price)}.`,
    openGraph: { title: product.name, description: product.shortDescription, images: [product.image] },
  };
}

export default async function ProductPage({ params }: PageProps<"/produits/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  // Données structurées schema.org pour les moteurs de recherche.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    image: product.image,
    itemCondition:
      product.condition === "neuf" ? "https://schema.org/NewCondition" : "https://schema.org/RefurbishedCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "XOF",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="grid gap-12">
      <script
        type="application/ld+json"
        // Le contenu vient du catalogue interne ; "<" est échappé par précaution.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1">
          <li className="flex items-center gap-1">
            <Link href="/" className="hover:text-primary">
              Accueil
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
          </li>
          <li className="flex items-center gap-1">
            <Link href={`/produits?categorie=${product.category}`} className="hover:text-primary">
              {CATEGORY_LABELS[product.category]}
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
          </li>
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
          <Image src={product.image} alt={product.name} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" unoptimized />
        </div>

        <div className="grid content-start gap-5">
          <div className="grid gap-2">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{product.brand}</p>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex flex-wrap gap-2">
              <StockBadge product={product} />
              <ConditionBadge product={product} />
            </div>
          </div>
          <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
          <p className="text-muted-foreground">{product.description}</p>

          <AddToCart product={product} />

          <ul className="grid gap-2 rounded-xl border bg-card p-4 text-sm">
            <li className="flex gap-2">
              <Truck className="size-4 shrink-0 text-primary" aria-hidden="true" />
              Livraison {formatFCFA(SHIPPING_FEES.abidjan)} à Abidjan, {formatFCFA(SHIPPING_FEES.interieur)} dans
              l&apos;intérieur, offerte dès {formatFCFA(FREE_SHIPPING_THRESHOLD)}.
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {product.warrantyMonths > 0 ? `Garantie ${product.warrantyMonths} mois.` : "Sans garantie constructeur."}
            </li>
          </ul>
        </div>
      </div>

      <section aria-labelledby="specs-title" className="grid gap-4">
        <h2 id="specs-title" className="text-2xl font-bold">
          Caractéristiques
        </h2>
        <table className="w-full overflow-hidden rounded-xl border bg-card text-sm">
          <tbody>
            {product.specs.map((spec) => (
              <tr key={spec.label} className="border-b last:border-0">
                <th scope="row" className="w-1/3 bg-muted/60 px-4 py-3 text-left font-medium">
                  {spec.label}
                </th>
                <td className="px-4 py-3">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="grid gap-4">
          <h2 id="related-title" className="text-2xl font-bold">
            Vous aimerez aussi
          </h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
