# CLAUDE.md — Projet Site Web Aurore

## Contexte du projet

Tu construis le site vitrine **agence-aurore.fr** pour Aurore, une auto-entreprise de création de présence digitale clé en main basée à Aix-en-Provence. La propriétaire s'appelle Élodie.

Le site est **statique** (HTML/CSS/JS vanilla), hébergé sur **GitHub Pages**, avec **Decap CMS** pour l'édition autonome du blog. Aucun framework, aucun bundler, aucune dépendance lourde. Léger, rapide, performant.

---

## Identité de marque

### Nom & tagline
- **Nom** : aurore (toujours en minuscules)
- **Logo** : uniquement le mot `aurore` en Outfit 700, avec le **"o" en #FF6B1A**
- **Tagline** : *Faites passer votre entreprise de l'ombre à la lumière.*
- **Positionnement** : Premium, clé en main, accessible — Apple / Linear / Squarespace

### Couleurs
```css
:root {
  --black:        #0A0A0A;
  --white:        #FFFFFF;
  --gray-700:     #3D3D3D;
  --gray-500:     #6B6B6B;
  --gray-300:     #C4C4C4;
  --gray-100:     #F2F2F2;
  --gray-50:      #F8F8F8;

  --aurora:       #FF6B1A;
  --aurora-dark:  #C2510A;
  --aurora-mid:   #FF8C42;
  --aurora-light: #FFB380;
  --aurora-pale:  #FFF3EB;
  --aurora-glow:  rgba(255, 107, 26, 0.10);

  --radius-sm:    8px;
  --radius-md:    14px;
  --radius-lg:    22px;
  --radius-xl:    36px;

  --transition:   all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Typographies (Google Fonts)
```html
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

- **--font-display** : `'Outfit', sans-serif` → titres, nav, boutons, logo
- **--font-serif** : `'Instrument Serif', serif` → accroche italic hero uniquement

### Logo HTML (à utiliser partout)
```html
<span class="logo">aur<span class="logo-o">o</span>re</span>
```
```css
.logo     { font-family: 'Outfit', sans-serif; font-weight: 700; letter-spacing: -0.04em; color: var(--black); }
.logo-o   { color: var(--aurora); }
```

---

## Architecture du site

```
/
├── index.html                    ← Page d'accueil
├── creation-site-web/
│   ├── index.html                ← Page pilier SEO
│   ├── site-vitrine/index.html
│   ├── site-reservation/index.html
│   └── logiciel-metier/index.html
├── identite-visuelle/index.html
├── referencement-seo/index.html
├── automatisation/index.html
├── realisations/
│   ├── index.html                              ← Galerie globale
│   ├── delphine-millot-massage-brignoles/
│   │   └── index.html                          ← Réalisation 1
│   └── le-mazarin-conciergerie-aix/
│       └── index.html                          ← Réalisation 2
├── tarifs/index.html
├── a-propos/index.html
├── contact/index.html
├── blog/
│   └── index.html
├── mentions-legales/index.html
├── 404.html
├── sitemap.xml
├── robots.txt
├── .nojekyll                     ← Obligatoire GitHub Pages
├── admin/                        ← Decap CMS
│   ├── index.html
│   └── config.yml
├── css/
│   ├── main.css                  ← Variables + reset + base
│   ├── components.css            ← Boutons, cartes, badges, inputs
│   └── animations.css            ← GSAP helpers + CSS keyframes
├── js/
│   ├── main.js                   ← Init globale, nav, scroll
│   └── animations.js             ← GSAP ScrollTrigger, stagger, reveals
└── assets/
    ├── fonts/                    ← (vide, Google Fonts en CDN)
    └── images/
        └── og-image.jpg          ← 1200x630px pour Open Graph
```

---

## SEO & GEO — Règles absolues

