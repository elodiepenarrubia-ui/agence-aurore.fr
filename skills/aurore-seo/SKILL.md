# SKILL : aurore-seo

## Quand utiliser cette skill
**Toutes les offres sans exception** (Starter, Vitrine, Pro, Migration).
Élodie applique le SEO avancé sur tous les projets - c'est inclus partout.
Un client bien référencé = preuve sociale + bouche à oreille + renouvellement.

## Ce qui est inclus sur TOUS les projets
- Meta title + meta description optimisés par page
- Open Graph (partage réseaux sociaux)
- Schema.org (données structurées)
- Sitemap XML automatique
- Robots.txt
- Canonical URLs
- Performance Core Web Vitals (LCP, CLS, FID)
- Google Analytics 4 (GA4)
- Google Search Console configurée
- Fiche Google Business (sauf Migration)
- Images optimisées WebP + attributs alt

## Installation
```bash
npm install @astrojs/sitemap
```

## Configuration astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://VAR_DOMAINE',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/api')
    })
  ],
  output: 'server',
  adapter: vercel()
});
```

## Composant SEO réutilisable
```astro
---
// src/components/SEO.astro
interface Props {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const {
  title,
  description,
  image = '/og-image.jpg',
  canonical,
  type = 'website',
  noindex = false
} = Astro.props;

const siteUrl = 'https://VAR_DOMAINE';
const canonicalUrl = canonical || Astro.url.href;
const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
---

<!-- Base -->
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalUrl} />
{noindex && <meta name="robots" content="noindex, nofollow" />}

<!-- Open Graph -->
<meta property="og:type" content={type} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={imageUrl} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:site_name" content="VAR_NOM_CLIENT" />
<meta property="og:locale" content="fr_FR" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={imageUrl} />

<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/x-icon" href="/favicon.ico" />

<!-- GA4 -->
<script async src={`https://www.googletagmanager.com/gtag/js?id=VAR_GA4_ID`}></script>
<script is:inline define:vars={{ GA4_ID: 'VAR_GA4_ID' }}>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA4_ID);
</script>
```

## Schema.org par type de business

### Professionnel de santé / thérapeute
```astro
---
// Dans la page d'accueil
const schema = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "name": "VAR_NOM_CLIENT",
  "description": "VAR_DESCRIPTION",
  "url": "https://VAR_DOMAINE",
  "telephone": "VAR_TEL",
  "email": "VAR_EMAIL",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "VAR_ADRESSE",
    "addressLocality": "VAR_VILLE",
    "postalCode": "VAR_CODE_POSTAL",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "VAR_LAT",
    "longitude": "VAR_LNG"
  },
  "openingHoursSpecification": [],
  "priceRange": "VAR_PRIX",
  "image": "https://VAR_DOMAINE/og-image.jpg"
}
---
<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

### Artisan / prestataire de service
```javascript
const schema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "VAR_NOM_CLIENT",
  "description": "VAR_DESCRIPTION",
  "url": "https://VAR_DOMAINE",
  "telephone": "VAR_TEL",
  "email": "VAR_EMAIL",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "VAR_ADRESSE",
    "addressLocality": "VAR_VILLE",
    "postalCode": "VAR_CODE_POSTAL",
    "addressCountry": "FR"
  },
  "priceRange": "VAR_PRIX",
  "image": "https://VAR_DOMAINE/og-image.jpg",
  "sameAs": [
    "VAR_GOOGLE_BUSINESS_URL",
    "VAR_FACEBOOK_URL"
  ]
}
```

### Restaurant / café
```javascript
const schema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "VAR_NOM_CLIENT",
  "servesCuisine": "VAR_TYPE_CUISINE",
  "url": "https://VAR_DOMAINE",
  "telephone": "VAR_TEL",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "VAR_ADRESSE",
    "addressLocality": "VAR_VILLE",
    "postalCode": "VAR_CODE_POSTAL",
    "addressCountry": "FR"
  },
  "hasMenu": "https://VAR_DOMAINE/menu",
  "priceRange": "VAR_PRIX",
  "image": "https://VAR_DOMAINE/og-image.jpg"
}
```

