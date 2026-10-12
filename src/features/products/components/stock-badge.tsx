import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";

export function StockBadge({ product }: { product: Product }) {
  if (product.stock <= 0) return <Badge variant="destructive">Rupture de stock</Badge>;
  if (product.stock <= 5) return <Badge variant="secondary">Plus que {product.stock} en stock</Badge>;
  return <Badge variant="success">En stock</Badge>;
}

export function ConditionBadge({ product }: { product: Product }) {
  return product.condition === "reconditionne" ? <Badge variant="outline">Reconditionné</Badge> : null;
}
