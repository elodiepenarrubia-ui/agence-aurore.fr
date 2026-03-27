# SKILL : aurore-firebase-cms

## Quand utiliser cette skill
Offres **Vitrine (690€) et Pro (1290€)**.
Permet au client de gérer son contenu de manière autonome :
- Modifier les textes existants du site
- Créer de nouvelles pages (landing ou blog) depuis un template
- Uploader des photos
- Sans abonnement, sans GitHub, sans compétences techniques

## Stack
- Astro (output: server) + Vercel
- Firebase Firestore (base de données)
- Firebase Storage (photos)
- Firebase Auth (authentification admin)
- Page /admin/ protégée par mot de passe

## Important
- Un projet Firebase gratuit par client
- Élodie crée le projet Firebase et donne les accès au client
- Plan Spark (gratuit) : 1GB Firestore, 5GB Storage, 50k lectures/jour
- Largement suffisant pour un site vitrine

## Installation
```bash
npm install firebase firebase-admin
```

## Variables d'environnement
```env
# Firebase Admin (serveur)
FIREBASE_PROJECT_ID=xxxxx
FIREBASE_CLIENT_EMAIL=xxxxx
FIREBASE_PRIVATE_KEY=xxxxx

# Firebase Client (navigateur)
PUBLIC_FIREBASE_API_KEY=xxxxx
PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
PUBLIC_FIREBASE_PROJECT_ID=xxxxx
PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx

# CMS
CMS_PASSWORD=xxxxx    # mot de passe admin du client
API_SECRET_TOKEN=xxxxx
```

## Checklist création projet Firebase
1. Aller sur console.firebase.google.com
2. Créer un nouveau projet : `aurore-[nom-client]`
3. Activer Firestore Database (mode production)
4. Activer Storage
5. Activer Authentication > Email/Password
6. Générer une clé de compte de service (Paramètres > Comptes de service)
7. Copier toutes les variables dans Vercel

## Architecture Firestore
```
/pages
  /{pageId}
    title: string
    slug: string
    type: 'landing' | 'blog'
    status: 'draft' | 'published'
    content: string (HTML ou Markdown)
    metaTitle: string
    metaDescription: string
    coverImage: string (URL Storage)
    createdAt: timestamp
    updatedAt: timestamp

/site-content
  /hero
    title: string
    subtitle: string
    ctaText: string
    ctaUrl: string
    backgroundImage: string
  /services
    items: array
  /about
    text: string
    image: string
  /contact
    email: string
    phone: string
    address: string
```

## Pattern - Lire le contenu côté serveur Astro
```typescript
// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: import.meta.env.FIREBASE_PROJECT_ID,
      clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
      privateKey: import.meta.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export const db = getFirestore();
```
```astro
---
// src/pages/blog/[slug].astro
import { db } from '../../lib/firebase-admin';

const { slug } = Astro.params;
const snapshot = await db
  .collection('pages')
  .where('slug', '==', slug)
  .where('status', '==', 'published')
  .get();

if (snapshot.empty) return Astro.redirect('/404');
const page = snapshot.docs[0].data();
---
<article>
  <h1>{page.title}</h1>
  <div set:html={page.content} />
</article>
```

