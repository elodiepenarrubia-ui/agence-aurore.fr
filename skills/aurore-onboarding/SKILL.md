# SKILL : aurore-onboarding

## Quand utiliser cette skill
À lire en TOUT PREMIER sur chaque nouveau projet client.
Ce fichier explique comment lire le CLAUDE.md et quelle stack
déployer selon l'offre choisie.

## Ordre de lecture des skills par offre

### Pack Starter (290€)
1. aurore-onboarding (ce fichier)
2. aurore-astro-setup
3. aurore-seo
4. aurore-resend

### Vitrine (690€)
1. aurore-onboarding (ce fichier)
2. aurore-astro-setup
3. aurore-seo
4. aurore-resend
5. aurore-firebase-cms
6. aurore-auth-simple

### Pro (1290€)
1. aurore-onboarding (ce fichier)
2. aurore-astro-setup
3. aurore-seo
4. aurore-resend
5. aurore-firebase-cms
6. aurore-auth-simple
7. aurore-stripe-workflow

### Migration (190€)
1. aurore-onboarding (ce fichier)
2. aurore-astro-setup
3. aurore-seo
4. aurore-resend

## Périmètre strict par offre

### Pack Starter (290€) - INCLUS
- Site 5 pages : Accueil, Services, Contact + 2 pages incluses
- Design personnalisé aux couleurs du client
- Formulaire de contact (Resend)
- Responsive mobile
- SEO avancé (toutes pages)
- Google Analytics 4
- Fiche Google Business + Search Console
- Configuration domaine OVH → Vercel
- Emails pro Zoho configurés
- Formation vidéo Loom basique

### Pack Starter (290€) - EXCLU
- CMS / espace rédaction
- Blog
- Pages supplémentaires (facturable 50 à 80€/page selon le contenu)
- Logo / charte graphique (facturable)
- Stripe / paiement en ligne
- Emails automatisés
- Réservation en ligne

### Vitrine (690€) - INCLUS
- Site jusqu'à 8 pages (6 + 2 incluses)
- Tout le Starter inclus
- Formulaire de contact avancé
- CMS Firebase (modifier textes + créer pages + blog)
- Espace admin /admin/ protégé par mot de passe
- Templates landing page et article de blog
- SEO avancé + Schema.org
- Formation vidéo Loom complète

### Vitrine (690€) - EXCLU
- Réservation en ligne
- Stripe / paiement en ligne
- Emails automatisés
- Pages supplémentaires au-delà de 8 (50 à 80€/page selon le contenu)
- Logo / charte graphique (facturable)

### Pro (1290€) - INCLUS
- Site jusqu'à 12 pages (10 + 2 incluses) + blog
- Tout le Vitrine inclus
- Réservation en ligne
- Stripe paiement en ligne
- Workflow facturation complet :
  - Formulaire contact → confirmation auto
  - Génération devis → envoi email
  - Facture acompte Stripe
  - Notification paiement
  - Facture solde
- Emails automatisés (Resend)
- SEO avancé + maillage interne
- Formation vidéo Loom complète

### Pro (1290€) - EXCLU
- Pages supplémentaires au-delà de 12 (50 à 80€/page selon le contenu)
- Logo / charte graphique (facturable)

### Migration (190€) - INCLUS
- Récupération contenu site actuel
- Reconstruction en Astro (même contenu, même structure)
- Conservation domaine
- SEO de base
- Formulaire de contact (Resend)
- Mise en ligne Vercel
- Formation vidéo Loom basique

### Migration (190€) - EXCLU
- Nouveau contenu / nouvelles pages
- CMS
- Blog
- Stripe
- Toute feature absente du site original

## Template CLAUDE.md à remplir pour chaque projet
```markdown
# CLAUDE.md — [NOM CLIENT]

## Offre
[Starter / Vitrine / Pro / Migration]

## Skills à charger
[liste selon offre ci-dessus]

---

## Infos client
- Nom commercial :
- Secteur d'activité :
- Nom du gérant :
- Email pro :
- Téléphone :
- Adresse :
- Ville :
- Code postal :
- SIREN (si Pro avec Stripe) :

## Site
- Domaine :
- Couleur principale : (hex)
- Couleur secondaire : (hex)
- Couleur de fond : (hex)
- Police principale :
- Police corps :
- Ton souhaité : [professionnel / chaleureux / moderne / sobre]
- Inspirations : (URLs de sites aimés)

## Contenu

### Page Accueil
#### Hero
- Titre principal :
- Sous-titre :
- Texte CTA :
- URL CTA :

#### Services (liste)
1. Nom : | Description courte : | Prix si applicable :
2. Nom : | Description courte : | Prix si applicable :
3. Nom : | Description courte : | Prix si applicable :

#### À propos (résumé)
- Texte :
- Photo : (nom du fichier uploadé)

#### Témoignages
1. Nom : | Texte : | Photo :
2. Nom : | Texte : | Photo :

### Page Services (si applicable)
[détail des services]

### Page À propos (si applicable)
[texte complet]

### Page Contact
- Email de réception des formulaires :
- Téléphone affiché :
- Adresse affichée :
- Horaires :
- Google Maps embed : (URL)

### Pages supplémentaires (si applicable)
[une section par page]

## SEO
- Mot-clé principal : (ex: ostéopathe aix-en-provence)
- Mots-clés secondaires :
- Description Google Business :
- Coordonnées GPS : lat= | lng=
- Type Schema.org : [LocalBusiness / HealthAndBeautyBusiness / Restaurant / etc.]
- Fourchette de prix : [€ / €€ / €€€]

## Technique
- GA4 ID : (créer si absent)
- Compte Resend : (email du client)
- CMS Password (Vitrine/Pro) :
- Compte Stripe (Pro) : (email du client)
- Firebase Project ID (Vitrine/Pro) :

## Assets
- Logo : logo.svg ou logo.png
- Photo hero : hero.jpg
- Photos services : service-1.jpg, service-2.jpg...
- Photos équipe/gérant : portrait.jpg
- OG Image : og-image.jpg (1200x630px)

## Notes particulières
[tout ce qui sort de l'ordinaire pour ce projet]
```

## Instructions pour Claude Code

Quand tu reçois un projet avec un CLAUDE.md :

1. **Lire le CLAUDE.md en entier** avant de toucher au code
2. **Identifier l'offre** et charger les skills correspondantes
3. **Vérifier le périmètre** - ne construire que ce qui est dans "INCLUS"
4. **Remplacer toutes les VAR_** par les valeurs du CLAUDE.md
5. **Suivre la checklist** de aurore-astro-setup jusqu'au bout
6. **Ne pas improviser** de features non listées dans l'offre

Si une information est manquante dans le CLAUDE.md :
- Pour les infos bloquantes (domaine, email) : demander avant de continuer
- Pour les infos optionnelles (témoignages, photos) : laisser un placeholder clair

## Prompt de production standard
À coller dans Claude Code pour démarrer chaque projet :
```
Lis le fichier CLAUDE.md à la racine du projet.
Lis ensuite les skills dans /skills/ dans l'ordre indiqué
pour l'offre sélectionnée.
Construis le site en respectant strictement le périmètre
de l'offre. Ne construis rien qui ne soit pas dans la
liste INCLUS de l'offre.
Remplace toutes les variables VAR_ par les valeurs
du CLAUDE.md.
Suis la checklist de aurore-astro-setup jusqu'au bout.
```
