import type { Metadata } from "next";
import { Info } from "lucide-react";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";

export const metadata: Metadata = {
  title: "Commande",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold">Finaliser ma commande</h1>
      <p className="flex gap-2 rounded-lg border border-primary/30 bg-secondary p-4 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        Commande simulée : le formulaire est vérifié par le serveur, mais aucune commande n&apos;est enregistrée et aucun
        paiement n&apos;est effectué.
      </p>
      <CheckoutForm />
    </div>
  );
}
