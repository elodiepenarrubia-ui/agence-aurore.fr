# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Site vitrine **agence-aurore.fr** — Aurore, auto-entreprise de création de présence digitale clé en main (Aix-en-Provence, propriétaire : Élodie Penarrubia). Astro + Vercel SSR, avec Firebase (Firestore), Resend (emails) et Stripe (paiements). Pas de framework UI (ni React, ni Vue, ni Tailwind).

## Commandes

```bash
npm run dev      # Dev server Astro (http://localhost:4321)
npm run build    # Build prod (sortie dans dist/)
npm run preview  # Preview local du build
```

Pas de tests, pas de linter configurés. Le déploiement est automatique sur Vercel à chaque push sur `main` (voir `vercel.json`). `.github/workflows/` est vide — ne pas y ajouter de workflow de deploy sans en parler.

## Stack réelle

- **Astro 6** avec `output: 'server'` et adapter `@astrojs/vercel` — SSR, pas de site statique.
- **Sitemap** auto-généré via `@astrojs/sitemap` (filtre `/devis-generateur/`). Ne pas maintenir `public/sitemap.xml` à la main.
- **Firebase Admin** (`src/lib/firebase-admin.ts`) — singleton Firestore/Storage initialisé via variables d'env.
- **Resend** — tous les emails transactionnels (contact, confirmations, devis, relances J+7, factures, solde).
- **Stripe** — paiements acompte/solde, webhook dans `src/pages/api/stripe-webhook.ts`.
- **Astro Content Collections** pour le blog (`src/content.config.ts` + `src/content/blog/*.md`). **Pas de Decap CMS** — la rédaction passe par l'admin maison.
- **GSAP 3.12** chargé via CDN dans `BaseLayout.astro` (pas de package npm).

## Architecture

### Pages (`src/pages/`)

- **Accueil, tarifs, a-propos, contact, mentions-legales, cgv, 404**
- **Pages services** : `identite-visuelle`, `referencement-seo`, `automatisation`, `migration`, `site-web-architecte`
- **Cluster création de site** : `creation-site-web/{index,site-vitrine,site-reservation,logiciel-metier}`
- **Programmatic SEO par métier** : `site-web-{artisan,auto-entrepreneur,avocat,coach,coiffeur,conciergerie,immobilier,massotherapeute,medecin,photographe,restaurant,therapeute}`
- **Pages "alternatives"** (SEO comparatif) : `alternatives-{agences,squarespace,wix,wordpress}`, `comparatif-creation-site-web`
- **Outils** : `simulateur` (devis en ligne), `devis-generateur` (interne, exclu du sitemap), `audit-seo/`
- **Flows client authentifiés** : `admin/` (OTP), `onboarding/[token]`
- **Réalisations** : `realisations/{index,delphine-millot-massage-brignoles,le-mazarin-conciergerie-aix}`
- **Blog** : `blog/{index,[...slug]}`

Avant de créer une nouvelle page métier/alternative, regarder la structure des pages similaires existantes — elles suivent toutes le même gabarit (hero + FAQ Schema + CTA).

### API routes (`src/pages/api/`)

Toutes en SSR. **Chaque handler doit commencer par `export const prerender = false;`** sinon Astro tente de pré-rendre et casse le build.

- `contact.ts` — formulaire multi-step : crée un lead dans Firestore, envoie notif à Élodie + confirmation au client, inclut un lien vers `/admin/` pré-rempli pour générer le devis.
- `onboarding-submit.ts` — dossier client complet envoyé après signature du devis, met à jour `leads/{token}`, génère un `CLAUDE.md` projet et l'envoie par email.
- `devis-firestore.ts`, `create-lead-from-devis.ts`, `send-devis.ts`, `send-preview.ts`, `send-invoice.ts`, `send-solde.ts` — cycle devis/facturation.
- `stripe-webhook.ts` — traitement des events Stripe (acompte/solde payés).
- `admin-otp.ts` — auth admin par OTP email (code 6 chiffres, 10 min).
- `audit-seo.ts` — audit SEO public (formulaire dédié).
- `cron-emails.ts` — relances J+7 sur devis en attente (appelé par un cron externe).

### Lead lifecycle

