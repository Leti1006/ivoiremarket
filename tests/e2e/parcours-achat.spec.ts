import { expect, test, type Page } from "@playwright/test";

const NBSP = " ";
const fcfa = (value: string) => value.replace(/ /g, NBSP) + `${NBSP}FCFA`;

/**
 * Avec Cache Components, Next.js garde la page précédente montée mais cachée (<Activity>)
 * pour accélérer le retour arrière : on ne cible donc que les éléments visibles.
 */
const byTestId = (page: Page, id: string) => page.getByTestId(id).filter({ visible: true });

async function openProduct(page: Page, name: string) {
  await page.getByRole("link", { name, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
}

test.describe("Parcours d'achat", () => {
  test("de la recherche à la confirmation de commande", async ({ page }) => {
    // 1. Recherche depuis l'en-tête
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Les meilleurs téléphones");
    await page.getByRole("searchbox", { name: "Rechercher un produit" }).fill("infinix");
    await page.getByRole("searchbox", { name: "Rechercher un produit" }).press("Enter");
    await expect(page).toHaveURL(/\/produits\?q=infinix/);
    await expect(byTestId(page, "results-count")).toHaveText(/1 produit pour « infinix »/);

    // 2. Fiche produit et ajout au panier (quantité 2)
    await openProduct(page, "Infinix Hot 50");
    await expect(page.getByText(fcfa("89 000")).first()).toBeVisible();
    await page.getByRole("button", { name: "Augmenter la quantité" }).click();
    await page.getByRole("button", { name: "Ajouter au panier" }).click();
    await expect(page.getByText("Ajouté au panier.")).toBeVisible();
    await expect(byTestId(page, "cart-count")).toHaveText("2");

    // 3. Un deuxième article depuis le catalogue filtré
    await page.goto("/produits?categorie=accessoires");
    await openProduct(page, "Câble USB-C tressé 2 m");
    await page.getByRole("button", { name: "Ajouter au panier" }).click();
    await expect(byTestId(page, "cart-count")).toHaveText("3");

    // 4. Panier : totaux, modification de quantité, persistance après actualisation
    await byTestId(page, "cart-link").click();
    await expect(page.getByRole("heading", { name: "Mon panier" })).toBeVisible();
    await expect(byTestId(page, "cart-line")).toHaveCount(2);
    await expect(byTestId(page, "cart-subtotal")).toHaveText(fcfa("182 500"));
    await expect(byTestId(page, "cart-shipping")).toHaveText("Offerte");

    const infinixLine = byTestId(page, "cart-line").filter({ hasText: "Infinix Hot 50" });
    await infinixLine.getByRole("button", { name: "Diminuer la quantité" }).click();
    await expect(byTestId(page, "cart-subtotal")).toHaveText(fcfa("93 500"));
    await expect(byTestId(page, "cart-shipping")).toHaveText(fcfa("1 500"));
    await expect(byTestId(page, "cart-total")).toHaveText(fcfa("95 000"));

    await page.reload();
    await expect(byTestId(page, "cart-line")).toHaveCount(2);
    await expect(byTestId(page, "cart-total")).toHaveText(fcfa("95 000"));

    // 5. Commande : erreurs de validation puis saisie correcte
    await page.getByRole("link", { name: "Passer la commande" }).click();
    await expect(page.getByRole("heading", { name: "Finaliser ma commande" })).toBeVisible();
    await page.getByRole("button", { name: "Valider la commande simulée" }).click();
    await expect(page.getByText("Indiquez votre nom complet")).toBeVisible();
    await expect(page.getByText("Numéro ivoirien invalide")).toBeVisible();
    await expect(page.getByLabel("Nom complet")).toHaveAttribute("aria-invalid", "true");

    await page.getByLabel("Nom complet").fill("Awa Koné");
    await page.getByLabel("Téléphone").fill("07 08 09 10 11");
    await page.getByLabel("Intérieur du pays").check();
    await expect(byTestId(page, "cart-shipping")).toHaveText(fcfa("3 500"));
    await expect(byTestId(page, "cart-total")).toHaveText(fcfa("97 000"));
    await page.getByLabel("Ville ou commune").fill("Bouaké");
    await page.getByLabel("Adresse ou repère").fill("Quartier Commerce, près du grand marché");
    await page.getByLabel(/commande simulée \(projet universitaire\)/).check();
    await page.getByRole("button", { name: "Valider la commande simulée" }).click();

    // 6. Confirmation et panier vidé
    await expect(page).toHaveURL(/\/commande\/confirmation$/);
    await expect(page.getByRole("heading", { name: "Merci Awa Koné !" })).toBeVisible();
    await expect(byTestId(page, "order-reference")).toHaveText(/^IM-\d{8}-[0-9A-F]{6}$/);
    await expect(byTestId(page, "cart-total")).toHaveText(fcfa("97 000"));
    await expect(page.getByText("n'est enregistrée nulle part")).toBeVisible();
    await expect(byTestId(page, "cart-count")).toHaveCount(0);
  });

  test("un produit en rupture ne peut pas être ajouté", async ({ page }) => {
    await page.goto("/produits/xiaomi-redmi-note-14");
    await expect(page.getByText("Rupture de stock", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Indisponible pour le moment" })).toBeDisabled();
  });
});

test.describe("Catalogue et pages d'erreur", () => {
  test("les filtres réduisent la liste et un mauvais mot-clé affiche un état vide", async ({ page }) => {
    await page.goto("/produits");
    await page.getByLabel("Catégorie").selectOption("tablettes");
    await page.getByRole("button", { name: "Appliquer" }).click();
    await expect(page).toHaveURL(/categorie=tablettes/);
    await expect(byTestId(page, "product-card")).toHaveCount(2);

    await page.goto("/produits?q=introuvable123");
    await expect(page.getByText("Aucun produit ne correspond à votre recherche.")).toBeVisible();
  });

  test("le panier vide et une fiche inconnue sont gérés", async ({ page }) => {
    await page.goto("/panier");
    await expect(page.getByRole("heading", { name: "Votre panier est vide" })).toBeVisible();
    await page.goto("/produits/produit-inexistant");
    await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
  });
});
