---
name: aurore-landing-metier
description: Crée une nouvelle page métier (site-web-<métier>.astro) suivant le pattern Aurore. À utiliser quand Élodie veut cibler un nouveau secteur d'activité (ex. ostéopathe, notaire, paysagiste). Génère la page complète avec Schema.org Service+FAQ, hero, features, pricing, FAQ et inscrit le sitemap.
---

# Skill : Créer une page métier Aurore

## Quand utiliser

Quand Élodie veut une nouvelle page SEO ciblée sur un métier/secteur spécifique, type :
- `site-web-ostéopathe.astro`
- `site-web-notaire.astro`
- `site-web-paysagiste.astro`

Ces pages sont des landing pages optimisées pour capter "création site web [métier] [ville]" sur Google.

## Le pattern existant

Les pages métier vivent dans `src/pages/site-web-<métier>.astro`. Elles suivent une structure identique :

1. **Frontmatter** avec 2 schemas JSON-LD :
   - `serviceSchema` (Service) avec les 3 offres Starter/Vitrine/Pro et leurs prix
   - `faqSchema` (FAQPage) avec 6 questions spécifiques au métier

2. **BaseLayout** avec title, description, slug, et les 2 schemas

3. **Sections HTML** :
   - Hero avec `lp-hero section-aurora-gradient` (eyebrow métier + h1 + serif tagline + sous-titre)
   - Section features du métier (6 blocs avec icône SVG)
   - Section pricing (3 cartes : Starter/Vitrine/Pro)
   - FAQ visible (mirror des 6 questions schema.org)
   - CTA final

## Tarifs actuels (vérifier avant d'écrire)

- Starter : **490 €**
- Vitrine : **890 €**
- Pro : **1 390 €**

## Processus

### 1. Recueillir les infos du métier
Demander à Élodie :
- Nom du métier (singulier + pluriel)
- Cible spécifique : qui sont les clients ? Qu'est-ce qui les différencie des autres métiers ?
- 6 angles de questions FAQ typiques pour ce métier
- 6 features visuelles à mettre en avant

### 2. Lire un existant comme référence
Toujours lire une page métier similaire (ex. `site-web-coach.astro`, `site-web-therapeute.astro`) pour copier la structure exacte. Ne jamais partir de zéro.

### 3. Créer le fichier
Le fichier doit contenir :

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Création de site web pour [métier]",
  "serviceType": "Création de site web pour [métier]",
  "provider": { "@type": "LocalBusiness", "name": "Aurore", "url": "https://agence-aurore.fr" },
  "areaServed": "France",
  "description": "[Description SEO 1-2 phrases mentionnant le métier + Aix-en-Provence/France + délai 2 semaines]",
  "offers": [
    { "@type": "Offer", "name": "Pack Starter", "priceCurrency": "EUR", "price": "490" },
    { "@type": "Offer", "name": "Pack Vitrine", "priceCurrency": "EUR", "price": "890" },
    { "@type": "Offer", "name": "Pack Pro",     "priceCurrency": "EUR", "price": "1390" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    // 6 questions SPÉCIFIQUES au métier, pas génériques
    // Chaque réponse doit être complète et directe (les IA citent les pages qui répondent clairement)
  ],
};
---

<BaseLayout
  title="Création de site web pour [métier] | aurore, à partir de 490 €"
  description="[120-160 chars : site pour métier + clé en main + SEO inclus + 2 semaines + CTA]"
  slug="site-web-[métier-slug]"
  schema={[serviceSchema, faqSchema]}
>
  <!-- Hero → Features → Pricing (3 cartes) → FAQ → CTA -->
</BaseLayout>
```

### 4. Pricing cards (copier-coller exact)

Les 3 cartes de prix doivent être identiques à celles de `site-web-coach.astro` :
```astro
<div class="card lp-price-card">
  <div class="lp-price-badge">Starter</div>
  <div class="lp-price">490 <span>€</span></div>
  ...
</div>
<div class="card lp-price-card lp-price-card-highlight">
  <div class="lp-price-badge lp-price-badge-aurora">Vitrine</div>
  <div class="lp-price">890 <span>€</span></div>
  ...
</div>
<div class="card lp-price-card">
  <div class="lp-price-badge">Pro</div>
  <div class="lp-price">1 390 <span>€</span></div>
  ...
</div>
```

### 5. Inscrire dans le sitemap et le Nav

Après avoir créé la page, vérifier que :
- `public/sitemap.xml` contient la nouvelle URL avec priority 0.8
- Si pertinent, ajouter un `hero-pill` dans `src/pages/index.astro` (section "Spécialisé pour votre métier")

## Règles de contenu

- **Mentionner le métier** dans le title, h1, premier paragraphe, et 3-4 fois dans le corps
- **Aix-en-Provence** et **France** doivent apparaître naturellement (GEO/SEO local)
- **Pas de lorem ipsum** — tout le contenu est spécifique et réaliste
- **FAQ** : questions qu'un client de ce métier se pose vraiment, pas des questions génériques
- **6 features** : bénéfices tangibles pour ce métier, avec une icône SVG adaptée

## Vérification post-création

1. Build : `npm run build` passe sans erreur
2. Le title est sous 70 caractères
3. La description est entre 120 et 160 caractères
4. Les 6 questions FAQ dans le schema et dans le HTML sont identiques (mirror)
5. Les 3 prix (490/890/1390) sont corrects partout
6. Commit : `feat: page métier [métier] (site-web-<slug>.astro)`