```
contact form → POST /api/contact
  → Firestore leads/{token} { status: 'nouveau', onboardingCompleted: false }
  → email Élodie (avec lien devis pré-rempli) + email confirmation client

Élodie ouvre /admin/ (OTP) → génère devis → POST /api/send-devis
  → email client avec lien signature

Client signe + paie acompte → Stripe webhook → /api/stripe-webhook
  → email client avec lien onboarding /onboarding/{token}

Client remplit onboarding → POST /api/onboarding-submit
  → leads/{token}.onboardingCompleted = true
  → email Élodie avec CLAUDE.md projet généré

Fin de projet → /api/send-solde → Stripe paiement solde → /api/send-invoice
```

Le token `leads/{id}` est l'identifiant unique qui circule dans toute la chaîne (URL d'onboarding, métadonnée Stripe, etc.). Ne pas le régénérer en cours de flow.

### Admin (`/admin/`)

Auth par OTP email : mot de passe maître (`DEVIS_PASSWORD`) → code 6 chiffres envoyé à `elodie@agence-aurore.fr`, stocké dans `admin-otp/current` Firestore, valide 10 min. Générateur de devis, envoi d'aperçus, facturation. Script client : `public/scripts/admin.js`. Ces routes sont en `noindex`.

### Layouts & composants (`src/layouts/`, `src/components/`)

- `BaseLayout.astro` — head SEO complet (title, description, canonical auto-calculé depuis `slug`, OG, Twitter, favicon, fonts, GSAP CDN, JSON-LD), nav, mobile menu plein écran, footer, barre de progression scroll. Props : `title`, `description`, `slug`, `ogImage`, `schema` (objet ou tableau), `noindex`, `bodyClass`.
- `Nav.astro`, `Footer.astro` — seuls composants partagés. Le reste du markup est inline dans chaque page (pattern assumé — ne pas extraire de composants sans raison).

### Content collection blog

Défini dans `src/content.config.ts` avec loader glob + schema Zod (`title`, `date`, `description`, `thumbnail?`). Pour ajouter un article : créer un `.md`/`.mdx` dans `src/content/blog/` avec le frontmatter requis. Le routing dynamique est dans `src/pages/blog/[...slug].astro`.

### Firebase

- Singleton : `import { db, storage } from '../../lib/firebase-admin'` (jamais réinstancier).
- Collections : `leads` (principale), `admin-otp` (document `current`), devis.
- `firestore.rules` : `leads/{token}` lecture publique (nécessaire pour `/onboarding/[token]`), écriture interdite côté client. Toute mutation passe par les API routes SSR avec Admin SDK.

## Variables d'environnement

Voir `.env.example`. Toutes sont requises en prod Vercel :

```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY       # avec \n literaux, remplacés par replace(/\\n/g, '\n')
FIREBASE_STORAGE_BUCKET
RESEND_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
API_SECRET_TOKEN           # auth /api/devis-* internes
DEVIS_PASSWORD             # mot de passe maître admin
```

Dans le code, toujours via `import.meta.env.XXX`, jamais `process.env`.

## Identité de marque

### Nom & tagline
- **Nom** : `aurore` (toujours en minuscules).
- **Logo HTML** partout : `<span class="logo">aur<span class="logo-o">o</span>re</span>` — le "o" en `--aurora`.
- **Tagline** : *Faites passer votre entreprise de l'ombre à la lumière.*
- **Positionnement** : Premium, clé en main, accessible (référence Apple / Linear / Squarespace).

### Couleurs (variables définies dans `src/styles/global.css`)

```css
--black: #0A0A0A;  --white: #FFFFFF;
--gray-700: #3D3D3D;  --gray-500: #6B6B6B;
--gray-300: #C4C4C4;  --gray-100: #F2F2F2;  --gray-50: #F8F8F8;
--aurora: #FF6B1A;  --aurora-dark: #C2510A;
--aurora-mid: #FF8C42;  --aurora-light: #FFB380;
--aurora-pale: #FFF3EB;  --aurora-glow: rgba(255,107,26,0.10);
--radius-sm: 8px;  --radius-md: 14px;  --radius-lg: 22px;  --radius-xl: 36px;
--transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
```

### Typographies

Via Google Fonts (préchargé dans `BaseLayout`) :
- `--font-display` : `'Outfit', sans-serif` → titres, nav, boutons, logo.
- `--font-serif` : `'Instrument Serif', serif` → accroche italic hero uniquement.

## Conventions CSS

Les styles vivent dans `src/styles/` (`global.css`, `components.css`, `animations.css`) et sont importés une seule fois dans `BaseLayout.astro`. Ne jamais réimporter ailleurs.

