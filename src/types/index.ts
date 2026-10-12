/** Catégories du catalogue IvoireMarket. */
export const CATEGORIES = ["smartphones", "tablettes", "audio", "montres", "accessoires"] as const;
export type Category = (typeof CATEGORIES)[number];

/** État de l'appareil vendu. */
export type ProductCondition = "neuf" | "reconditionne";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: Category;
  condition: ProductCondition;
  /** Prix TTC en FCFA (entier, le franc CFA n'a pas de centimes). */
  price: number;
  /** Ancien prix barré, s'il y a une promotion. */
  compareAtPrice?: number;
  stock: number;
  shortDescription: string;
  description: string;
  image: string;
  /** Garantie en mois. */
  warrantyMonths: number;
  featured: boolean;
  specs: ProductSpec[];
}

/** Ce qui est conservé dans le navigateur : uniquement l'identifiant et la quantité. */
export interface CartItem {
  productId: string;
  quantity: number;
}

/** Ligne de panier calculée à partir du catalogue (le prix ne vient jamais du navigateur). */
export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export type DeliveryZone = "abidjan" | "interieur";

export interface CartTotals {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export type PaymentMethod = "livraison" | "mobile-money";

/** Commande simulée renvoyée par le serveur : elle n'est enregistrée nulle part. */
export interface SimulatedOrder {
  reference: string;
  createdAt: string;
  customerName: string;
  phone: string;
  city: string;
  deliveryZone: DeliveryZone;
  paymentMethod: PaymentMethod;
  lines: { productId: string; name: string; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
}
