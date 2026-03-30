import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response('Non autorisé', { status: 401 });
  }

  const { clientEmail, clientPrenom, previewUrl, devisNumber } = await request.json();
  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
    to: [clientEmail],
    subject: `Votre site est prêt à valider — DEV-${devisNumber}`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="height:3px;background:#FF6B1A;border-radius:2px;margin-bottom:28px;"></div>
    <div style="background:#fff;border-radius:12px;padding:36px 32px;">
      <p style="margin:0 0 16px;font-size:15px;">Bonjour ${clientPrenom},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Votre site est pr\u00EAt ! Vous pouvez le consulter et me faire vos retours \u00E0 l'adresse suivante :
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${previewUrl}" target="_blank"
           style="display:inline-block;padding:14px 32px;background:#FF6B1A;color:white;
           border-radius:100px;font-size:15px;font-weight:600;text-decoration:none;">
          Voir mon site \u2192
        </a>
      </div>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Regardez chaque page attentivement et notez tout ce que vous souhaitez modifier :
        textes, couleurs, photos, ordre des sections. R\u00E9pondez simplement \u00E0 cet email avec vos retours.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#6B6B6B;line-height:1.7;">
        Une fois vos retours int\u00E9gr\u00E9s et le site valid\u00E9, je vous enverrai la facture de solde
        pour proc\u00E9der \u00E0 la mise en ligne officielle.
      </p>
      <p style="margin:0 0 4px;font-size:15px;">\u00C0 tr\u00E8s vite,</p>
      <p style="margin:0;font-size:15px;font-weight:600;">\u00C9lodie</p>
    </div>
    <div style="text-align:center;padding:16px 0;">
      <p style="margin:0;color:#999;font-size:11px;">Aurore - agence-aurore.fr</p>
    </div>
  </div>
</body>
</html>`
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
