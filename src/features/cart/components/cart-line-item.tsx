"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFCFA } from "@/lib/format";
import { cartActions } from "@/features/cart/cart-store";
import { maxQuantityFor } from "@/features/cart/cart-calculations";
import type { CartLine } from "@/types";
import { QuantityControl } from "./quantity-control";

export function CartLineItem({ line }: { line: CartLine }) {
  const { product, quantity, lineTotal } = line;
  return (
    <li className="flex gap-4 py-4" data-testid="cart-line">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted sm:size-24">
        <Image src={product.image} alt="" fill sizes="96px" className="object-cover" unoptimized />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <Link href={`/produits/${product.slug}`} className="font-semibold hover:text-primary">
              {product.name}
            </Link>
            <p className="text-sm text-muted-foreground">{formatFCFA(product.price)} l&apos;unité</p>
          </div>
          <p className="font-semibold tabular-nums" data-testid="cart-line-total">
            {formatFCFA(lineTotal)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <QuantityControl
            label={`Quantité de ${product.name}`}
            value={quantity}
            min={1}
            max={maxQuantityFor(product)}
            onChange={(value) => cartActions.setQuantity(product.id, value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => cartActions.remove(product.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 aria-hidden="true" />
            Retirer<span className="sr-only"> {product.name} du panier</span>
          </Button>
        </div>
      </div>
    </li>
  );
}
