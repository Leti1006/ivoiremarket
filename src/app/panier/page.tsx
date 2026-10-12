import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";

export const metadata: Metadata = {
  title: "Mon panier",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold">Mon panier</h1>
      <CartView />
    </div>
  );
}