### Chaque page DOIT avoir :
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Titre page] | aurore — Aix-en-Provence</title>
  <meta name="description" content="[Description 150-160 caractères avec mot-clé principal]">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://agence-aurore.fr/[slug]/">

  <!-- Open Graph -->
  <meta property="og:title" content="[Titre]">
  <meta property="og:description" content="[Description]">
  <meta property="og:image" content="https://agence-aurore.fr/assets/images/og-image.jpg">
  <meta property="og:url" content="https://agence-aurore.fr/[slug]/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fr_FR">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="[Titre]">
  <meta name="twitter:description" content="[Description]">
  <meta name="twitter:image" content="https://agence-aurore.fr/assets/images/og-image.jpg">

  <!-- Schema.org JSON-LD (voir section dédiée) -->
</head>
```

### Schema.org — Page d'accueil
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Aurore",
  "description": "Création de présence digitale clé en main pour TPE et professionnels. Logo, site web, emails, SEO et automatisations.",
  "url": "https://agence-aurore.fr",
  "email": "contact@agence-aurore.fr",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Aix-en-Provence",
    "addressRegion": "Provence-Alpes-Côte d'Azur",
    "addressCountry": "FR"
  },
  "areaServed": "France",
  "serviceType": ["Création de site web", "Identité visuelle", "SEO", "Automatisation email"],
  "priceRange": "€€",
  "founder": {
    "@type": "Person",
    "name": "Élodie",
    "jobTitle": "Fondatrice"
  }
}
</script>
```

### Schema.org — Pages services
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "[Nom du service]",
  "provider": { "@type": "LocalBusiness", "name": "Aurore" },
  "areaServed": "France",
  "description": "[Description du service]",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "EUR",
    "price": "[prix de départ]"
  }
}
</script>
```

### FAQ Schema — À inclure sur chaque page de service
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question]",
      "acceptedAnswer": { "@type": "Answer", "text": "[Réponse complète]" }
    }
  ]
}
</script>
```

### Règles de contenu pour le GEO
- Chaque page de service doit contenir une section **FAQ visible** (h2 "Questions fréquentes") avec 4-6 questions
- Mentionner **"Aix-en-Provence"** et **"France"** naturellement dans le contenu
- Les réponses FAQ doivent être complètes et directes — les IA citent les pages qui répondent clairement
- Le nom "Élodie" et sa spécialité doivent apparaître dans `/a-propos/` avec suffisamment de détails

---

## Composants CSS — Standards

### Navigation
```css
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 48px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid transparent;
  transition: var(--transition);
}
.nav.scrolled {
  border-bottom-color: var(--gray-100);
  padding: 16px 48px;
}
```

### Boutons
```css
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-display); font-size: 14px; font-weight: 500;
  padding: 13px 24px; border-radius: 100px;
  border: none; cursor: pointer; text-decoration: none;
  letter-spacing: -0.01em; transition: var(--transition);
}
.btn-primary  { background: var(--black); color: white; }
.btn-primary:hover { background: var(--gray-700); transform: translateY(-1px); }
.btn-aurora   { background: var(--aurora); color: white; font-weight: 600; }
.btn-aurora:hover { background: var(--aurora-dark); transform: translateY(-1px); }
.btn-outline  { background: transparent; color: var(--black); border: 1.5px solid var(--gray-300); }
.btn-outline:hover { border-color: var(--black); }
.btn-ghost    { background: var(--gray-100); color: var(--black); }
```

### Hero — Structure type
```html
<section class="hero">
  <div class="hero-eyebrow">
    <span class="eyebrow-line"></span>
    Présence digitale · Aix-en-Provence
    <span class="eyebrow-line"></span>
  </div>
  <h1 class="hero-h1">
    De l'ombre à la
    <span class="hero-serif">lumière.</span>
  </h1>
  <p class="hero-sub">Logo, site web, emails, SEO et automatisations — tout ce dont votre entreprise a besoin pour exister en ligne.</p>
  <div class="hero-ctas">
    <a href="/tarifs/" class="btn btn-primary">Voir les offres →</a>
    <a href="/contact/" class="btn btn-outline">Demander un devis</a>
  </div>
</section>
```

