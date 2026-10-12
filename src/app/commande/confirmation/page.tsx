import type { Metadata } from "next";
import { OrderConfirmation } from "@/features/checkout/components/order-confirmation";

export const metadata: Metadata = {
  title: "Confirmation de commande",
  robots: { index: false },
};

export default function ConfirmationPage() {
  return <OrderConfirmation />;
}
