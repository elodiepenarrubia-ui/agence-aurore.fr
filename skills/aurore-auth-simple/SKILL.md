# SKILL : aurore-auth-simple

## Quand utiliser cette skill
Toutes les pages privées des sites clients Aurore :
- Espace admin / CMS client (/admin/)
- Générateur de devis (/devis-generateur/)
- Tout outil interne protégé

## Principe
Authentification légère par mot de passe via localStorage.
Pas de JWT, pas de session serveur, pas de Firebase Auth.
Suffisant pour des outils internes à faible enjeu de sécurité.

## Pattern complet
```astro
---
// src/pages/admin/index.astro
export const prerender = false;
---
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Espace privé — VAR_NOM_CLIENT</title>
</head>
<body>

<!-- Écran connexion -->
<div id="login-screen" class="login-screen">
  <div class="login-box">
    <span class="logo">VAR_NOM_CLIENT</span>
    <p class="login-subtitle">Espace privé</p>
    <form id="login-form">
      <input
        type="password"
        id="login-password"
        placeholder="Mot de passe"
        autocomplete="off"
      />
      <p id="login-error" style="display:none;color:#e53e3e;font-size:13px;">
        Mot de passe incorrect
      </p>
      <button type="submit">Accéder</button>
    </form>
  </div>
</div>

<!-- Application privée -->
<div id="app" style="display:none;">
  <slot />
</div>

<style>
  .login-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--color-gray-50, #f9f9f9);
  }
  .login-box {
    text-align: center;
    max-width: 360px;
    width: 100%;
    padding: 0 24px;
  }
  .login-subtitle {
    color: #6b6b6b;
    font-size: 14px;
    margin: 8px 0 32px;
  }
  #login-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  #login-password {
    width: 100%;
    padding: 12px 16px;
    font-size: 15px;
    border: 1.5px solid #d0d0d0;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s;
  }
  #login-password:focus {
    border-color: var(--color-primary, #000);
  }
</style>

<script is:inline>
(function() {
  var PASSWORD = 'VAR_PASSWORD';
  var STORAGE_KEY = 'VAR_STORAGE_KEY';

  var loginScreen = document.getElementById('login-screen');
  var app = document.getElementById('app');
  var loginForm = document.getElementById('login-form');
  var loginPassword = document.getElementById('login-password');
  var loginError = document.getElementById('login-error');

  function showApp() {
    loginScreen.style.display = 'none';
    app.style.display = '';
    if (typeof onAppReady === 'function') onAppReady();
  }

  // Déjà connecté
  if (localStorage.getItem(STORAGE_KEY) === PASSWORD) {
    showApp();
  }

  // Soumission formulaire
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (loginPassword.value === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, PASSWORD);
      loginError.style.display = 'none';
      showApp();
    } else {
      loginError.style.display = '';
      loginPassword.value = '';
      loginPassword.focus();
    }
  });

  // Déconnexion - exposer globalement
  window.logout = function() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  };
})();
</script>

</body>
</html>
```

## Utilisation avec callback onAppReady
```javascript
// Définir cette fonction AVANT le script d'auth
// pour qu'elle soit appelée dès que l'app est visible
function onAppReady() {
  // Initialiser l'application ici
  loadData();
  renderDashboard();
}
```

## Bouton déconnexion
```html
<button onclick="logout()">Déconnexion</button>
```

## Sécurité
- Ajouter `noindex, nofollow` sur toutes les pages privées
- Ne jamais exposer le mot de passe dans le HTML source visible
- Le mot de passe est dans les variables d'environnement Vercel
- Passer le mot de passe via Astro frontmatter :
```astro
---
const PASSWORD = import.meta.env.CMS_PASSWORD;
---
<script is:inline define:vars={{ PASSWORD }}>
  var STORAGE_KEY = 'cms-auth-VAR_NOM_CLIENT';
  // ... reste du script avec PASSWORD injecté
</script>
```

## Variables à remplacer depuis CLAUDE.md
| Variable | Description | Exemple |
|---|---|---|
| `VAR_PASSWORD` | Mot de passe admin | injecté via env |
| `VAR_STORAGE_KEY` | Clé localStorage unique | `cms-auth-dupont` |
| `VAR_NOM_CLIENT` | Nom affiché | `Cabinet Dupont` |

## Checklist
- [ ] Mot de passe dans Vercel Environment Variables (CMS_PASSWORD)
- [ ] Page en noindex
- [ ] STORAGE_KEY unique par projet (éviter les collisions)
- [ ] Bouton déconnexion présent
- [ ] Test sur mobile
