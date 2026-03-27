import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { db } from '../../lib/firebase-admin';

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
  } catch (err) {
    return new Response('Webhook signature invalide', { status: 400 });
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    const montant = (invoice.amount_paid / 100).toLocaleString('fr-FR', {
      minimumFractionDigits: 2
    }) + ' €';
    const devisNumber = invoice.metadata?.devisNumber || 'inconnu';
    const clientEmail = invoice.customer_email || '';
    const clientName = typeof invoice.customer_name === 'string'
      ? invoice.customer_name : '';

    // Email notification à Élodie (existant)
    await resend.emails.send({
      from: 'Notifications Aurore <elodie@agence-aurore.fr>',
      to: ['elodie@agence-aurore.fr'],
      subject: `💰 Acompte reçu - ${devisNumber} - Tu peux démarrer !`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;padding:32px;max-width:500px;">
          <div style="height:3px;background:#FF6B1A;margin-bottom:24px;border-radius:2px;"></div>
          <h2 style="color:#1a1a1a;margin:0 0 16px;">Acompte reçu ✓</h2>
          <p style="color:#1a1a1a;font-size:15px;line-height:1.7;">
            <strong>${clientName}</strong> (${clientEmail})<br>
            vient de régler l'acompte du devis <strong>${devisNumber}</strong><br>
            Montant encaissé : <strong style="color:#FF6B1A;">${montant}</strong>
          </p>
          <div style="background:#FFF4EE;border-radius:8px;padding:16px;margin-top:24px;">
            <p style="margin:0;font-size:15px;font-weight:600;color:#FF6B1A;">
              Tu peux démarrer le projet !
            </p>
          </div>
          <p style="color:#999;font-size:12px;margin-top:24px;">
            Facture Stripe : ${invoice.hosted_invoice_url}
          </p>
        </div>
      `
    });

    // Chercher le lead par email et envoyer l'email d'onboarding
    if (clientEmail) {
      try {
        const leadsSnapshot = await db
          .collection('leads')
          .where('email', '==', clientEmail)
          .orderBy('createdAt', 'desc')
          .limit(1)
          .get();

        if (!leadsSnapshot.empty) {
          const leadDoc = leadsSnapshot.docs[0];
          const lead = leadDoc.data();
          const token = lead.token;

          // Mettre à jour le statut
          await leadDoc.ref.update({ status: 'onboarding-envoyé' });

          // Envoyer email onboarding au client
          const prenom = lead.prenom || lead.nom?.split(' ')[0] || '';
          await resend.emails.send({
            from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
            to: [lead.email],
            subject: 'Démarrons votre projet - Complétez votre dossier',
            html: buildOnboardingEmailHTML({
              prenom,
              token,
              devisNumber,
            }),
          });
        }
      } catch (onboardingErr) {
        console.error('[stripe-webhook] Erreur onboarding:', onboardingErr);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
};

function buildOnboardingEmailHTML(params: {
  prenom: string;
  token: string;
  devisNumber: string;
}) {
  const url = `https://www.agence-aurore.fr/onboarding/${params.token}/`;
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="height:3px;background:#FF6B1A;border-radius:2px;margin-bottom:28px;"></div>
    <div style="background:#fff;border-radius:12px;padding:36px 32px;">

      <p style="margin:0 0 4px;color:#6B6B6B;font-size:14px;text-align:center;">
        Merci pour l'int\u00e9r\u00eat port\u00e9 \u00e0 l'agence
        <span style="color:#FF6B1A;font-weight:600;">aurore</span>
      </p>

      <p style="margin:24px 0 16px;font-size:15px;line-height:1.7;">
        Bonjour ${params.prenom},
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Votre acompte a bien \u00e9t\u00e9 re\u00e7u - merci !
        Pour d\u00e9marrer votre projet dans les meilleures conditions,
        j'ai besoin de quelques informations sur votre activit\u00e9.
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;">
        Cela prend environ <strong>10 minutes</strong>.
        Plus votre dossier est complet, plus vite je pourrai
        d\u00e9marrer votre site.
      </p>

      <div style="text-align:center;margin:28px 0;">
        <a href="${url}" target="_blank"
          style="display:inline-block;padding:14px 32px;
          background:#FF6B1A;color:white;border-radius:100px;
          font-size:15px;font-weight:600;text-decoration:none;">
          Compl\u00e9ter mon dossier &rarr;
        </a>
      </div>

      <div style="background:#FFF4EE;border-radius:10px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1a1a1a;">
          Pensez \u00e9galement \u00e0 m'envoyer par email :
        </p>
        <p style="margin:2px 0;font-size:14px;color:#1a1a1a;">&rarr; Votre logo (SVG, PNG ou PDF)</p>
        <p style="margin:2px 0;font-size:14px;color:#1a1a1a;">&rarr; Vos photos (lieu, r\u00e9alisations, portrait)</p>
        <p style="margin:2px 0;font-size:14px;color:#1a1a1a;">&rarr; Tout document utile (plaquette, ancien site...)</p>
        <p style="margin:12px 0 0;font-size:13px;color:#6B6B6B;">
          En r\u00e9ponse \u00e0 cet email ou \u00e0
          <a href="mailto:elodie@agence-aurore.fr"
            style="color:#FF6B1A;">elodie@agence-aurore.fr</a>
        </p>
      </div>

      <p style="margin:0 0 4px;font-size:14px;color:#1a1a1a;">
        Une question ? R\u00e9pondez \u00e0 cet email
      </p>
      <p style="margin:0;font-size:14px;color:#1a1a1a;">
        ou appelez-moi au 06 59 65 92 18
      </p>

      <p style="margin:24px 0 0;font-size:15px;">
        A bient\u00f4t,<br>
        <strong>Elodie</strong>
      </p>
    </div>
    <div style="text-align:center;padding:16px 0;">
      <p style="margin:0;color:#999;font-size:11px;">
        Aurore - agence-aurore.fr - Pr\u00e9sence digitale &amp; cr\u00e9ation web - Aix-en-Provence
      </p>
    </div>
  </div>
</body>
</html>`;
}
