"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/features/cart/use-cart";
import { useHydrated } from "@/features/cart/cart-store";

/** Icône du panier avec le nombre d'articles (lu dans le navigateur). */
export function CartLink() {
  const { itemCount } = useCart();
  const hydrated = useHydrated();
  const count = hydrated ? itemCount : 0;
  return (
    <Link
      href="/panier"
      className="relative inline-flex size-10 items-center justify-center rounded-full border bg-card hover:bg-secondary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      aria-label={count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier vide"}
      data-testid="cart-link"
    >
      <ShoppingCart className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground"
          data-testid="cart-count"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
