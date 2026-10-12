import Link from "next/link";
import { ArrowRight, BadgeCheck, Cable, Headphones, ShieldCheck, Smartphone, Tablet, Truck, Watch, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFCFA } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart/cart-calculations";
import { CATEGORY_LABELS, getFeaturedProducts } from "@/features/products/catalog";
import { ProductGrid } from "@/features/products/components/product-grid";
import type { Category } from "@/types";

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  smartphones: Smartphone,
  tablettes: Tablet,
  audio: Headphones,
  montres: Watch,
  accessoires: Cable,
};

const BENEFITS = [
  { icon: Truck, title: "Livraison rapide", text: `À Abidjan en 24 h, offerte dès ${formatFCFA(FREE_SHIPPING_THRESHOLD)}.` },
  { icon: BadgeCheck, title: "Produits garantis", text: "Neufs ou reconditionnés et testés, avec garantie." },
  { icon: Wallet, title: "Paiement à la livraison", text: "En espèces ou Mobile Money, sans carte bancaire." },
  { icon: ShieldCheck, title: "Données protégées", text: "Aucune donnée bancaire n'est demandée sur le site." },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <div className="grid gap-14">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-700 via-orange-600 to-emerald-700 px-6 py-14 text-white sm:px-12 sm:py-20">
        <div className="max-w-2xl space-y-5">
          <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-medium">Nouveautés 2026 disponibles</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
            Les meilleurs téléphones, au juste prix en FCFA.
          </h1>
          <p className="text-lg text-white/90">
            Smartphones, tablettes et accessoires sélectionnés, livrés partout en Côte d&apos;Ivoire et payables à la
            livraison.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-white text-orange-800 hover:bg-white/90">
              <Link href="/produits">
                Voir le catalogue <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/produits?categorie=smartphones">Smartphones</Link>
            </Button>
          </div>
        </div>
        <Smartphone className="absolute -right-10 -bottom-10 hidden size-80 text-white/10 md:block" aria-hidden="true" />
      </section>

      <section aria-labelledby="categories-title" className="grid gap-5">
        <h2 id="categories-title" className="text-2xl font-bold">
          Acheter par catégorie
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="list">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((category) => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <li key={category}>
                <Link
                  href={`/produits?categorie=${category}`}
                  className="flex h-full flex-col items-center gap-3 rounded-xl border bg-card p-5 text-center font-medium shadow-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-8 text-primary" aria-hidden="true" />
                  {CATEGORY_LABELS[category]}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="featured-title" className="grid gap-5">
        <div className="flex items-end justify-between gap-4">
          <h2 id="featured-title" className="text-2xl font-bold">
            Sélection du moment
          </h2>
          <Link href="/produits" className="text-sm font-medium text-primary hover:underline">
            Tout voir
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>

      <section aria-label="Nos engagements" className="grid gap-4 rounded-2xl bg-secondary/60 p-6 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <Icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
