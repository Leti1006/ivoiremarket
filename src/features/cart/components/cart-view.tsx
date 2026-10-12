"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFCFA } from "@/lib/format";
import { SHIPPING_FEES } from "@/features/cart/cart-calculations";
import { useHydrated } from "@/features/cart/cart-store";
import { useCart } from "@/features/cart/use-cart";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";

/** Contenu de la page panier : il dépend de localStorage, donc rendu dans le navigateur. */
export function CartView() {
  const hydrated = useHydrated();
  const cart = useCart("abidjan");

  if (!hydrated) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-label="Chargement du panier">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <ShoppingBag className="size-12 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-xl font-semibold">Votre panier est vide</h2>
        <p className="max-w-sm text-muted-foreground">Parcourez le catalogue pour trouver votre prochain téléphone ou accessoire.</p>
        <Button asChild>
          <Link href="/produits">Voir le catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section aria-labelledby="cart-items-title">
        <h2 id="cart-items-title" className="sr-only">
          Articles
        </h2>
        <ul className="divide-y rounded-xl border bg-card px-4">
          {cart.lines.map((line) => (
            <CartLineItem key={line.product.id} line={line} />
          ))}
        </ul>
        <Button variant="link" className="mt-2 px-0 text-muted-foreground" onClick={() => cart.clear()}>
          Vider le panier
        </Button>
      </section>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <CartSummary totals={cart} zone="abidjan" />
          <p className="mt-3 text-xs text-muted-foreground">
            Livraison estimée pour Abidjan ({formatFCFA(SHIPPING_FEES.abidjan)}). L&apos;intérieur du pays (
            {formatFCFA(SHIPPING_FEES.interieur)}) se choisit à l&apos;étape suivante.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild size="lg" className="w-full">
            <Link href="/commande">
              Passer la commande <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