### Blog / article
```javascript
const schema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "VAR_TITRE_ARTICLE",
  "description": "VAR_DESCRIPTION_ARTICLE",
  "image": "VAR_IMAGE_ARTICLE",
  "author": {
    "@type": "Person",
    "name": "VAR_NOM_AUTEUR"
  },
  "publisher": {
    "@type": "Organization",
    "name": "VAR_NOM_CLIENT",
    "logo": {
      "@type": "ImageObject",
      "url": "https://VAR_DOMAINE/logo.svg"
    }
  },
  "datePublished": "VAR_DATE_PUBLICATION",
  "dateModified": "VAR_DATE_MODIFICATION"
}
```

## Optimisation images
```astro
---
// Toujours utiliser le composant Image d'Astro
import { Image } from 'astro:assets';
import monImage from '../assets/photo.jpg';
---

<!-- Converti automatiquement en WebP + lazy loading -->
<Image
  src={monImage}
  alt="Description précise de l'image pour le SEO"
  width={800}
  height={600}
  loading="lazy"
  decoding="async"
/>

<!-- Image hero - charger en priorité -->
<Image
  src={heroImage}
  alt="VAR_ALT_HERO"
  width={1200}
  height={600}
  loading="eager"
  fetchpriority="high"
/>
```

## robots.txt
```
# public/robots.txt
User-agent: *
Allow: /

# Bloquer les pages privées
Disallow: /admin/
Disallow: /api/

Sitemap: https://VAR_DOMAINE/sitemap-index.xml
```

## Checklist SEO par page
Chaque page du site doit avoir :
- [ ] Title unique : 50-60 caractères, mot-clé principal en premier
- [ ] Meta description unique : 150-160 caractères, incitative
- [ ] H1 unique par page contenant le mot-clé principal
- [ ] H2/H3 structurés avec mots-clés secondaires
- [ ] Images avec attribut alt descriptif
- [ ] URL courte et descriptive (slug)
- [ ] Lien interne vers au moins une autre page
- [ ] Schema.org adapté au type de business
- [ ] Open Graph image 1200x630px

## Checklist SEO local (pour tous les business locaux)
- [ ] Fiche Google Business créée et optimisée
  - Nom exact du business
  - Catégorie principale + catégories secondaires
  - Description 750 caractères avec mots-clés
  - Horaires complets
  - Photos (minimum 5 : facade, intérieur, équipe, produits/services)
  - URL du site
- [ ] Search Console configurée
  - Propriété ajoutée et vérifiée via DNS
  - Sitemap soumis
- [ ] NAP cohérent (Nom, Adresse, Téléphone) :
  - Identique sur le site, GBP, et tous les annuaires
- [ ] Annuaires locaux : Pages Jaunes, Yelp, Tripadvisor si pertinent

## Mots-clés - Méthode de recherche
Avant de rédiger le contenu de chaque page, identifier :
1. **Mot-clé principal** : `[service] [ville]` ex: "ostéopathe aix-en-provence"
2. **Mots-clés secondaires** : variantes et longue traîne
3. **Intention de recherche** : informationnelle, transactionnelle, navigationnelle
4. **Volume et concurrence** : utiliser Google Suggest + "Autres questions posées"

Intégrer naturellement dans :
- Title de la page
- H1
- Premier paragraphe
- 2-3 occurrences dans le corps
- Meta description
- Alt des images

## Variables à remplacer depuis CLAUDE.md
| Variable | Description | Exemple |
|---|---|---|
| `VAR_DOMAINE` | Domaine du site | `cabinet-dupont.fr` |
| `VAR_NOM_CLIENT` | Nom commercial | `Cabinet Dupont` |
| `VAR_DESCRIPTION` | Description courte | `Ostéopathe à Aix-en-Provence` |
| `VAR_TEL` | Téléphone | `+33612345678` |
| `VAR_EMAIL` | Email pro | `contact@cabinet-dupont.fr` |
| `VAR_ADRESSE` | Rue | `12 rue des Lilas` |
| `VAR_VILLE` | Ville | `Aix-en-Provence` |
| `VAR_CODE_POSTAL` | Code postal | `13100` |
| `VAR_PRIX` | Fourchette prix | `€€` |
| `VAR_GA4_ID` | ID Google Analytics | `G-XXXXXXXXXX` |
| `VAR_LAT` | Latitude GPS | `43.5297` |
| `VAR_LNG` | Longitude GPS | `5.4474` |
