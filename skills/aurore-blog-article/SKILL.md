---
name: aurore-blog-article
description: Rédige un article de blog avec la voix Aurore (ton accessible, français clair, optimisé SEO pour TPE/artisans/indépendants). À utiliser quand Élodie veut publier un article dans src/content/blog/. Gère frontmatter, structure H2/H3, maillage interne et GEO.
---

# Skill : Rédiger un article de blog Aurore

## Quand utiliser

Quand Élodie veut publier un article de blog dans `src/content/blog/`. Le blog sert à :
1. **Capter du SEO** sur des requêtes informationnelles TPE ("combien coûte un site", "quitter WordPress", etc.)
2. **Se positionner** comme experte de la création digitale accessible
3. **Nourrir les IA** (GEO) — chaque article bien structuré est une source citable

## La voix Aurore

### Ton
- **Accessible, jamais jargonneux** : Élodie parle à des artisans, thérapeutes, commerçants qui n'y connaissent rien en web
- **Direct et rassurant** : "Voici ce que ça coûte" plutôt que "Les tarifs peuvent varier selon..."
- **Opinion assumée** : pas de langue de bois, dire ce qui ne marche pas (Wix, abonnements infinis, agences à 5000 €)
- **Exemples concrets** : toujours des chiffres réels, des clients réels, des situations réelles
- **Français clair** : phrases courtes, un verbe, une idée

### À éviter
- Anglicismes inutiles (dire "tunnel de conversion" pas "funnel")
- Jargon tech ("responsive" → "s'affiche bien sur mobile")
- Formules marketing creuses ("robuste", "innovant", "best-in-class")
- Lorem ipsum, placeholders, "etc."

## Structure standard

Lire un article existant avant d'écrire :
- `src/content/blog/prix-site-web-artisan-2026.md` (pour les articles "prix")
- `src/content/blog/creer-site-web-aix-en-provence.md` (pour les articles locaux)
- `src/content/blog/quitter-wordpress-2026-migration.md` (pour les articles "migration")

### Frontmatter obligatoire

```yaml
---
title: "[Titre H1, sous 70 caractères]"
date: YYYY-MM-DD
description: "[120-160 caractères, SEO, contient le mot-clé principal]"
thumbnail: "/assets/images/blog/[slug].webp"  # optionnel
---
```

### Squelette

```markdown
## Introduction (pas de H2 "Introduction")

[1 paragraphe qui pose le problème du lecteur en 3-4 phrases.
Pas "Dans cet article nous allons voir...", mais directement la question/douleur.]

## [Premier H2 = première grande question]

[Réponse directe dès la première phrase. Puis détails.]

### [H3 si sous-section nécessaire]

## [Deuxième H2]

...

## Conclusion [ou formulation plus directe : "Ce qu'il faut retenir"]

[Résumé actionnable en 2-3 phrases]

[CTA discret] : Si vous êtes [audience] et voulez [bénéfice],
[contactez-nous](/contact/). Nous répondons sous 48h.
```

## Règles SEO

### Mot-clé principal
- 1 seul mot-clé cible par article (ex. "prix site web artisan 2026")
- Dans le `title`, le `description`, le H1 (qui vient du title), au moins un H2, et 3-5 fois dans le corps
- Longueur : 1200-2500 mots pour des articles pilier, 600-1000 pour des articles courts

### Anti-cannibalisation (IMPORTANT)
Avant d'écrire, vérifier que le mot-clé cible n'est pas déjà traité par un autre article :
```bash
grep -r "mot-clé" src/content/blog/
```
Si oui, soit enrichir l'existant, soit prendre un angle différent.

### Maillage interne
Chaque article doit contenir **3-5 liens internes** vers :
- La page tarifs : `/tarifs/`
- Une page métier pertinente : `/site-web-<métier>/`
- Une page service : `/creation-site-web/`, `/identite-visuelle/`, etc.
- Un autre article de blog connexe : `/blog/<slug>/`

Format Markdown : `[texte d'ancre descriptif](/chemin/)` — jamais "cliquez ici".

### Schema.org
Les articles utilisent automatiquement le schema Article via le `BlogLayout.astro`. Pas besoin d'ajouter manuellement.

## Règles GEO (Generative Engine Optimization)

Les IA citent les pages qui :
1. **Répondent directement** à la question dès le premier paragraphe après le H2
2. **Structurent** avec des listes, tableaux, définitions
3. **Mentionnent** Aurore / Élodie / Aix-en-Provence avec contexte
4. **Datent** clairement (2026, Q1 2026, "en date de mars 2026")

Pour chaque H2 qui pose une question, la réponse courte et complète doit venir **immédiatement après**. Une IA qui scanne la page doit pouvoir extraire `<h2>Question ?</h2><p>Réponse directe.</p>` sans chercher.

## Tarifs actuels (à jour 2026)

Si tu dois mentionner des prix, utilise :
- Starter : 490 €
- Vitrine : 890 €
- Pro : 1 390 €
- Migration : 390 €
- Landing pages (10 pages SEO) : 250 €
- Session de modifications : 50 €

## Processus

### 1. Recueillir la brief auprès d'Élodie
- Mot-clé cible principal
- Angle/point de vue (ce qu'elle veut défendre)
- Longueur souhaitée (court/pilier)
- Deadline éventuelle

### 2. Vérifier la non-cannibalisation
`grep -rl "<mot-clé>" src/content/blog/`

### 3. Créer le fichier
Nom du fichier : `src/content/blog/<slug-sans-accents>.md`
Slug pattern : `<mot-clé-principal-tiret-séparé>-<année-si-pertinent>.md`

### 4. Rédiger
Suivre la structure + les règles ci-dessus. Lire 2-3 articles existants avant de commencer pour caler le ton.

### 5. Maillage
Au moins 3 liens internes, répartis dans le corps, vers des pages pertinentes.

### 6. Image thumbnail (optionnel mais recommandé)
- WebP 1200×630
- Max 150 KB
- Placer dans `public/assets/images/blog/<slug>.webp`

### 7. Vérification
- Build passe : `npm run build`
- Title < 70 chars
- Description 120-160 chars
- Au moins 1 H2, et idéalement 3-5
- Mot-clé principal présent dans title, description, H1, ≥1 H2, corps
- 3-5 liens internes
- Pas de lorem ipsum, pas de "etc."

### 8. Commit
```
feat(blog): article "[titre court]"
```

## Exemple d'intro qui fonctionne

> Un artisan qui cherche à créer son site web en 2026 tombe sur des prix qui vont de 0 € à 15 000 €. C'est normal d'être perdu. Voici les trois grandes catégories de solutions, ce qu'elles coûtent réellement sur 3 ans, et comment choisir.

Pas de "Dans cet article, nous allons voir...", pas de "Aujourd'hui, la création d'un site est essentielle...". Direct au problème + promesse concrète.
