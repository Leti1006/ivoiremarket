import { z } from "zod";

/** Retire espaces, points et tirets d'un numéro de téléphone saisi. */
export function normalizePhone(value: string): string {
  return value.replace(/[\s.\-()]/g, "");
}

/** Numéros ivoiriens à 10 chiffres (01, 05, 07 mobiles ; 21, 25, 27 fixes), avec ou sans +225. */
const IVORIAN_PHONE = /^(?:\+225|00225)?(?:01|05|07|21|25|27)\d{8}$/;

/**
 * Schéma du formulaire de commande, partagé entre le navigateur (confort de saisie)
 * et le serveur (validation qui fait foi).
 */
export const checkoutSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Indiquez votre nom complet (3 caractères minimum).")
    .max(80, "Le nom ne doit pas dépasser 80 caractères."),
  phone: z
    .string()
    .trim()
    .refine((value) => IVORIAN_PHONE.test(normalizePhone(value)), {
      message: "Numéro ivoirien invalide (10 chiffres, par exemple 07 08 09 10 11).",
    }),
  email: z
    .string()
    .trim()
    .max(120, "L'adresse e-mail ne doit pas dépasser 120 caractères.")
    .refine((value) => value === "" || z.email().safeParse(value).success, { message: "Adresse e-mail invalide." }),
  deliveryZone: z.enum(["abidjan", "interieur"], { message: "Choisissez une zone de livraison." }),
  city: z
    .string()
    .trim()
    .min(2, "Indiquez votre ville ou commune.")
    .max(60, "La ville ne doit pas dépasser 60 caractères."),
  address: z
    .string()
    .trim()
    .min(5, "Indiquez une adresse ou un repère de livraison.")
    .max(200, "L'adresse ne doit pas dépasser 200 caractères."),
  paymentMethod: z.enum(["livraison", "mobile-money"], { message: "Choisissez un mode de paiement." }),
  notes: z.string().trim().max(300, "La remarque ne doit pas dépasser 300 caractères."),
  acceptTerms: z.boolean().refine((value) => value, {
    message: "Vous devez confirmer avoir compris que la commande est simulée.",
  }),
  /** Champ piège invisible : un humain le laisse vide, un robot le remplit souvent. */
  website: z.string().max(0),
});

export type CheckoutFormValues = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

export const orderRequestSchema = z.object({
  customer: checkoutSchema,
  items: z
    .array(z.object({ productId: z.string().min(1).max(40), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Votre panier est vide.")
    .max(50),
});

export type OrderRequest = z.input<typeof orderRequestSchema>;

export const PAYMENT_METHOD_LABELS = {
  livraison: "Paiement à la livraison (espèces)",
  "mobile-money": "Mobile Money à la livraison (simulé)",
} as const;
