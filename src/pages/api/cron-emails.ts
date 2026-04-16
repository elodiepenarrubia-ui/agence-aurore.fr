import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { Resend } from 'resend';

export const prerender = false;

// ─── Templates emails ───

function buildJ7HTML(params: { prenom: string }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="height:3px;background:#FF6B1A;border-radius:2px;margin-bottom:28px;"></div>
    <div style="background:#fff;border-radius:12px;padding:36px 32px;">
      <p style="margin:0 0 16px;font-size:15px;">Bonjour ${params.prenom},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Votre projet me tient à coeur et je voulais vous faire savoir
        que je suis toujours disponible pour le concrétiser.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Votre devis est valable encore 23 jours. Si vous avez des questions,
        des doutes ou souhaitez simplement échanger, répondez à cet email.
      </p>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;">
        Et si le timing n'est pas le bon maintenant, pas de souci -
        revenez quand vous êtes prêt.
      </p>
      <p style="margin:0 0 4px;font-size:15px;">À bientôt,</p>
      <p style="margin:0;font-size:15px;font-weight:600;">Elodie</p>
    </div>
    <!-- Signature -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;">
      <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;"><tr><td style="padding-right:16px;border-right:2px solid #FF6B1A;vertical-align:top;"><div style="font-size:18px;font-weight:900;letter-spacing:-0.5px;">aur<span style="color:#FF6B1A;">o</span>re</div></td><td style="padding-left:16px;vertical-align:top;line-height:1.8;"><div style="font-weight:700;font-size:13px;">Élodie Penarrubia</div><div style="color:#6B6B6B;font-size:11px;">Création de sites web pour TPE et indépendants</div><div style="margin-top:4px;"><a href="https://www.agence-aurore.fr" style="color:#FF6B1A;text-decoration:none;font-size:11px;">agence-aurore.fr</a>&nbsp;·&nbsp;<a href="https://wa.me/33659659218" style="color:#FF6B1A;text-decoration:none;font-size:11px;">WhatsApp</a>&nbsp;·&nbsp;<a href="https://share.google/JgmyXhr73QGCq4yAx" style="color:#FF6B1A;text-decoration:none;font-size:11px;">★ Avis Google</a></div></td></tr></table>
    </div>
  </div>
</body>
</html>`;
}

function buildJ30HTML(params: { prenom: string }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="height:3px;background:#FF6B1A;border-radius:2px;margin-bottom:28px;"></div>
    <div style="background:#fff;border-radius:12px;padding:36px 32px;">
      <p style="margin:0 0 16px;font-size:15px;">Bonjour ${params.prenom},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Un mois déjà depuis la mise en ligne de votre site -
        j'espère qu'il vous apporte de belles opportunités !
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Si vous êtes satisfait de notre collaboration, un avis Google
        m'aiderait énormément à me faire connaître - ça prend 2 minutes.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="https://share.google/JgmyXhr73QGCq4yAx"
           target="_blank"
           style="display:inline-block;padding:14px 32px;background:#FF6B1A;
           color:white;border-radius:100px;font-size:15px;font-weight:600;
           text-decoration:none;">
          Laisser un avis Google ★
        </a>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:#6B6B6B;line-height:1.7;">
        Et si vous connaissez quelqu'un qui aurait besoin d'un site web,
        n'hésitez pas à me recommander !
      </p>
      <p style="margin:0 0 4px;font-size:15px;">Merci pour votre confiance,</p>
      <p style="margin:0;font-size:15px;font-weight:600;">Elodie</p>
    </div>
    <!-- Signature -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;">
      <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;"><tr><td style="padding-right:16px;border-right:2px solid #FF6B1A;vertical-align:top;"><div style="font-size:18px;font-weight:900;letter-spacing:-0.5px;">aur<span style="color:#FF6B1A;">o</span>re</div></td><td style="padding-left:16px;vertical-align:top;line-height:1.8;"><div style="font-weight:700;font-size:13px;">Élodie Penarrubia</div><div style="color:#6B6B6B;font-size:11px;">Création de sites web pour TPE et indépendants</div><div style="margin-top:4px;"><a href="https://www.agence-aurore.fr" style="color:#FF6B1A;text-decoration:none;font-size:11px;">agence-aurore.fr</a>&nbsp;·&nbsp;<a href="https://wa.me/33659659218" style="color:#FF6B1A;text-decoration:none;font-size:11px;">WhatsApp</a>&nbsp;·&nbsp;<a href="https://share.google/JgmyXhr73QGCq4yAx" style="color:#FF6B1A;text-decoration:none;font-size:11px;">★ Avis Google</a></div></td></tr></table>
    </div>
  </div>
</body>
</html>`;
}

// ─── Calcul du nombre de jours entre deux dates ───

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── API Route ───

export const GET: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response('Non autorisé', { status: 401 });
  }

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const now = new Date();
  const results = { sent: 0, errors: 0 };

  const leadsSnapshot = await db.collection('leads').get();

  for (const doc of leadsSnapshot.docs) {
    const lead = doc.data();
    const createdAt = lead.createdAt?.toDate();
    const onboardingCompletedAt = lead.onboardingCompletedAt?.toDate();

    if (!createdAt) continue;

    const daysSinceCreation = daysBetween(createdAt, now);
    const prenom = lead.prenom || lead.nom?.split(' ')[0] || 'there';

    try {
      // J+7  -  Relance devis non payé
      if (
        lead.status === 'devis-envoyé' &&
        daysSinceCreation === 7 &&
        !lead.emailJ7Sent
      ) {
        await resend.emails.send({
          from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
          to: [lead.email],
          subject: 'Votre projet web  -  toujours disponible',
          html: buildJ7HTML({ prenom }),
        });
        await doc.ref.update({ emailJ7Sent: true });
        results.sent++;
      }

      // J+30 post-livraison  -  Demande de témoignage
      if (
        lead.status === 'soldé' &&
        onboardingCompletedAt &&
        daysBetween(onboardingCompletedAt, now) === 30 &&
        !lead.emailJ30Sent
      ) {
        await resend.emails.send({
          from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
          to: [lead.email],
          subject: 'Un avis de votre part ?',
          html: buildJ30HTML({ prenom }),
        });
        await doc.ref.update({ emailJ30Sent: true });
        results.sent++;
      }
    } catch (err) {
      console.error(`[cron-emails] Erreur pour ${lead.email}:`, err);
      results.errors++;
    }
  }

  console.log(`[cron-emails] Terminé : ${results.sent} envoyés, ${results.errors} erreurs`);
  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
