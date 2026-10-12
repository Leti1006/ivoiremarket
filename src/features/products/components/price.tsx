import { formatFCFA } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  size?: "default" | "lg";
  className?: string;
}

export function Price({ price, compareAtPrice, size = "default", className }: PriceProps) {
  const hasDiscount = compareAtPrice !== undefined && compareAtPrice > price;
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-bold text-foreground", size === "lg" ? "text-3xl" : "text-lg")}>{formatFCFA(price)}</span>
      {hasDiscount && (
        <span className="text-sm text-muted-foreground line-through">
          <span className="sr-only">Prix habituel : </span>
          {formatFCFA(compareAtPrice)}
        </span>
      )}
    </p>
  );
}