```css
.hero-h1 {
  font-family: var(--font-display); font-size: clamp(42px, 6vw, 72px);
  font-weight: 700; letter-spacing: -0.05em; line-height: 1;
  color: var(--black);
}
.hero-serif {
  font-family: var(--font-serif); font-style: italic; font-weight: 400;
  color: var(--aurora); display: block;
  font-size: clamp(44px, 6.5vw, 76px); letter-spacing: -0.02em; line-height: 1.1;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 12px;
  font-size: 11px; font-weight: 600; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--aurora); margin-bottom: 28px;
}
.eyebrow-line { width: 20px; height: 1px; background: var(--aurora); }
```

### Cartes
```css
.card {
  background: var(--white); border: 1.5px solid var(--gray-100);
  border-radius: var(--radius-lg); padding: 28px 32px;
  transition: var(--transition);
}
.card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }

.card-aurora {
  background: var(--aurora-pale); border: 1.5px solid rgba(255,107,26,0.2);
  position: relative;
}
.card-aurora::before {
  content:''; position:absolute; top:0; left:24px; right:24px; height:2px;
  background: linear-gradient(90deg, transparent, var(--aurora), transparent);
  border-radius: 2px;
}
```

### Section layout type
```css
.section {
  padding: 96px 0;
}
.section-label {
  font-size: 11px; font-weight: 600; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--aurora); margin-bottom: 12px;
}
.section-title {
  font-family: var(--font-display); font-size: clamp(28px, 4vw, 48px);
  font-weight: 700; letter-spacing: -0.03em; line-height: 1.1;
  color: var(--black);
}
.container {
  max-width: 1120px; margin: 0 auto; padding: 0 48px;
}
@media (max-width: 768px) {
  .container { padding: 0 24px; }
  .section { padding: 64px 0; }
}
```

---

## Animations — GSAP

### Chargement des librairies
```html
<!-- Dans le <head> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
```

### Animations standard (js/animations.js)
```javascript
gsap.registerPlugin(ScrollTrigger);

// ─── PAGE LOAD : Hero stagger ───
function initHeroAnimation() {
  const tl = gsap.timeline({ delay: 0.1 });
  tl.from('.hero-eyebrow',  { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
    .from('.hero-h1',       { y: 28, opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3')
    .from('.hero-serif',    { clipPath: 'inset(0 100% 0 0)', duration: 0.9, ease: 'power3.out' }, '-=0.4')
    .from('.hero-sub',      { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
    .from('.hero-ctas',     { y: 16, opacity: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
    .from('.hero-metrics .metric', { y: 20, opacity: 0, stagger: 0.08, duration: 0.5, ease: 'power2.out' }, '-=0.2');
}

// ─── SCROLL REVEAL : Sections ───
function initScrollAnimations() {
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      y: 40, opacity: 0, duration: 0.65, ease: 'power2.out'
    });
  });

  gsap.utils.toArray('.reveal-stagger').forEach(container => {
    gsap.from(container.children, {
      scrollTrigger: { trigger: container, start: 'top 80%' },
      y: 32, opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out'
    });
  });
}

// ─── ORBE AMBIENT HERO ───
function initAuroraOrb() {
  const orb = document.querySelector('.aurora-orb');
  if (!orb) return;
  gsap.to(orb, {
    scale: 1.25, opacity: 0.12,
    duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut'
  });
}

// ─── NAV : Scroll behavior ───
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  ScrollTrigger.create({
    start: 'top -60',
    onUpdate: self => nav.classList.toggle('scrolled', self.progress > 0)
  });
}

// ─── COMPTEURS MÉTRIQUES ───
function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target, duration: 1.2, ease: 'power1.out',
          onUpdate: function() { el.textContent = Math.round(this.targets()[0].val); }
        });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initHeroAnimation();
  initScrollAnimations();
  initAuroraOrb();
  initNav();
  initCounters();
});
```

