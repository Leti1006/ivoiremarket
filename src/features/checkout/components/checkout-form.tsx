"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatFCFA } from "@/lib/format";
import { DELIVERY_ZONE_LABELS, SHIPPING_FEES } from "@/features/cart/cart-calculations";
import { useHydrated } from "@/features/cart/cart-store";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { useCart } from "@/features/cart/use-cart";
import { placeOrder } from "@/features/checkout/actions";
import {
  PAYMENT_METHOD_LABELS,
  checkoutSchema,
  type CheckoutData,
  type CheckoutFormValues,
} from "@/features/checkout/checkout-schema";
import { saveLastOrder } from "@/features/checkout/last-order-storage";
import type { DeliveryZone, PaymentMethod } from "@/types";
import { FormField } from "./form-field";

const DEFAULT_VALUES: CheckoutFormValues = {
  fullName: "",
  phone: "",
  email: "",
  deliveryZone: "abidjan",
  city: "",
  address: "",
  paymentMethod: "livraison",
  notes: "",
  acceptTerms: false,
  website: "",
};

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const form = useForm<CheckoutFormValues, unknown, CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  const zone: DeliveryZone = useWatch({ control, name: "deliveryZone" });
  const cart = useCart(zone);

  const onSubmit = (data: CheckoutData) => {
    setServerError(null);
    startTransition(async () => {
      // Le serveur revalide tout et recalcule les prix : seuls les identifiants et quantités sont envoyés.
      const result = await placeOrder({ customer: data, items: cart.items });
      if (!result.ok) {
        setServerError(result.message);
        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          setError(field as FieldPath<CheckoutFormValues>, { message: messages[0] });
        }
        return;
      }
      setRedirecting(true);
      saveLastOrder(result.order);
      cart.clear();
      router.push("/commande/confirmation");
    });
  };

  if (!hydrated || redirecting) {
    return (
      <div className="grid gap-4" aria-busy="true" aria-label="Chargement">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <h2 className="text-xl font-semibold">Votre panier est vide</h2>
        <p className="mt-2 text-muted-foreground">Ajoutez au moins un article avant de passer commande.</p>
        <Button asChild className="mt-4">
          <Link href="/produits">Voir le catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_380px]" aria-label="Formulaire de commande">
      <div className="grid gap-6">
        <fieldset className="grid gap-4 rounded-xl border bg-card p-5">
          <legend className="px-1 text-lg font-semibold">Vos coordonnées</legend>
          <FormField id="fullName" label="Nom complet" error={errors.fullName?.message}>
            <Input id="fullName" autoComplete="name" {...register("fullName")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="phone" label="Téléphone" hint="Ex. : 07 08 09 10 11" error={errors.phone?.message}>
              <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" {...register("phone")} />
            </FormField>
            <FormField id="email" label="E-mail (facultatif)" error={errors.email?.message}>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="grid gap-4 rounded-xl border bg-card p-5">
          <legend className="px-1 text-lg font-semibold">Livraison</legend>
          <Controller
            control={control}
            name="deliveryZone"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                aria-label="Zone de livraison"
                className="sm:grid-cols-2"
              >
                {(Object.keys(SHIPPING_FEES) as DeliveryZone[]).map((value) => (
                  <Label
                    key={value}
                    htmlFor={`zone-${value}`}
                    className="cursor-pointer rounded-lg border p-3 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary"
                  >
                    <RadioGroupItem id={`zone-${value}`} value={value} />
                    <span className="flex flex-col gap-1">
                      <span className="font-medium">{DELIVERY_ZONE_LABELS[value]}</span>
                      <span className="text-muted-foreground">{formatFCFA(SHIPPING_FEES[value])}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="city" label="Ville ou commune" hint="Ex. : Cocody, Bouaké" error={errors.city?.message}>
              <Input id="city" autoComplete="address-level2" {...register("city")} />
            </FormField>
            <FormField id="address" label="Adresse ou repère" error={errors.address?.message}>
              <Input id="address" autoComplete="street-address" {...register("address")} />
            </FormField>
          </div>
          <FormField id="notes" label="Remarque pour le livreur (facultatif)" error={errors.notes?.message}>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </FormField>
        </fieldset>

        <fieldset className="grid gap-4 rounded-xl border bg-card p-5">
          <legend className="px-1 text-lg font-semibold">Paiement</legend>
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} aria-label="Mode de paiement">
                {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((value) => (
                  <Label key={value} htmlFor={`payment-${value}`} className="cursor-pointer font-normal">
                    <RadioGroupItem id={`payment-${value}`} value={value} />
                    {PAYMENT_METHOD_LABELS[value]}
                  </Label>
                ))}
              </RadioGroup>
            )}
          />
          <p className="flex gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            Aucune donnée bancaire n&apos;est demandée ni enregistrée sur ce site.
          </p>
        </fieldset>

        {/* Champ piège anti-robot : caché aux humains et aux lecteurs d'écran. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
          <label htmlFor="website">Ne pas remplir</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
        </div>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Votre commande</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ul className="grid gap-2 text-sm">
            {cart.lines.map((line) => (
              <li key={line.product.id} className="flex justify-between gap-3">
                <span>
                  {line.product.name} <span className="text-muted-foreground">× {line.quantity}</span>
                </span>
                <span className="tabular-nums">{formatFCFA(line.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <CartSummary totals={cart} zone={zone} />

          <div className="grid gap-1.5">
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 size-4 accent-[var(--primary)]"
                aria-invalid={errors.acceptTerms ? true : undefined}
                aria-describedby={errors.acceptTerms ? "acceptTerms-error" : undefined}
                {...register("acceptTerms")}
              />
              J&apos;ai compris qu&apos;il s&apos;agit d&apos;une commande simulée (projet universitaire) : rien ne sera livré
              ni facturé.
            </label>
            {errors.acceptTerms && (
              <p id="acceptTerms-error" className="text-sm text-destructive">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {serverError && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isPending}>
            {isPending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            Valider la commande simulée
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
