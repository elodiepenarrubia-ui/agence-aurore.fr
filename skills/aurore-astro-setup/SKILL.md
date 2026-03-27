# SKILL : aurore-astro-setup

## Quand utiliser cette skill
**Tous les projets** - à lire en PREMIER avant de toucher au moindre fichier.
Cette skill définit la structure standard de tous les sites clients Aurore.

## Stack standard Aurore
- **Framework** : Astro (output: server)
- **Hébergement** : Vercel (compte Élodie)
- **Emails** : Resend (compte du client)
- **Domaine** : OVH (compte du client)
- **Repo** : GitHub (compte Élodie) - un repo privé par client
- **Nom du repo** : `aurore-[nom-client]` ex: `aurore-cabinet-dupont`

## Initialisation projet
```bash
npm create astro@latest aurore-[nom-client] -- --template minimal
cd aurore-[nom-client]
npm install @astrojs/vercel @astrojs/sitemap
```

## astro.config.mjs standard
```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  site: 'https://VAR_DOMAINE',
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/api')
    })
  ],
  output: 'server',
  adapter: vercel()
});
```

## Structure des dossiers
```
aurore-[nom-client]/
├── public/
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── og-image.jpg          # 1200x630px
│   └── robots.txt
├── src/
│   ├── assets/               # images optimisées par Astro
│   │   └── images/
│   ├── components/
│   │   ├── SEO.astro         # composant SEO (skill aurore-seo)
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Hero.astro
│   │   ├── Services.astro
│   │   ├── About.astro
│   │   ├── Contact.astro
│   │   └── Testimonials.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro       # page d'accueil
│   │   ├── [...slug].astro   # pages dynamiques Firebase (Vitrine/Pro)
│   │   ├── admin/            # CMS (Vitrine/Pro)
│   │   │   └── index.astro
│   │   └── api/
│   │       ├── contact.ts
│   │       ├── send-invoice.ts    # Pro uniquement
│   │       ├── send-solde.ts      # Pro uniquement
│   │       └── stripe-webhook.ts  # Pro uniquement
│   ├── lib/
│   │   └── firebase-admin.ts     # Vitrine/Pro uniquement
│   └── styles/
│       └── global.css
├── skills/                   # copie des skills Aurore
├── CLAUDE.md                 # fichier de cadrage projet
├── .env                      # variables locales (jamais commité)
├── .env.example              # template variables sans valeurs
├── .gitignore
└── package.json
```

## BaseLayout.astro standard
```astro
---
// src/layouts/BaseLayout.astro
import SEO from '../components/SEO.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}

const { title, description, image, noindex } = Astro.props;
---
<!DOCTYPE html>
<html lang="fr">
<head>
  <SEO
    title={title}
    description={description}
    image={image}
    noindex={noindex}
  />
</head>
<body>
  <Header />
  <main>
    <slot />
  </main>
  <Footer />
</body>
</html>
```

## global.css standard
```css
/* src/styles/global.css */
:root {
  --color-primary: VAR_COULEUR_PRINCIPALE;
  --color-primary-dark: VAR_COULEUR_PRINCIPALE_DARK;
  --color-bg: VAR_COULEUR_FOND;
  --color-text: #1a1a1a;
  --color-text-light: #6b6b6b;
  --color-white: #ffffff;
  --color-gray-50: #f9f9f9;
  --color-gray-100: #f0f0f0;
  --color-gray-300: #d0d0d0;

  --font-display: 'VAR_POLICE', Helvetica, Arial, sans-serif;
  --font-body: 'VAR_POLICE_BODY', Helvetica, Arial, sans-serif;

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 24px;

  --transition: all 0.2s ease;

  --container-width: 1200px;
  --container-padding: 0 24px;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-white);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: var(--container-padding);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

/* Boutons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  border-radius: 100px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
}

.btn-outline:hover {
  background: var(--color-primary);
  color: white;
}

/* Sections */
section {
  padding: 80px 0;
}

@media (max-width: 768px) {
  section {
    padding: 48px 0;
  }
  :root {
    --container-padding: 0 16px;
  }
}
```

## .env.example standard
```env
# Resend
RESEND_API_KEY=

# Firebase (Vitrine/Pro uniquement)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=

# Stripe (Pro uniquement)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Sécurité
API_SECRET_TOKEN=
CMS_PASSWORD=

# Site
SITE_URL=
CONTACT_EMAIL=
```

## .gitignore standard
```
node_modules/
dist/
.env
.env.local
.vercel
*.log
.DS_Store
```

## Déploiement Vercel
1. Pousser le repo sur GitHub (compte Élodie)
2. Vercel > Add New Project > importer le repo
3. Framework : Astro (détecté automatiquement)
4. Ajouter toutes les variables d'environnement
5. Deploy
6. Vercel > Settings > Domains > ajouter `VAR_DOMAINE`
7. Configurer les DNS dans OVH :
   - Type A : `@` → IP Vercel
   - Type CNAME : `www` → `cname.vercel-dns.com`

## Connexion domaine OVH → Vercel
```
# DNS à ajouter dans OVH
Type    Nom    Valeur
A       @      76.76.21.21
CNAME   www    cname.vercel-dns.com
```

## Variables à remplacer depuis CLAUDE.md
| Variable | Description | Exemple |
|---|---|---|
| `VAR_DOMAINE` | Domaine complet | `cabinet-dupont.fr` |
| `VAR_COULEUR_PRINCIPALE` | Couleur hex | `#2D6A4F` |
| `VAR_COULEUR_PRINCIPALE_DARK` | Version foncée | `#1B4332` |
| `VAR_COULEUR_FOND` | Couleur de fond | `#F8F4E3` |
| `VAR_POLICE` | Police principale | `Outfit` |
| `VAR_POLICE_BODY` | Police corps | `Inter` |

## Checklist lancement
- [ ] Repo GitHub créé (privé, nom : aurore-[nom-client])
- [ ] CLAUDE.md présent à la racine
- [ ] Skills copiées dans /skills/
- [ ] .env.example complété → .env créé
- [ ] Variables Vercel configurées
- [ ] Domaine connecté (DNS OVH → Vercel)
- [ ] Resend domaine vérifié
- [ ] GA4 configuré
- [ ] Search Console configurée + sitemap soumis
- [ ] Test formulaire de contact
- [ ] Test mobile (Chrome DevTools)
- [ ] Test vitesse PageSpeed Insights (score > 90)
- [ ] Fiche Google Business créée/optimisée
