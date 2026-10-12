import { formatFCFA } from "@/lib/format";
import { DELIVERY_ZONE_LABELS, FREE_SHIPPING_THRESHOLD } from "@/features/cart/cart-calculations";
import type { CartTotals, DeliveryZone } from "@/types";

interface CartSummaryProps {
  totals: Pick<CartTotals, "itemCount" | "subtotal" | "shipping" | "total">;
  zone: DeliveryZone;
}

/** Récapitulatif des montants, partagé par le panier et la page de commande. */
export function CartSummary({ totals, zone }: CartSummaryProps) {
  const missingForFreeShipping = FREE_SHIPPING_THRESHOLD - totals.subtotal;
  return (
    <dl className="grid gap-2 text-sm" data-testid="cart-summary">
      <div className="flex justify-between">
        <dt>
          Sous-total ({totals.itemCount} article{totals.itemCount > 1 ? "s" : ""})
        </dt>
        <dd className="font-medium tabular-nums" data-testid="cart-subtotal">
          {formatFCFA(totals.subtotal)}
        </dd>
      </div>
      <div className="flex justify-between">
        <dt>Livraison ({DELIVERY_ZONE_LABELS[zone]})</dt>
        <dd className="font-medium tabular-nums" data-testid="cart-shipping">
          {totals.shipping === 0 ? "Offerte" : formatFCFA(totals.shipping)}
        </dd>
      </div>
      {missingForFreeShipping > 0 && (
        <div className="text-xs text-muted-foreground">
          <dt className="sr-only">Livraison offerte</dt>
          <dd>Plus que {formatFCFA(missingForFreeShipping)} pour la livraison offerte.</dd>
        </div>
      )}
      <div className="mt-1 flex justify-between border-t pt-3 text-base">
        <dt className="font-semibold">Total TTC</dt>
        <dd className="font-bold tabular-nums" data-testid="cart-total">
          {formatFCFA(totals.total)}
        </dd>
      </div>
    </dl>
  );
}
