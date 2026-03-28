import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response(
      JSON.stringify({ success: false, error: 'Non autorisé' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    console.error('[send-invoice] STRIPE_SECRET_KEY manquante');
    return new Response(
      JSON.stringify({ success: false, error: 'Configuration Stripe manquante (STRIPE_SECRET_KEY)' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { clientEmail, clientName, devisNumber, totalHT, acomptePct, description } = body;

    console.log('[send-invoice] body reçu:', JSON.stringify({
      totalHT,
      acomptePct,
      totalHTType: typeof totalHT,
      acomptePctType: typeof acomptePct,
      amountCalculé: Math.round(parseFloat(String(totalHT)) * parseInt(String(acomptePct)) / 100 * 100)
    }));

    if (!clientEmail || !clientName || !devisNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Champs obligatoires manquants (email, nom, n° devis)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!totalHT || totalHT <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Le montant total HT doit être supérieur à 0' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // 1. Chercher ou créer le customer
    const existingCustomers = await stripe.customers.list({ email: clientEmail, limit: 1 });
    let customerId: string;

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      await stripe.customers.update(customerId, {
        preferred_locales: ['fr'],
      });
    } else {
      const newCustomer = await stripe.customers.create({
        email: clientEmail,
        name: clientName,
        preferred_locales: ['fr'],
      });
      customerId = newCustomer.id;
    }

    // 2. Créer l'Invoice EN PREMIER
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      metadata: { devisNumber },
      rendering: {
        pdf: { page_size: 'a4' },
      },
    });

    // 3. Créer l'InvoiceItem attaché directement à l'invoice
    const totalHTNumber = parseFloat(String(totalHT).replace(/[^\d.]/g, ''));
    const acomptePctNumber = parseInt(String(acomptePct)) || 50;
    const amountInCents = Math.round(totalHTNumber * acomptePctNumber / 100 * 100);

    if (!totalHTNumber || totalHTNumber <= 0 || amountInCents <= 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Montant invalide ou nul' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[send-invoice] InvoiceItem amount:', amountInCents, 'invoice:', invoice.id);

    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: amountInCents,
      currency: 'eur',
      description: description,
    });

    // 4. Finaliser
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

    // 5. Envoyer les emails via Resend
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error('[send-invoice] RESEND_API_KEY manquante');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuration email manquante (RESEND_API_KEY)' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const resend = new Resend(RESEND_API_KEY);
    const invoiceUrl = finalizedInvoice.hosted_invoice_url;
    const montant = (amountInCents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const clientPrenom = clientName.split(' ')[0];

    // Email 1 — Au client
    await resend.emails.send({
      from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
      to: clientEmail,
      subject: `Votre facture d'acompte - Devis ${devisNumber}`,
      html: `
        <div style="font-family:'Outfit',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0A0A0A;">
          <div style="padding:24px 32px;border-bottom:3px solid #FF6B1A;">
            <span style="font-size:22px;font-weight:700;letter-spacing:-0.04em;color:#0A0A0A;">aur<span style="color:#FF6B1A;">o</span>re</span>
          </div>
          <div style="padding:32px;">
            <p style="font-size:16px;line-height:1.6;">Bonjour ${clientPrenom},</p>
            <p style="font-size:16px;line-height:1.6;">Suite à votre accord sur le devis n° <strong>${devisNumber}</strong>, voici votre facture d'acompte d'un montant de <strong>${montant} €</strong>.</p>
            <p style="font-size:16px;line-height:1.6;">Pour régler votre acompte en ligne, cliquez ici :</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${invoiceUrl}" style="display:inline-block;background:#FF6B1A;color:#fff;font-family:'Outfit',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;padding:14px 32px;border-radius:100px;text-decoration:none;">Payer ma facture</a>
            </div>
            <p style="font-size:14px;line-height:1.6;color:#6B6B6B;">Ce lien vous permet de payer par carte bancaire de façon sécurisée via Stripe.</p>
            <p style="font-size:14px;line-height:1.6;color:#6B6B6B;">Une question ? Répondez à cet email ou appelez-moi au 06 59 65 92 18</p>
            <p style="font-size:16px;line-height:1.6;margin-top:24px;">À bientôt,<br>Élodie</p>
            <hr style="border:none;border-top:1px solid #F2F2F2;margin:24px 0;">
            <p style="font-size:12px;color:#6B6B6B;line-height:1.5;">Aurore — agence-aurore.fr<br>Présence digitale &amp; création web — Aix-en-Provence</p>
          </div>
        </div>
      `,
    });

    // Email 2 — Copie à Élodie
    await resend.emails.send({
      from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
      to: 'elodie@agence-aurore.fr',
      subject: `[Copie] Facture acompte envoyée - ${devisNumber} - ${clientName}`,
      html: `
        <div style="font-family:'Outfit',Helvetica,Arial,sans-serif;color:#0A0A0A;padding:24px;">
          <p>Facture d'acompte envoyée à <strong>${clientName}</strong> (${clientEmail}).</p>
          <p>Montant : <strong>${montant} €</strong><br>Devis : <strong>${devisNumber}</strong></p>
          <p>Lien de paiement : <a href="${invoiceUrl}">${invoiceUrl}</a></p>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({
        success: true,
        invoiceUrl,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[send-invoice] Erreur:', err);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
