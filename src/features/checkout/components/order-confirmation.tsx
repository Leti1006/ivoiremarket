"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CircleCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFCFA } from "@/lib/format";
import { DELIVERY_ZONE_LABELS } from "@/features/cart/cart-calculations";
import { useHydrated } from "@/features/cart/cart-store";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { PAYMENT_METHOD_LABELS } from "@/features/checkout/checkout-schema";
import { getLastOrderSnapshot } from "@/features/checkout/last-order-storage";

const noopSubscribe = () => () => {};

export function OrderConfirmation() {
  const hydrated = useHydrated();
  const order = useSyncExternalStore(noopSubscribe, getLastOrderSnapshot, () => null);

  if (!hydrated) return <Skeleton className="h-72 w-full" />;

  if (!order) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Aucune commande récente</h1>
        <p className="mt-2 text-muted-foreground">Cette page s&apos;affiche après la validation d&apos;une commande.</p>
        <Button asChild className="mt-4">
          <Link href="/produits">Voir le catalogue</Link>
        </Button>
      </div>
    );
  }

  const itemCount = order.lines.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <CircleCheck className="size-14 text-success" aria-hidden="true" />
        <h1 className="text-3xl font-bold">Merci {order.customerName} !</h1>
        <p className="text-muted-foreground">
          Commande simulée n° <strong className="text-foreground" data-testid="order-reference">{order.reference}</strong>
        </p>
      </div>

      <p className="flex gap-2 rounded-lg border border-primary/30 bg-secondary p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        Ceci est une démonstration : la commande a été validée par le serveur, mais elle n&apos;est enregistrée nulle part,
        aucun paiement n&apos;a été effectué et rien ne sera livré.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ul className="grid gap-2 text-sm">
            {order.lines.map((line) => (
              <li key={line.productId} className="flex justify-between gap-3">
                <span>
                  {line.name} <span className="text-muted-foreground">× {line.quantity}</span>
                </span>
                <span className="tabular-nums">{formatFCFA(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <CartSummary totals={{ itemCount, subtotal: order.subtotal, shipping: order.shipping, total: order.total }} zone={order.deliveryZone} />
          <dl className="grid gap-1 text-sm text-muted-foreground">
            <div>
              <dt className="inline">Livraison : </dt>
              <dd className="inline">
                {order.city} ({DELIVERY_ZONE_LABELS[order.deliveryZone]})
              </dd>
            </div>
            <div>
              <dt className="inline">Paiement : </dt>
              <dd className="inline">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Button asChild size="lg" className="justify-self-center">
        <Link href="/produits">Continuer mes achats</Link>
      </Button>
    </div>
  );
}
