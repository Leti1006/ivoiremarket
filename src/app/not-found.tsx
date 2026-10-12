import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <p className="text-muted-foreground">Le produit ou la page demandée n&apos;existe pas ou a été retiré.</p>
      <Button asChild>
        <Link href="/produits">Retour au catalogue</Link>
      </Button>
    </div>
  );
}
