---
name: aurore-realisation
description: Ajoute une nouvelle réalisation/portfolio dans src/pages/realisations/. À utiliser quand un projet client est livré et qu'Élodie veut le publier dans sa galerie. Génère la fiche projet avec Schema.org CreativeWork, met à jour la page galerie et le sitemap.
---

# Skill : Ajouter une réalisation Aurore

## Quand utiliser

Quand Élodie livre un projet client et veut l'ajouter à son portfolio public sur `/realisations/`.

## Infos requises auprès d'Élodie

Avant de créer la fiche, récupérer :
- **Nom du client** (personne ou entreprise)
- **Activité** (massothérapeute, conciergerie, etc.)
- **Ville + département** (ex. "Brignoles (83)")
- **URL du site livré** (+ label raccourci sans http://)
- **Prestations réalisées** (liste : "Site vitrine", "Identité visuelle", "Google Business Profile", etc.)
- **Délai de livraison** (ex. "10 jours")
- **Année** de livraison
- **Accord du client** pour apparaître dans le portfolio (RGPD)
- **Témoignage client** (optionnel, avec autorisation)
- **Capture d'écran** du site (desktop et mobile si possible)

## Le pattern existant

Les fiches réalisation vivent dans `src/pages/realisations/<slug>.astro`.
Pattern du slug : `<prénom-nom>-<activité>-<ville>` ou `<nom-entreprise>-<activité>-<ville>`
Exemples existants :
- `delphine-millot-massage-brignoles.astro`
- `le-mazarin-conciergerie-aix.astro`

## Processus

### 1. Lire une fiche existante
Toujours lire `src/pages/realisations/delphine-millot-massage-brignoles.astro` pour reproduire la structure exacte.

### 2. Créer le fichier

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';

const projet = {
  client:      "[Nom client]",
  activite:    "[Activité]",
  ville:       "[Ville (XX)]",
  url:         "https://[url-complète]",
  urlLabel:    "[url-sans-http]",
  prestations: ["Site vitrine", "Identité visuelle", "..."],
  delai:       "[X jours/semaines]",
  annee:       "[2026]",
};

const schema = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Site web, [Nom client], [activité] à [ville]",
  "creator": { "@type": "Organization", "name": "Aurore", "url": "https://agence-aurore.fr" },
  "description": "[Description SEO : création du site de X, activité Y à Ville Z, spécificités]",
  "url": "https://[url-complète]",
  "locationCreated": { "@type": "Place", "name": "[Ville], [Département], France" },
  "dateCreated": "[année]",
  "keywords": "site vitrine [activité], site web [activité] [ville], création site [ville]"
};
---

<BaseLayout
  title="Réalisation, Site vitrine [Nom] | aurore"
  description="[120-160 chars : comment aurore a créé le site de X, activité + ville + délai]"
  slug="realisations/[slug]"
  schema={schema}
>
  <!-- Hero avec infos projet -->
  <!-- Contexte client -->
  <!-- Solution apportée -->
  <!-- Résultat (capture + lien live) -->
  <!-- Témoignage (si dispo) -->
  <!-- CTA "Votre projet ressemble ? Parlons-en" -->
</BaseLayout>
```

### 3. Ajouter l'image

Si l'utilisatrice a une capture d'écran :
- Optimiser en WebP, max 200 KB
- Placer dans `public/assets/images/realisations/<slug>.webp`
- Référencer dans le hero avec `alt` descriptif

### 4. Mettre à jour la galerie

Dans `src/pages/realisations/index.astro`, ajouter une nouvelle entrée dans le tableau des réalisations :
```js
{
  slug: "[slug]",
  client: "[Nom]",
  activite: "[Activité]",
  ville: "[Ville]",
  prestations: [...],
  image: "/assets/images/realisations/[slug].webp"
}
```

### 5. Mettre à jour le schema ItemList de la galerie

Ajouter l'entrée dans `itemListElement` du schema.org de `realisations/index.astro`.

### 6. Mettre à jour sitemap.xml

Ajouter l'URL dans `public/sitemap.xml` avec priority 0.7.

## Règles RGPD / vie privée

- **Jamais publier sans accord explicite** du client (email écrit conservé)
- Pas de données personnelles sensibles (numéros de téléphone privés, adresses email privées)
- Si le client souhaite rester anonyme, utiliser un pseudonyme et ne pas lier vers le site live

## Vérification post-création

1. `npm run build` passe
2. Le schema.org CreativeWork valide (tester sur validator.schema.org)
3. Le lien vers le site client fonctionne
4. L'image se charge et a un alt descriptif
5. La galerie affiche bien la nouvelle réalisation
6. Commit : `feat: ajouter réalisation [nom client] au portfolio`
