import Link from "next/link";
import { Search, Smartphone } from "lucide-react";
import { CartLink } from "@/features/cart/components/cart-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight" aria-label="IvoireMarket, accueil">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Smartphone className="size-5" aria-hidden="true" />
          </span>
          <span>
            Ivoire<span className="text-primary">Market</span>
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link href="/produits" className="hover:text-primary">
            Catalogue
          </Link>
          <Link href="/produits?categorie=smartphones" className="hover:text-primary">
            Smartphones
          </Link>
          <Link href="/produits?categorie=accessoires" className="hover:text-primary">
            Accessoires
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:order-last">
          <CartLink />
        </div>

        {/* Recherche : simple formulaire GET, utilisable même sans JavaScript. */}
        <form action="/produits" role="search" className="order-last w-full md:order-none md:ml-auto md:w-72">
          <label htmlFor="header-search" className="sr-only">
            Rechercher un produit
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Rechercher un téléphone, une marque…"
              className="h-10 w-full rounded-full border border-input bg-card pr-4 pl-9 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