---

## Pages — Contenu & structure

### index.html — Page d'accueil

**Sections dans l'ordre :**
1. `<nav>` — Navigation fixe avec logo + liens + CTA "Devis gratuit →"
2. `<section class="hero">` — Accroche principale (voir composant hero ci-dessus)
   - Orbe ambient derrière le titre
   - Métriques : `2 sem.` / `590 €` / `100 %` / `0 € hébergement`
3. `<section class="services">` — Les 5 familles de services en grille de cartes
   - Création de site web
   - Identité visuelle
   - Référencement SEO
   - Automatisation
   - Logiciel métier
4. `<section class="how">` — Comment ça marche (3 étapes : Briefing → Création → Livraison)
5. `<section class="why">` — Pourquoi Aurore (3-4 différenciateurs clés)
6. `<section class="testimonials">` — Témoignages (3 placeholders)
7. `<section class="faq">` — 5 questions fréquentes (avec FAQ Schema)
8. `<section class="cta">` — CTA final : "Parlons de votre projet"
9. `<footer>` — Liens, mentions légales, copyright

**Title SEO** : `Création de site web Aix-en-Provence — Présence digitale clé en main | aurore`
**Description** : `Aurore crée votre présence digitale de A à Z : logo, site web, emails professionnels, SEO et automatisations. Basé à Aix-en-Provence. À partir de 590 €.`

---

### tarifs/index.html — Page Tarifs

**C'est la page la plus importante pour la conversion.**

Structure :
1. Bandeau offre de lancement (tant que places disponibles)
2. Hero court : "Tarifs transparents, sans surprise."
3. Pack Starter en avant — offre de lancement
4. Grille d'offres complète
5. Prestations à la carte
6. FAQ tarifs (6 questions)
7. CTA devis

**Grille tarifaire complète :**

```
OFFRE DE LANCEMENT ⭐
Pack Starter — 290 € (5 places · offre limitée)
├── Site web 3 pages (Accueil, Services, Contact)
├── Design responsive mobile
├── Nom de domaine + configuration
├── Emails professionnels (Zoho)
├── Mise en ligne GitHub Pages
├── Fiche Google Business créée et optimisée
└── Options disponibles en supplément :
    ├── Pages supplémentaires      120 €/page
    ├── Logo + charte graphique    250 €
    ├── SEO on-page                150 €
    ├── Formulaire de contact       60 €
    ├── Decap CMS                  150 €
    ├── Google Search Console       60 €
    └── Automatisations            100 €/automatisation

SITE STATIQUE
├── Essentiel — 590 €
│   ├── Jusqu'à 4 pages
│   ├── Logo + charte graphique
│   ├── Domaine + emails pro
│   ├── SEO on-page
│   ├── Fiche Google Business + Search Console
│   └── Modifications : contacter Aurore
└── Autonome — 790 €
    ├── Tout Essentiel +
    ├── Decap CMS (édition autonome)
    └── Formation 30 min

SITE VITRINE COMPLET
├── Essentiel — 1 100 €
│   ├── Jusqu'à 8 pages + blog
│   ├── Formulaire contact + notifications
│   ├── Prise de RDV en ligne
│   ├── Automatisation email
│   ├── Logo + charte complète
│   ├── Domaine + emails pro
│   ├── SEO avancé
│   └── Fiche Google + Search Console
└── Autonome — 1 490 €
    ├── Tout Essentiel +
    ├── Decap CMS
    └── Formation 1h

SITE AVEC RÉSERVATION
├── Essentiel — 1 400 €
│   ├── Jusqu'à 8 pages
│   ├── Système de réservation en ligne
│   ├── Emails transactionnels automatisés
│   ├── Paiement en ligne (Stripe)
│   └── Tout l'Essentiel Vitrine
└── Autonome — 1 800 €
    ├── Tout Essentiel +
    ├── Decap CMS
    └── Formation 1h30

LOGICIEL MÉTIER
├── Cadrage — 300 €
│   └── (déduit si projet signé)
└── Développement — Sur devis

PRESTATIONS À LA CARTE
Logo seul                    150 €
Charte graphique             100 €
Support marketing            80 €/support
Domaine + config             60 € + coût domaine
Emails pro (Zoho)            80 €
Page web supplémentaire      120 €/page
Decap CMS                    150 €
Formulaire contact           60 €
Automatisation               100 €/automatisation
SEO on-page                  150 €
Fiche Google Business        90 €
Search Console               60 €

MAINTENANCE MENSUELLE
Technique (sauvegardes, sécurité)    19 €/mois
Technique + support (30 min/mois)    29 €/mois
```