- Toujours utiliser les variables CSS — **pas de couleurs ou radius hardcodés**.
- `clamp()` pour les tailles de police responsive.
- Classes de composant standards : `.btn` / `.btn-primary` / `.btn-aurora` / `.btn-outline` / `.btn-ghost`, `.card` / `.card-aurora`, `.section` / `.section-title` / `.section-label`, `.container` (max-width 1120px, padding 48px / 24px mobile).
- Hero : `.hero-eyebrow`, `.hero-h1`, `.hero-serif`, `.hero-sub`, `.hero-ctas`.
- Pas de Tailwind, pas de framework CSS. Pas de `!important`. Pas de styles inline sauf exceptions GSAP ou templates email HTML.

## Animations GSAP

GSAP + ScrollTrigger chargés en CDN. Les animations sont écrites en `<script>` inline dans chaque composant Astro concerné (pas de module global).

Classes conventionnelles à réutiliser :
- `.reveal` — fade/translate in au scroll (start `top 85%`).
- `.reveal-stagger` — les enfants directs apparaissent en cascade.
- `[data-count]` — compteurs animés de 0 à `data-count`.
- `.js-loaded` ajouté sur `html` et `body` au chargement — utilisé pour masquer les éléments pré-animation et éviter le flash.

Respecter le pattern : import `gsap` + `ScrollTrigger` dans le script, `gsap.registerPlugin(ScrollTrigger)`, puis les animations.

## SEO & GEO — règles

- Chaque page passe par `BaseLayout` avec `title`, `description` uniques et `slug` (pour canonical propre).
- Schema.org : passer un objet ou tableau d'objets via la prop `schema` du layout — il les injecte en `<script type="application/ld+json">`. Ne pas écrire les `<script>` à la main dans les pages.
- **Toute page de service doit avoir** : un `LocalBusiness`/`Service`/`ProfessionalService` Schema + un `FAQPage` Schema + une section FAQ HTML visible (h2 "Questions fréquentes") avec 4-8 réponses complètes et directes (les IA citent les pages qui répondent clairement).
- Mentionner **"Aix-en-Provence"** et **"France"** naturellement dans le contenu.
- `/a-propos/` doit contenir le nom "Élodie Penarrubia" et sa spécialité (important pour le GEO — les IA citent des personnes identifiées).

## Pages critiques — notes de contenu

- **`/tarifs/`** — la plus importante pour la conversion. La grille tarifaire vit dans la page (`src/pages/tarifs.astro`) ; la modifier là est la source de vérité. Le Schema `Service` avec ses `offers` doit rester synchrone avec les prix affichés.
- **`/realisations/`** — galerie + fiches projet (Delphine Millot, Le Mazarin). Chaque fiche a un Schema `CreativeWork`.
- **`/a-propos/`** — page pivot GEO, doit contenir Schema `Person` pour Élodie.

## Règles de développement

**À faire** :
- HTML sémantique strict (`<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`).
- `alt` descriptifs sur toutes les images ; `loading="lazy"` hors viewport.
- Images en WebP quand dispo (voir `public/` — `.png` + `.webp` en parallèle).
- Pour tout nouvel endpoint SSR : `export const prerender = false;` en haut du fichier.
- Toujours passer par les variables CSS et les classes existantes avant d'écrire du CSS ad hoc.

**À ne pas faire** :
- Pas de React/Vue/Svelte. Astro vanilla uniquement.
- Pas de Tailwind ni autre framework CSS.
- Pas de `process.env` — utiliser `import.meta.env`.
- Pas de réécriture de `public/sitemap.xml` (auto-généré).
- Pas de Decap CMS, pas de GitHub Pages, pas de GitHub Actions pour le deploy — tout passe par Vercel.
- Pas de lorem ipsum — contenu réel ou placeholder réaliste.
- Pas d'instanciation directe de `firebase-admin` ailleurs que dans `src/lib/firebase-admin.ts`.

## Outillage Claude Code

- `.claude/agents/` contient 11 subagents marketing/design (growth-hacker, seo-specialist, ui-designer, brand-guardian, etc.) — invoquer via l'outil Agent quand le besoin correspond.
- `skills/` contient 23 skills custom (aurore-astro-setup, aurore-firebase-cms, aurore-resend, aurore-stripe-workflow, aurore-landing-metier, schema-markup, etc.) — consulter la liste avant de réimplémenter des patterns récurrents.

## Informations à compléter avant facturation

- SIRET (après immatriculation INPI)
- IBAN dans les mentions légales
