# syntax=docker/dockerfile:1
# =============================================================================
# Image de production d'IvoireMarket (Next.js 16, sortie "standalone").
# Construction multi-étapes : seuls les fichiers nécessaires à l'exécution
# sont copiés dans l'image finale, qui reste légère et sans outils de build.
# =============================================================================

# Image de base commune : Node.js 24 (version LTS) sur Alpine Linux, petite et maintenue.
FROM node:24-alpine AS base
# Désactive la télémétrie anonyme de Next.js pendant la compilation et l'exécution.
ENV NEXT_TELEMETRY_DISABLED=1

# -----------------------------------------------------------------------------
# Étape 1 : installation des dépendances
# -----------------------------------------------------------------------------
# Nouvelle étape nommée "deps", partie de l'image de base.
FROM base AS deps
# Dossier de travail dans le conteneur.
WORKDIR /app
# Copie uniquement les manifestes : cette couche reste en cache tant qu'ils ne changent pas.
COPY package.json package-lock.json ./
# Installe exactement les versions du fichier de verrouillage (dépendances de dev incluses, nécessaires au build).
RUN npm ci

# -----------------------------------------------------------------------------
# Étape 2 : compilation de l'application
# -----------------------------------------------------------------------------
# Nouvelle étape nommée "builder".
FROM base AS builder
# Même dossier de travail.
WORKDIR /app
# Récupère les node_modules installés à l'étape précédente.
COPY --from=deps /app/node_modules ./node_modules
# Copie le code source (les fichiers listés dans .dockerignore sont exclus).
COPY . .
# URL publique utilisée pour les liens Open Graph ; modifiable avec --build-arg SITE_URL=...
ARG SITE_URL=http://localhost:3000
# Rend cette valeur visible pendant la compilation.
ENV SITE_URL=${SITE_URL}
# Compile Next.js en mode production ; génère .next/standalone et .next/static.
RUN npm run build

# -----------------------------------------------------------------------------
# Étape 3 : image finale d'exécution
# -----------------------------------------------------------------------------
# Nouvelle étape "runner", repartie de l'image de base propre (sans code source ni outils de build).
FROM base AS runner
# Dossier de travail de l'application.
WORKDIR /app
# Active les optimisations de production de Node.js et de Next.js.
ENV NODE_ENV=production
# Port d'écoute du serveur Next.js dans le conteneur.
ENV PORT=3000
# Écoute sur toutes les interfaces pour être joignable depuis l'extérieur du conteneur.
ENV HOSTNAME=0.0.0.0
# Crée un groupe système non privilégié (GID 1001).
RUN addgroup --system --gid 1001 nodejs \
  # Crée l'utilisateur "nextjs" (UID 1001) dans ce groupe : l'application ne tournera pas en root.
  && adduser --system --uid 1001 --ingroup nodejs nextjs
# Copie les fichiers statiques publics (images des produits, icônes).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Copie le serveur autonome produit par "output: standalone" (server.js + dépendances minimales).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copie les fichiers JavaScript et CSS compilés, servis par server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Bascule vers l'utilisateur non privilégié pour toutes les commandes suivantes.
USER nextjs
# Documente le port exposé par le conteneur (à publier avec "docker run -p 80:3000").
EXPOSE 3000
# Vérifie toutes les 30 s que le site répond ; Docker marque le conteneur "unhealthy" sinon.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
# Démarre le serveur Next.js autonome (forme exec : Node reçoit directement les signaux d'arrêt).
CMD ["node", "server.js"]
