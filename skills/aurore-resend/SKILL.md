# SKILL : aurore-resend

## Quand utiliser cette skill
- Formulaire de contact avec email de confirmation
- Envoi de devis par email avec PDF en pièce jointe
- Envoi de facture avec lien de paiement Stripe
- Notification interne (alerte à Élodie ou au client)
- Séquence emails automatisée

## Stack
- Astro (output: server) + Vercel
- Resend SDK (@resend/node ou resend)
- Chaque client a son propre compte Resend gratuit (3000 mails/mois)

## Installation
```bash
npm install resend
```

## Variables d'environnement
```env
RESEND_API_KEY=re_xxxxx          # clé API du compte Resend du CLIENT
CONTACT_EMAIL=client@domaine.fr  # email de réception des formulaires
```

## Configuration compte Resend client
1. Le client crée un compte sur resend.com avec son email pro
2. Vérifier le domaine du client dans Resend (DNS TXT + DKIM)
3. Générer une clé API et l'ajouter dans Vercel > Environment Variables
4. L'adresse d'envoi doit être sur le domaine vérifié : `contact@domaine-client.fr`

## Pattern API Route - Formulaire de contact
```typescript
// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
  const CONTACT_EMAIL = import.meta.env.CONTACT_EMAIL;

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: 'Configuration email manquante' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { nom, email, message, telephone } = body;

    if (!nom || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Champs obligatoires manquants' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    // Email de notification au client (propriétaire du site)
    await resend.emails.send({
      from: `Site [NOM CLIENT] <contact@domaine-client.fr>`,
      to: [CONTACT_EMAIL],
      subject: `Nouveau message de ${nom}`,
      html: buildNotificationHTML({ nom, email, message, telephone })
    });

    // Email de confirmation à l'expéditeur
    await resend.emails.send({
      from: `[NOM CLIENT] <contact@domaine-client.fr>`,
      to: [email],
      subject: `Votre message a bien été reçu`,
      html: buildConfirmationHTML({ nom })
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

## Pattern Template HTML Email
```typescript
function buildNotificationHTML(params: {
  nom: string;
  email: string;
  message: string;
  telephone?: string;
}) {
  return `
<div style="font-family:'Outfit',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0A0A0A;">
  <div style="padding:24px 32px;border-bottom:3px solid VAR_COULEUR_PRINCIPALE;">
    <span style="font-size:22px;font-weight:700;color:#0A0A0A;">VAR_NOM_CLIENT</span>
  </div>
  <div style="padding:32px;">
    <h2 style="font-size:18px;margin:0 0 16px;">Nouveau message reçu</h2>
    <p style="font-size:15px;line-height:1.6;"><strong>Nom :</strong> ${params.nom}</p>
    <p style="font-size:15px;line-height:1.6;"><strong>Email :</strong> ${params.email}</p>
    ${params.telephone ? `<p style="font-size:15px;line-height:1.6;"><strong>Téléphone :</strong> ${params.telephone}</p>` : ''}
    <p style="font-size:15px;line-height:1.6;"><strong>Message :</strong></p>
    <div style="background:#F8F8F8;border-radius:8px;padding:16px;margin-top:8px;">
      <p style="font-size:15px;line-height:1.6;margin:0;">${params.message}</p>
    </div>
  </div>
</div>
`;
}

function buildConfirmationHTML(params: { nom: string }) {
  const prenom = params.nom.split(' ')[0];
  return `
<div style="font-family:'Outfit',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0A0A0A;">
  <div style="padding:24px 32px;border-bottom:3px solid VAR_COULEUR_PRINCIPALE;">
    <span style="font-size:22px;font-weight:700;color:#0A0A0A;">VAR_NOM_CLIENT</span>
  </div>
  <div style="padding:32px;">
    <p style="font-size:16px;line-height:1.6;">Bonjour ${prenom},</p>
    <p style="font-size:16px;line-height:1.6;">
      Votre message a bien été reçu. Je vous réponds dans les plus brefs délais.
    </p>
    <p style="font-size:16px;line-height:1.6;margin-top:24px;">
      À bientôt,<br>
      VAR_NOM_CLIENT
    </p>
  </div>
  <div style="padding:16px 32px;border-top:1px solid #F2F2F2;">
    <p style="font-size:12px;color:#6B6B6B;">VAR_NOM_CLIENT - VAR_DOMAINE</p>
  </div>
</div>
`;
}
```

## Variables à remplacer depuis CLAUDE.md
| Variable | Description | Exemple |
|---|---|---|
| `VAR_COULEUR_PRINCIPALE` | Couleur principale du client | `#FF6B1A` |
| `VAR_NOM_CLIENT` | Nom commercial du client | `Cabinet Dupont` |
| `VAR_DOMAINE` | Domaine du site | `cabinet-dupont.fr` |

## Pattern envoi PDF en pièce jointe
```typescript
// Convertir base64 en Buffer pour Resend
attachments: [
  {
    filename: `document.pdf`,
    content: Buffer.from(pdfBase64, 'base64'),
    content_type: 'application/pdf',
  }
]
```

## Erreurs courantes
- **"Domain not verified"** : le domaine du client n'est pas vérifié dans Resend - ajouter les DNS TXT et DKIM
- **"API key invalid"** : vérifier que RESEND_API_KEY est bien dans Vercel Environment Variables
- **"From address not allowed"** : l'adresse from doit être sur le domaine vérifié

## Checklist déploiement
- [ ] Compte Resend créé pour le client
- [ ] Domaine vérifié dans Resend (DNS TXT + DKIM dans OVH)
- [ ] RESEND_API_KEY ajoutée dans Vercel
- [ ] CONTACT_EMAIL ajoutée dans Vercel
- [ ] Test envoi formulaire en production
