# Préparer la soutenance

## Démonstration (5 minutes)

1. Ouvrir `http://<IP_PUBLIQUE>` depuis un téléphone : montrer l'interface responsive.
2. Rechercher « ecouteurs » (sans accent) : la recherche tolère les accents.
3. Filtrer par catégorie et prix : les critères apparaissent dans l'URL (partageable).
4. Ouvrir une fiche, choisir 2 exemplaires, ajouter au panier ; montrer le compteur.
5. Montrer un produit en rupture : le bouton est désactivé.
6. Dans le panier, changer les quantités, puis **actualiser la page** : le panier est conservé.
7. Commander sans rien remplir : messages d'erreur à côté des champs.
8. Choisir « Intérieur du pays » : les frais de livraison changent ; valider ; montrer la référence.
9. Terminer sur le terminal : `npm run test` puis `npm run test:e2e`.

## Questions probables et réponses

- **Pourquoi Next.js App Router ?** Rendu serveur par défaut (pages rapides et bien référencées), Client Components seulement pour l'interactivité.
- **Où sont calculés les totaux ?** Une seule fonction, `calculateCart` (`src/features/cart/cart-calculations.ts`), utilisée par l'interface et par le serveur, testée unitairement.
- **Peut-on tricher sur le prix ?** Non : le navigateur n'envoie que des identifiants et des quantités ; le serveur relit les prix dans le catalogue et plafonne les quantités au stock.
- **Pourquoi pas de base de données ?** Choix assumé pour la V1 (coût, délai) ; la commande est explicitement simulée. Évolution : PostgreSQL géré + prestataire de paiement.
- **Pourquoi un build multi-étapes ?** L'image finale ne contient ni code source ni outils de compilation : plus petite et plus sûre. Elle tourne avec l'utilisateur `nextjs` (UID 1001), pas root.
- **Pourquoi le port 80 vers 3000 ?** Next.js écoute sur 3000 dans le conteneur ; le navigateur utilise 80 par défaut ; seul le port 80 est ouvert au public.

## Contributions réelles du groupe sur GitHub

Le professeur regarde l'historique : chaque membre doit pousser **son propre travail avec son propre compte**.

```bash
git config user.name "Prénom Nom"
git config user.email "adresse-liée-au-compte-github"
git switch -c feature/ma-partie
# ... modifications ...
git add -A && git commit -m "Ajoute ..."
git push -u origin feature/ma-partie
```

Puis ouvrir une Pull Request, la faire relire par un autre membre et la fusionner. Répartition possible :

| Membre | Partie |
| --- | --- |
| 1 | Catalogue, recherche et filtres (`src/features/products`) |
| 2 | Panier et calculs (`src/features/cart`) + tests unitaires |
| 3 | Commande, validation, confirmation (`src/features/checkout`) |
| 4 | Dockerfile, Docker Hub, EC2, tests Playwright |
