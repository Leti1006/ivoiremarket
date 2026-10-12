"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantityControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/** Sélecteur de quantité accessible (boutons − / + et valeur annoncée aux lecteurs d'écran). */
export function QuantityControl({ label, value, min, max, onChange, disabled }: QuantityControlProps) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-md border bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Diminuer la quantité"
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= min}
      >
        <Minus aria-hidden="true" />
      </Button>
      <output className="w-10 text-center font-semibold tabular-nums" aria-live="polite" data-testid="quantity-value">
        {value}
      </output>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Augmenter la quantité"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
