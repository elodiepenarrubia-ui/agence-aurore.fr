import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response('Non autorisé', { status: 401 });
  }

  const {
    clientEmail, clientPrenom, siteUrl,
    cmsUrl, cmsPassword, comptes, devisNumber
  } = await request.json();

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const formationsCode = import.meta.env.PUBLIC_FORMATIONS_CODE;

  const cmsSection = cmsUrl ? `
    <div style="background:#F9F9F9;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;
        letter-spacing:0.05em;color:#FF6B1A;">Espace d'administration</p>
      <p style="margin:0 0 4px;font-size:14px;">URL : <a href="${cmsUrl}" style="color:#FF6B1A;">${cmsUrl}</a></p>
      <p style="margin:0;font-size:14px;">Mot de passe : <strong>${cmsPassword}</strong></p>
    </div>` : '';

  const comptesSection = comptes ? `
    <div style="background:#F9F9F9;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;
        letter-spacing:0.05em;color:#FF6B1A;">Vos acc\u00E8s et comptes</p>
      <p style="margin:0;font-size:14px;white-space:pre-line;line-height:1.8;">${comptes}</p>
    </div>` : '';

  await resend.emails.send({
    from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
    to: [clientEmail],
    subject: `Votre site est en ligne ! — ${siteUrl}`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="height:3px;background:#FF6B1A;border-radius:2px;margin-bottom:28px;"></div>
    <div style="background:#fff;border-radius:12px;padding:36px 32px;">
      <p style="margin:0 0 16px;font-size:15px;">Bonjour ${clientPrenom},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;font-weight:600;">
        Votre site est en ligne !
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${siteUrl}" target="_blank"
           style="display:inline-block;padding:14px 32px;background:#FF6B1A;color:white;
           border-radius:100px;font-size:15px;font-weight:600;text-decoration:none;">
          Voir mon site \u2192
        </a>
      </div>
      ${cmsSection}
      ${comptesSection}
      <div style="background:#F9F9F9;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.05em;color:#FF6B1A;">Vos formations vid\u00E9o</p>
        <p style="margin:0 0 8px;font-size:14px;line-height:1.7;">
          7 formations vid\u00E9o pour g\u00E9rer votre pr\u00E9sence en ligne en autonomie : Google Business, Search Console, Analytics, blog, charte graphique, Stripe et r\u00E9servation.
        </p>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.7;">
          Votre code d'acc\u00E8s : <strong style="color:#FF6B1A;letter-spacing:0.04em;">${formationsCode}</strong>
        </p>
        <a href="https://www.agence-aurore.fr/formations/" target="_blank"
           style="display:inline-block;padding:10px 20px;background:#1a1a1a;color:white;
           border-radius:100px;font-size:13px;font-weight:600;text-decoration:none;">
          Acc\u00E9der aux formations \u2192
        </a>
      </div>
      <div style="background:#FFF4EE;border-radius:8px;padding:20px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;
          letter-spacing:0.05em;color:#FF6B1A;">La suite</p>
        <p style="margin:0;font-size:14px;line-height:1.8;">
          Dans 7 jours, je vous enverrai un email pour m'assurer que tout se passe bien.<br>
          Dans 30 jours, je vous demanderai un petit retour sur notre collaboration.<br>
          Pour toute question d'ici l\u00E0, r\u00E9pondez simplement \u00E0 cet email.
        </p>
      </div>
      <p style="margin:24px 0 4px;font-size:15px;">F\u00E9licitations pour votre nouveau site !</p>
      <p style="margin:0;font-size:15px;font-weight:600;">\u00C9lodie</p>
    </div>
    <!-- Signature -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;">
      <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;"><tr><td style="padding-right:16px;border-right:2px solid #FF6B1A;vertical-align:top;"><div style="font-size:18px;font-weight:900;letter-spacing:-0.5px;">aur<span style="color:#FF6B1A;">o</span>re</div></td><td style="padding-left:16px;vertical-align:top;line-height:1.8;"><div style="font-weight:700;font-size:13px;">Élodie Penarrubia</div><div style="color:#6B6B6B;font-size:11px;">Création de sites web pour TPE et indépendants</div><div style="margin-top:4px;"><a href="https://www.agence-aurore.fr" style="color:#FF6B1A;text-decoration:none;font-size:11px;">agence-aurore.fr</a>&nbsp;·&nbsp;<a href="https://wa.me/33659659218" style="color:#FF6B1A;text-decoration:none;font-size:11px;">WhatsApp</a>&nbsp;·&nbsp;<a href="https://share.google/JgmyXhr73QGCq4yAx" style="color:#FF6B1A;text-decoration:none;font-size:11px;">★ Avis Google</a></div></td></tr></table>
    </div>
  </div>
</body>
</html>`
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
