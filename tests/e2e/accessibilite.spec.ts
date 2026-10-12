import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** Audit automatique WCAG 2.2 niveau AA (axe-core) sur les pages principales. */
const PAGES = [
  { name: "accueil", path: "/" },
  { name: "catalogue", path: "/produits?categorie=smartphones" },
  { name: "fiche produit", path: "/produits/samsung-galaxy-a56-5g" },
  { name: "panier vide", path: "/panier" },
];

for (const { name, path } of PAGES) {
  test(`aucune violation d'accessibilité : ${name}`, async ({ page }) => {
    await page.goto(path);
    await page.locator("main h1").first().waitFor();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.impact}) : ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
    expect(summary).toEqual([]);
  });
}

test("aucune violation d'accessibilité : formulaire de commande avec erreurs", async ({ page }) => {
  await page.goto("/produits/infinix-hot-50");
  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await page.goto("/commande");
  await page.getByRole("button", { name: "Valider la commande simulée" }).click();
  await expect(page.getByText("Indiquez votre nom complet").first()).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
});
