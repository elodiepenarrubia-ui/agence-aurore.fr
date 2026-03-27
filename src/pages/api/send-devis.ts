import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

// ─── Email template HTML ───
function buildEmailHTML(params: {
  clientName: string;
  devisNumber: string;
  totalHT: string;
}) {
  const { clientName, devisNumber, totalHT } = params;
  const montantFormate = String(totalHT).includes('€') ? totalHT : totalHT + ' €';
  const prenom = clientName.split(' ')[0] || clientName;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:'Outfit',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="padding:24px 0 12px;text-align:left;">
      <span style="font-family:'Outfit',Helvetica,Arial,sans-serif;font-size:26px;font-weight:700;letter-spacing:-0.04em;color:#0A0A0A;">aur<span style="color:#FF6B1A;">o</span>re</span>
    </div>
    <div style="height:3px;background:#FF6B1A;border-radius:2px;margin-bottom:28px;"></div>

    <!-- Body -->
    <div style="background:#ffffff;border-radius:12px;padding:36px 32px;margin-bottom:20px;">

      <p style="margin:0 0 28px;color:#6B6B6B;font-size:14px;line-height:1.6;text-align:center;">
        Merci pour l'int\u00e9r\u00eat port\u00e9 \u00e0 l'agence <span style="color:#FF6B1A;font-weight:600;">aurore</span>
      </p>

      <p style="margin:0 0 16px;color:#1a1a1a;font-size:15px;line-height:1.7;">
        Bonjour ${prenom},
      </p>

      <p style="margin:0 0 20px;color:#1a1a1a;font-size:15px;line-height:1.7;">
        J'ai bien re\u00e7u votre demande et j'ai le plaisir de vous adresser votre devis n\u00b0&nbsp;<strong>${devisNumber}</strong>, d'un montant de <strong>${montantFormate} HT</strong>, en pi\u00e8ce jointe.
      </p>

      <p style="margin:0 0 6px;color:#1a1a1a;font-size:15px;line-height:1.7;">Pour l'accepter :</p>
      <p style="margin:0 0 4px;color:#1a1a1a;font-size:14px;line-height:1.7;padding-left:8px;">
        \u2192 R\u00e9pondez \u00e0 cet email avec <strong>"bon pour accord"</strong>
      </p>
      <p style="margin:0 0 20px;color:#1a1a1a;font-size:14px;line-height:1.7;padding-left:8px;">
        \u2192 Ou renvoyez-le sign\u00e9 en pi\u00e8ce jointe
      </p>

      <p style="margin:0 0 24px;color:#1a1a1a;font-size:14px;line-height:1.7;">
        Ce devis est valable 30 jours.
      </p>

      <!-- Encadre etapes -->
      <div style="background:#FFF4EE;border-radius:10px;padding:24px 24px 20px;margin:0 0 28px;">
        <p style="margin:0 0 16px;color:#1a1a1a;font-size:15px;font-weight:600;line-height:1.4;">
          La suite si vous validez :
        </p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;width:28px;">
              <span style="display:inline-block;width:24px;height:24px;background:#FF6B1A;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:13px;font-weight:700;">1</span>
            </td>
            <td style="padding:8px 0;color:#1a1a1a;font-size:14px;line-height:1.6;">
              Prenez un RDV dans mon agenda
              <br>
              <a href="https://calendly.com/elodie-agence-aurore" target="_blank" style="display:inline-block;margin-top:8px;padding:10px 22px;border:1.5px solid #FF6B1A;border-radius:100px;color:#FF6B1A;background:#ffffff;font-size:13px;font-weight:600;text-decoration:none;font-family:'Outfit',Helvetica,Arial,sans-serif;">Prendre rendez-vous</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;background:#FF6B1A;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:13px;font-weight:700;">2</span>
            </td>
            <td style="padding:8px 0;color:#1a1a1a;font-size:14px;line-height:1.6;">
              Je vous envoie la facture d'acompte (50 %)
            </td>
          </tr>
          <tr>
            <td style="padding:8px 12px 8px 0;vertical-align:top;">
              <span style="display:inline-block;width:24px;height:24px;background:#FF6B1A;color:#fff;border-radius:50%;text-align:center;line-height:24px;font-size:13px;font-weight:700;">3</span>
            </td>
            <td style="padding:8px 0;color:#1a1a1a;font-size:14px;line-height:1.6;">
              D\u00e8s r\u00e9ception, je d\u00e9marre votre projet
            </td>
          </tr>
        </table>
      </div>

      <p style="margin:0 0 20px;color:#1a1a1a;font-size:14px;line-height:1.7;">
        Une question ? R\u00e9pondez \u00e0 cet email<br>
        ou appelez-moi au <strong>06 59 65 92 18</strong>
      </p>

      <p style="margin:0 0 4px;color:#1a1a1a;font-size:15px;line-height:1.7;">
        A bient\u00f4t,
      </p>
      <p style="margin:0;color:#1a1a1a;font-size:15px;line-height:1.7;font-weight:600;">
        Elodie
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px 0;">
      <p style="margin:0 0 2px;color:#6B6B6B;font-size:11px;line-height:1.5;">
        Aurore - <a href="https://agence-aurore.fr" style="color:#6B6B6B;text-decoration:none;">agence-aurore.fr</a>
      </p>
      <p style="margin:0;color:#999999;font-size:11px;line-height:1.5;">
        Pr\u00e9sence digitale &amp; cr\u00e9ation web - Aix-en-Provence
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── API Route ───
export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response(
      JSON.stringify({ success: false, error: 'Non autorisé' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('[send-devis] RESEND_API_KEY manquante — impossible d\'envoyer le devis');
    return new Response(
      JSON.stringify({ success: false, error: 'Configuration email manquante (RESEND_API_KEY)' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const { pdfBase64, clientEmail, clientName, devisNumber, totalHT } = body;

    if (!clientEmail || !clientName || !devisNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Champs obligatoires manquants (email, nom, n° devis)' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'PDF du devis manquant' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    const { error: resendError } = await resend.emails.send({
      from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
      to: [clientEmail],
      cc: ['elodie@agence-aurore.fr'],
      subject: `Votre devis Aurore n° ${devisNumber}`,
      html: buildEmailHTML({ clientName, devisNumber, totalHT }),
      attachments: [
        {
          filename: `Devis-Aurore-${devisNumber}.pdf`,
          content: Buffer.from(pdfBase64, 'base64'),
          content_type: 'application/pdf',
        },
      ],
    });

    if (resendError) {
      console.error('[send-devis] Resend error:', resendError);
      return new Response(
        JSON.stringify({ success: false, error: `Erreur email : ${resendError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[send-devis] Unexpected error:', err);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
