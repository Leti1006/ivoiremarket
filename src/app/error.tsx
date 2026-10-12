"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Trace côté navigateur ; un service de suivi d'erreurs pourrait être branché ici.
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
      <p className="text-muted-foreground">Vous pouvez réessayer ou revenir au catalogue.</p>
      <Button onClick={() => retry()}>
        <RotateCcw aria-hidden="true" />
        Réessayer
      </Button>
    </div>
  );
}