---

### realisations/index.html — Page Réalisations

**Page galerie** listant toutes les réalisations. Affichage en grille de cartes cliquables.

Structure de chaque carte :
- Capture d'écran du site (image)
- Nom du projet
- Secteur + ville
- Tags des prestations réalisées (site vitrine, logo, SEO…)
- Lien "Voir le projet →"

**Schema.org à inclure sur la page galerie :**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Réalisations Aurore",
  "description": "Sites web et présences digitales créés par Aurore pour des TPE et professionnels partout en France.",
  "itemListElement": [
    {
      "@type": "CreativeWork",
      "position": 1,
      "name": "Site web — Delphine Millot, massothérapeute",
      "url": "https://agence-aurore.fr/realisations/delphine-millot-massage-brignoles/"
    },
    {
      "@type": "CreativeWork",
      "position": 2,
      "name": "Site web — Le Mazarin, conciergerie",
      "url": "https://agence-aurore.fr/realisations/le-mazarin-conciergerie-aix/"
    }
  ]
}
</script>
```

**Title SEO** : `Nos réalisations — Sites web créés par aurore | Aix-en-Provence`
**Description** : `Découvrez les sites web, identités visuelles et présences digitales créés par Aurore pour des artisans, professionnels et TPE partout en France.`

---

### realisations/delphine-millot-massage-brignoles/index.html — Réalisation 1

**Fiche projet complète :**

| Champ | Valeur |
|---|---|
| Client | Delphine Millot |
| Activité | Massothérapeute & praticienne Qi Gong |
| Ville | Brignoles (83) |
| URL du site livré | [URL du site de Delphine] |
| Prestations réalisées | Site vitrine, hébergement GitHub Pages |
| Délai de livraison | [À compléter] |

Sections de la page :
1. Hero : nom du projet + capture plein écran du site
2. Contexte : qui est le client, quel était son besoin
3. Solution apportée : prestations réalisées, choix techniques
4. Résultat : capture desktop + mobile, lien vers le site live
5. Témoignage client (si accord de Delphine)
6. CTA : "Votre projet ressemble à celui-ci ? Parlons-en →"

**Schema.org :**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Site web — Delphine Millot, massothérapeute à Brignoles",
  "creator": { "@type": "Organization", "name": "Aurore" },
  "description": "Création du site vitrine de Delphine Millot, massothérapeute et praticienne Qi Gong à Brignoles (Var).",
  "url": "[URL du site de Delphine]",
  "locationCreated": { "@type": "Place", "name": "Brignoles, Var, France" }
}
</script>
```

---

### realisations/le-mazarin-conciergerie-aix/index.html — Réalisation 2

**Fiche projet complète :**

| Champ | Valeur |
|---|---|
| Client | Le Mazarin |
| Activité | Conciergerie de location saisonnière |
| Ville | Aix-en-Provence (13) |
| URL du site livré | lemazarin.com |
| Prestations réalisées | Site vitrine, identité visuelle, SEO, fiche Google |
| Délai de livraison | [À compléter] |

Sections de la page : identiques à la fiche Delphine Millot.

