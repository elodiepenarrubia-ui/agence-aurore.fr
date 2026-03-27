# SKILL : aurore-stripe-workflow

## Quand utiliser cette skill
Offre **Pro uniquement** (1290€). Intégration complète du workflow de facturation :
- Envoi facture d'acompte (50%) avec lien de paiement Stripe
- Notification paiement reçu via webhook
- Envoi facture de solde (50%) à la livraison

## Stack
- Astro (output: server) + Vercel
- Stripe SDK (stripe)
- Resend pour les emails (voir skill aurore-resend)
- Chaque client a son propre compte Stripe

## Important
Le client doit avoir son propre compte Stripe activé.
Son argent transite sur son compte, pas celui d'Élodie.
Élodie configure l'intégration avec les clés API du client.

## Installation
```bash
npm install stripe
```

## Variables d'environnement
```env
STRIPE_SECRET_KEY=sk_live_xxxxx       # clé secrète Stripe du CLIENT
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx  # clé publique Stripe du CLIENT
STRIPE_WEBHOOK_SECRET=whsec_xxxxx     # secret webhook Stripe
API_SECRET_TOKEN=xxxxx                # token sécurité API interne
SITE_URL=https://domaine-client.fr    # URL du site en production
```

## Checklist compte Stripe client
1. Client crée son compte sur stripe.com
2. Client active son compte (IBAN + pièce d'identité)
3. Client récupère ses clés API live (Développeurs > Clés API)
4. Clés ajoutées dans Vercel > Environment Variables
5. Webhook configuré après déploiement (voir section webhook)

## Pattern API Route - Envoi facture acompte
```typescript
// src/pages/api/send-invoice.ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response(JSON.stringify({ success: false, error: 'Non autorisé' }), { status: 401 });
  }

  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  try {
    const { clientEmail, clientName, devisNumber, totalHT, acomptePct, description } = await request.json();

    const amountInCents = Math.round(parseFloat(String(totalHT)) * parseInt(String(acomptePct)) / 100 * 100);

    // 1. Chercher ou créer le customer
    const existing = await stripe.customers.list({ email: clientEmail, limit: 1 });
    let customerId: string;
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
      await stripe.customers.update(customerId, { preferred_locales: ['fr'] });
    } else {
      const customer = await stripe.customers.create({
        email: clientEmail,
        name: clientName,
        preferred_locales: ['fr']
      });
      customerId = customer.id;
    }

    // 2. Créer l'invoice EN PREMIER
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: { devisNumber },
      rendering: { pdf: { page_size: 'a4' } }
    });

    // 3. Attacher l'InvoiceItem à l'invoice
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: amountInCents,
      currency: 'eur',
      description: description
    });

    // 4. Finaliser
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    const invoiceUrl = finalizedInvoice.hosted_invoice_url;
    const montantEuros = (amountInCents / 100).toLocaleString('fr-FR', {
      minimumFractionDigits: 2
    }) + ' €';

    // 5. Email au client via Resend
    const prenom = clientName.split(' ')[0];
    await resend.emails.send({
      from: 'VAR_NOM_CLIENT <contact@VAR_DOMAINE>',
      to: [clientEmail],
      cc: ['VAR_EMAIL_PROPRIETAIRE'],
      subject: `Votre facture d'acompte - Devis ${devisNumber}`,
      html: buildInvoiceEmailHTML({ prenom, devisNumber, montantEuros, invoiceUrl })
    });

    return new Response(JSON.stringify({ success: true, invoiceUrl }), { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return new Response(JSON.stringify({ success: false, error: message }), { status: 500 });
  }
};
```

## Pattern API Route - Webhook paiement reçu
```typescript
// src/pages/api/stripe-webhook.ts
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);
  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET;

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch {
    return new Response('Signature invalide', { status: 400 });
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const montant = (invoice.amount_paid / 100).toLocaleString('fr-FR', {
      minimumFractionDigits: 2
    }) + ' €';
    const devisNumber = invoice.metadata?.devisNumber || 'inconnu';

    await resend.emails.send({
      from: 'Notifications <contact@VAR_DOMAINE>',
      to: ['VAR_EMAIL_PROPRIETAIRE'],
      subject: `Acompte reçu - ${devisNumber} - Démarrer le projet !`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;padding:32px;max-width:500px;">
          <div style="height:3px;background:VAR_COULEUR_PRINCIPALE;margin-bottom:24px;border-radius:2px;"></div>
          <h2 style="color:#1a1a1a;margin:0 0 16px;">Acompte reçu ✓</h2>
          <p style="color:#1a1a1a;font-size:15px;line-height:1.7;">
            Devis <strong>${devisNumber}</strong><br>
            Montant encaissé : <strong style="color:VAR_COULEUR_PRINCIPALE;">${montant}</strong>
          </p>
          <div style="background:#FFF4EE;border-radius:8px;padding:16px;margin-top:24px;">
            <p style="margin:0;font-size:15px;font-weight:600;color:VAR_COULEUR_PRINCIPALE;">
              Tu peux démarrer le projet !
            </p>
          </div>
        </div>
      `
    });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};
```

## Pattern Template Email Facture
```typescript
function buildInvoiceEmailHTML(params: {
  prenom: string;
  devisNumber: string;
  montantEuros: string;
  invoiceUrl: string;
}) {
  return `
<div style="font-family:'Outfit',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0A0A0A;">
  <div style="padding:24px 32px;border-bottom:3px solid VAR_COULEUR_PRINCIPALE;">
    <span style="font-size:22px;font-weight:700;color:#0A0A0A;">VAR_NOM_CLIENT</span>
  </div>
  <div style="padding:32px;">
    <p style="font-size:16px;line-height:1.6;">Bonjour ${params.prenom},</p>
    <p style="font-size:16px;line-height:1.6;">
      Suite à votre accord sur le devis n° <strong>${params.devisNumber}</strong>,
      voici votre facture d'acompte d'un montant de <strong>${params.montantEuros}</strong>.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${params.invoiceUrl}" style="display:inline-block;background:VAR_COULEUR_PRINCIPALE;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:100px;text-decoration:none;">
        Payer ma facture
      </a>
    </div>
    <p style="font-size:14px;color:#6B6B6B;">Une question ? Contactez-nous :</p>
    <p style="font-size:14px;color:#6B6B6B;">VAR_EMAIL_PROPRIETAIRE - VAR_TEL_PROPRIETAIRE</p>
  </div>
</div>
`;
}
```

## Configuration webhook Stripe (après déploiement)
1. Stripe Dashboard > Développeurs > Webhooks
2. Ajouter endpoint : `https://VAR_DOMAINE/api/stripe-webhook`
3. Événement : `invoice.payment_succeeded`
4. Copier le Signing secret (`whsec_...`)
5. Ajouter dans Vercel : `STRIPE_WEBHOOK_SECRET=whsec_...`
6. Redéployer

## Branding Stripe (à faire une fois par client)
- Stripe Dashboard > Paramètres > Branding
- Logo du client
- Couleur principale : VAR_COULEUR_PRINCIPALE
- Paramètres > Factures > Pied de page :
  `TVA non applicable, art. 293B du CGI - SIREN VAR_SIREN`

## Variables à remplacer depuis CLAUDE.md
| Variable | Description | Exemple |
|---|---|---|
| `VAR_COULEUR_PRINCIPALE` | Couleur principale | `#FF6B1A` |
| `VAR_NOM_CLIENT` | Nom commercial | `Cabinet Dupont` |
| `VAR_DOMAINE` | Domaine du site | `cabinet-dupont.fr` |
| `VAR_EMAIL_PROPRIETAIRE` | Email pro du client | `contact@cabinet-dupont.fr` |
| `VAR_TEL_PROPRIETAIRE` | Téléphone | `06 12 34 56 78` |
| `VAR_SIREN` | SIREN | `123456789` |

## Erreurs courantes
- **Facture à 0€** : toujours créer l'Invoice avant l'InvoiceItem et passer `invoice: invoice.id`
- **Webhook 400** : vérifier STRIPE_WEBHOOK_SECRET dans Vercel
- **"Cannot send invoice"** : compte Stripe client pas activé (IBAN manquant)
