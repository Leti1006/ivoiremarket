import Link from "next/link";
import { Info } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-base font-bold">
            Ivoire<span className="text-primary">Market</span>
          </p>
          <p className="text-muted-foreground">Téléphones, tablettes et accessoires livrés partout en Côte d&apos;Ivoire.</p>
        </div>
        <nav aria-label="Liens du pied de page" className="flex flex-col gap-2">
          <Link href="/produits" className="hover:text-primary">
            Tout le catalogue
          </Link>
          <Link href="/produits?categorie=tablettes" className="hover:text-primary">
            Tablettes
          </Link>
          <Link href="/panier" className="hover:text-primary">
            Mon panier
          </Link>
        </nav>
        <p className="flex gap-2 rounded-lg border bg-card p-3 text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <span>
            Projet universitaire de démonstration : les produits, les stocks et les commandes sont fictifs. Aucun paiement
            n&apos;est encaissé et aucune donnée n&apos;est enregistrée.
          </span>
        </p>
      </div>
      <p className="border-t py-4 text-center text-xs text-muted-foreground">© 2026 IvoireMarket. Prix en francs CFA (FCFA), TTC.</p>
    </footer>
  );
}