**Schema.org :**
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Site web — Le Mazarin, conciergerie à Aix-en-Provence",
  "creator": { "@type": "Organization", "name": "Aurore" },
  "description": "Création du site vitrine de Le Mazarin, conciergerie de location saisonnière à Aix-en-Provence.",
  "url": "https://lemazarin.com",
  "locationCreated": { "@type": "Place", "name": "Aix-en-Provence, Bouches-du-Rhône, France" }
}
</script>
```

---

### a-propos/index.html — Page À propos

**Crucial pour le GEO** — les IA citent des personnes identifiées, pas des entités anonymes.

Contenu :
- Photo placeholder (alt text descriptif)
- Présentation d'Élodie : fondatrice d'Aurore, basée à Aix-en-Provence
- Son parcours : gestion d'une conciergerie de location saisonnière (Le Mazarin), expertise terrain des besoins digitaux des TPE
- Ses valeurs : transparence, livraison clé en main, autonomie du client
- Ce qui la différencie : elle a elle-même vécu les problèmes qu'elle résout
- Localisation : Aix-en-Provence, intervention dans toute la France
- Schema.org Person sur cette page

---

### contact/index.html — Page Contact

- Formulaire : Nom, Email, Téléphone, Type de projet (select), Message, Budget estimé (select)
- Email de contact : contact@agence-aurore.fr
- Réponse sous 48h ouvrées
- Pas de téléphone affiché publiquement (à la discrétion d'Élodie)
- Lien vers Calendly si disponible plus tard (prévoir un emplacement)

---

### blog/index.html — Page Blog

- Liste des articles avec Decap CMS
- Structure article : titre H1, date, temps de lecture, contenu, CTA en bas
- Premiers articles à créer (placeholders) :
  - "Combien coûte la création d'un site web en 2025 ?"
  - "Pourquoi votre entreprise a besoin d'une fiche Google Business"
  - "Créer un site web à Aix-en-Provence : guide complet"

---

## Decap CMS — Configuration

### admin/config.yml
```yaml
backend:
  name: github
  repo: [TON-COMPTE]/agence-aurore.fr
  branch: main

media_folder: "assets/images/blog"
public_folder: "/assets/images/blog"

collections:
  - name: "blog"
    label: "Articles de blog"
    folder: "_posts"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "Titre", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Description SEO", name: "description", widget: "string" }
      - { label: "Image à la une", name: "thumbnail", widget: "image", required: false }
      - { label: "Contenu", name: "body", widget: "markdown" }
```

### admin/index.html
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>aurore — Administration</title>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</head>
<body></body>
</html>
```

---

## sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://agence-aurore.fr/</loc><priority>1.0</priority></url>
  <url><loc>https://agence-aurore.fr/creation-site-web/</loc><priority>0.9</priority></url>
  <url><loc>https://agence-aurore.fr/creation-site-web/site-vitrine/</loc><priority>0.8</priority></url>
  <url><loc>https://agence-aurore.fr/creation-site-web/site-reservation/</loc><priority>0.8</priority></url>
  <url><loc>https://agence-aurore.fr/creation-site-web/logiciel-metier/</loc><priority>0.8</priority></url>
  <url><loc>https://agence-aurore.fr/realisations/</loc><priority>0.8</priority></url>
  <url><loc>https://agence-aurore.fr/realisations/delphine-millot-massage-brignoles/</loc><priority>0.7</priority></url>
  <url><loc>https://agence-aurore.fr/realisations/le-mazarin-conciergerie-aix/</loc><priority>0.7</priority></url>
  <url><loc>https://agence-aurore.fr/identite-visuelle/</loc><priority>0.8</priority></url>
  <url><loc>https://agence-aurore.fr/referencement-seo/</loc><priority>0.8</priority></url>
  <url><loc>https://agence-aurore.fr/automatisation/</loc><priority>0.8</priority></url>
  <url><loc>https://agence-aurore.fr/tarifs/</loc><priority>0.9</priority></url>
  <url><loc>https://agence-aurore.fr/a-propos/</loc><priority>0.7</priority></url>
  <url><loc>https://agence-aurore.fr/contact/</loc><priority>0.8</priority></url>
  <url><loc>https://agence-aurore.fr/blog/</loc><priority>0.7</priority></url>