## Pattern - Page /admin/ protégée
```astro
---
// src/pages/admin/index.astro
export const prerender = false;
---
<html>
<head><title>Espace rédaction</title></head>
<body>

<!-- Écran connexion -->
<div id="login-screen">
  <form id="login-form">
    <input type="password" id="password" placeholder="Mot de passe" />
    <button type="submit">Accéder</button>
  </form>
</div>

<!-- Interface CMS -->
<div id="cms-app" style="display:none;">
  <!-- Navigation -->
  <nav>
    <button data-tab="pages">Pages</button>
    <button data-tab="blog">Blog</button>
    <button data-tab="contenu">Contenu du site</button>
  </nav>

  <!-- Liste des pages -->
  <div id="tab-pages">
    <button id="new-page">+ Nouvelle page</button>
    <div id="pages-list"></div>
  </div>

  <!-- Éditeur -->
  <div id="editor" style="display:none;">
    <input type="text" id="page-title" placeholder="Titre de la page" />
    <input type="text" id="page-slug" placeholder="URL (ex: ma-page)" />
    <select id="page-type">
      <option value="landing">Landing page</option>
      <option value="blog">Article de blog</option>
    </select>
    <textarea id="page-content" placeholder="Contenu..."></textarea>
    <input type="text" id="meta-title" placeholder="Titre SEO" />
    <textarea id="meta-description" placeholder="Description SEO"></textarea>
    <input type="file" id="cover-image" accept="image/*" />
    <div>
      <button id="save-draft">Enregistrer brouillon</button>
      <button id="publish-page">Publier</button>
    </div>
  </div>
</div>

<script>
// Authentification
const PASSWORD = import.meta.env.PUBLIC_CMS_PASSWORD || 'VAR_CMS_PASSWORD';

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const pwd = document.getElementById('password').value;
  if (pwd === PASSWORD) {
    localStorage.setItem('cms-auth', pwd);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('cms-app').style.display = 'block';
    loadPages();
  }
});

if (localStorage.getItem('cms-auth') === PASSWORD) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('cms-app').style.display = 'block';
  loadPages();
}

// Firebase Client SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc }
  from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL }
  from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js';

const app = initializeApp({
  apiKey: 'VAR_FIREBASE_API_KEY',
  authDomain: 'VAR_FIREBASE_AUTH_DOMAIN',
  projectId: 'VAR_FIREBASE_PROJECT_ID',
  storageBucket: 'VAR_FIREBASE_STORAGE_BUCKET'
});

const db = getFirestore(app);
const storage = getStorage(app);

// Charger les pages
async function loadPages() {
  const snapshot = await getDocs(collection(db, 'pages'));
  const list = document.getElementById('pages-list');
  list.innerHTML = '';
  snapshot.forEach(docSnap => {
    const page = docSnap.data();
    const div = document.createElement('div');
    div.innerHTML = `
      <span>${page.title}</span>
      <span>${page.status === 'published' ? '✓ Publié' : 'Brouillon'}</span>
      <button onclick="editPage('${docSnap.id}')">Modifier</button>
      <button onclick="deletePage('${docSnap.id}')">Supprimer</button>
    `;
    list.appendChild(div);
  });
}

// Publier une page
document.getElementById('publish-page').addEventListener('click', async () => {
  const title = document.getElementById('page-title').value;
  const slug = document.getElementById('page-slug').value;
  const content = document.getElementById('page-content').value;
  const type = document.getElementById('page-type').value;
  const metaTitle = document.getElementById('meta-title').value;
  const metaDesc = document.getElementById('meta-description').value;

  // Upload image si présente
  let coverUrl = '';
  const file = document.getElementById('cover-image').files[0];
  if (file) {
    const storageRef = ref(storage, `pages/${slug}/${file.name}`);
    await uploadBytes(storageRef, file);
    coverUrl = await getDownloadURL(storageRef);
  }

  await addDoc(collection(db, 'pages'), {
    title, slug, content, type,
    metaTitle, metaDescription: metaDesc,
    coverImage: coverUrl,
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  loadPages();
});
</script>
</body>
</html>
```

## Pattern - Route dynamique pour pages client
```astro
---
// src/pages/[slug].astro
export const prerender = false;
import { db } from '../lib/firebase-admin';

const { slug } = Astro.params;

const snapshot = await db
  .collection('pages')
  .where('slug', '==', slug)
  .where('status', '==', 'published')
  .limit(1)
  .get();

if (snapshot.empty) return Astro.redirect('/404');

const page = snapshot.docs[0].data();
---
<html>
<head>
  <title>{page.metaTitle || page.title}</title>
  <meta name="description" content={page.metaDescription} />
</head>
<body>
  <h1>{page.title}</h1>
  <div set:html={page.content} />
</body>
</html>
```

## Règles Firestore (firestore.rules)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lecture publique pour les pages publiées
    match /pages/{pageId} {
      allow read: if resource.data.status == 'published';
      allow write: if false; // Écriture via Firebase Admin uniquement
    }
    // Contenu du site - lecture publique
    match /site-content/{docId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Variables à remplacer depuis CLAUDE.md
| Variable | Description |
|---|---|
| `VAR_CMS_PASSWORD` | Mot de passe admin du client |
| `VAR_FIREBASE_API_KEY` | Clé API Firebase |
| `VAR_FIREBASE_AUTH_DOMAIN` | Auth domain Firebase |
| `VAR_FIREBASE_PROJECT_ID` | ID projet Firebase |
| `VAR_FIREBASE_STORAGE_BUCKET` | Bucket Storage |
| `VAR_COULEUR_PRINCIPALE` | Couleur principale du client |

## Checklist déploiement
- [ ] Projet Firebase créé (aurore-[nom-client])
- [ ] Firestore activé en mode production
- [ ] Storage activé
- [ ] Règles Firestore déployées
- [ ] Variables Firebase ajoutées dans Vercel
- [ ] CMS_PASSWORD ajouté dans Vercel
- [ ] Test création/publication d'une page
- [ ] Test upload photo
