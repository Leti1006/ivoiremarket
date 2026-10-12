const NBSP = " ";

/**
 * Formate un montant entier en francs CFA, par exemple 125000 -> "125 000 FCFA".
 * Le formatage est fait à la main pour produire exactement le même texte
 * côté serveur et côté navigateur (pas de différence d'hydratation liée à Intl).
 */
export function formatFCFA(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${sign}${digits}${NBSP}FCFA`;
}