</urlset>
```

## robots.txt
```
User-agent: *
Allow: /
Disallow: /admin/
Sitemap: https://agence-aurore.fr/sitemap.xml
```

---

## Footer — Structure standard
```html
<footer class="footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <span class="logo">aur<span class="logo-o">o</span>re</span>
        <p>Faites passer votre entreprise<br>de l'ombre à la lumière.</p>
      </div>
      <nav class="footer-nav">
        <div>
          <strong>Services</strong>
          <a href="/creation-site-web/">Création de site web</a>
          <a href="/identite-visuelle/">Identité visuelle</a>
          <a href="/referencement-seo/">Référencement SEO</a>
          <a href="/automatisation/">Automatisation</a>
        </div>
        <div>
          <strong>Aurore</strong>
          <a href="/realisations/">Réalisations</a>
          <a href="/tarifs/">Tarifs</a>
          <a href="/a-propos/">À propos</a>
          <a href="/blog/">Blog</a>
          <a href="/contact/">Contact</a>
        </div>
      </nav>
    </div>
    <div class="footer-bottom">
      <p>© 2025 Aurore — Élodie [NOM] · Auto-entrepreneur · Aix-en-Provence</p>
      <a href="/mentions-legales/">Mentions légales</a>
    </div>
  </div>
</footer>
```

---

## Règles de développement

### Ce qu'on fait
- HTML sémantique strict (`<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`)
- CSS custom properties pour tout (jamais de valeurs hardcodées)
- `clamp()` pour les tailles de police responsive
- Attributs `alt` descriptifs sur toutes les images
- `loading="lazy"` sur toutes les images hors viewport
- `rel="noopener noreferrer"` sur tous les liens externes
- Commentaires de section dans le HTML : `<!-- ─── HERO ─── -->`

### Ce qu'on ne fait pas
- Pas de framework CSS (Bootstrap, Tailwind...)
- Pas de JavaScript inutile
- Pas d'inline styles (sauf exceptions GSAP)
- Pas de `!important`
- Pas de pixel art ou d'emojis décoratifs dans le code
- Pas de lorem ipsum — tout le contenu est réel ou placeholder réaliste

### Performance
- Fonts Google en `preconnect` + `display=swap`
- Images en WebP si possible
- GSAP chargé en `defer`
- Pas de dépendances inutiles

### Responsive
- Mobile-first
- Breakpoints : 480px / 768px / 1024px / 1280px
- La navigation devient un burger menu sur mobile

---

## Ordre de construction recommandé

1. `css/main.css` — Variables, reset, base typographique
2. `css/components.css` — Tous les composants UI
3. `css/animations.css` — Keyframes CSS
4. `js/main.js` — Nav, utilitaires
5. `js/animations.js` — GSAP
6. `index.html` — Page d'accueil complète
7. `tarifs/index.html` — Page tarifs
8. `realisations/index.html` — Page galerie réalisations
9. `realisations/delphine-millot-massage-brignoles/index.html`
10. `realisations/le-mazarin-conciergerie-aix/index.html`
11. `a-propos/index.html` — Page à propos
12. `contact/index.html` — Page contact
13. Pages services (une par une)
14. `blog/index.html` + Decap CMS
15. `sitemap.xml` + `robots.txt` + `.nojekyll`

---

## Informations de contact à compléter avant livraison

- `[TON-COMPTE]` → ton nom d'utilisateur GitHub
- `[NOM]` → ton nom de famille
- `SIRET` → à compléter après immatriculation INPI
- `IBAN` → coordonnées bancaires dans les mentions légales