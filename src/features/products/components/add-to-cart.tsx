"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheck, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maxQuantityFor } from "@/features/cart/cart-calculations";
import { cartActions, useCartItems, useHydrated } from "@/features/cart/cart-store";
import { QuantityControl } from "@/features/cart/components/quantity-control";
import type { Product } from "@/types";

/** Seule partie interactive de la fiche produit : choix de la quantité et ajout au panier. */
export function AddToCart({ product }: { product: Product }) {
  const items = useCartItems();
  const hydrated = useHydrated();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const remaining = maxQuantityFor(product) - inCart;

  if (product.stock <= 0) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        Indisponible pour le moment
      </Button>
    );
  }

  const handleAdd = () => {
    cartActions.add(product.id, quantity);
    setAdded(true);
    setQuantity(1);
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityControl
          label={`Quantité de ${product.name}`}
          value={Math.min(quantity, Math.max(remaining, 1))}
          min={1}
          max={Math.max(remaining, 1)}
          onChange={setQuantity}
          disabled={!hydrated || remaining <= 0}
        />
        <Button size="lg" onClick={handleAdd} disabled={!hydrated || remaining <= 0} className="flex-1 sm:flex-none">
          <ShoppingCart aria-hidden="true" />
          Ajouter au panier
        </Button>
      </div>
      <p role="status" aria-live="polite" className="min-h-6 text-sm">
        {remaining <= 0 && hydrated ? (
          <span className="text-muted-foreground">Quantité maximale atteinte pour cet article.</span>
        ) : added ? (
          <span className="inline-flex items-center gap-1.5 text-success">
            <CircleCheck className="size-4" aria-hidden="true" />
            Ajouté au panier.{" "}
            <Link href="/panier" className="font-medium underline underline-offset-4">
              Voir le panier
            </Link>
          </span>
        ) : null}
      </p>
    </div>
  );
}
