import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { db } from '../../lib/firebase-admin';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { action, password, code } = await request.json();

  // ACTION : vérifier mot de passe + générer et envoyer OTP
  if (action === 'generate') {
    if (password !== import.meta.env.DEVIS_PASSWORD) {
      return new Response(
        JSON.stringify({ success: false, reason: 'Mot de passe incorrect' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    await db.collection('admin-otp').doc('current').set({ otp, expiresAt });

    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Aurore Admin <elodie@agence-aurore.fr>',
      to: ['elodie@agence-aurore.fr'],
      subject: `Code d'accès admin : ${otp}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#F2F2F2;font-family:Arial,sans-serif;">
          <div style="max-width:400px;margin:0 auto;padding:32px 16px;">
            <div style="height:3px;background:#FF6B1A;border-radius:2px;margin-bottom:28px;"></div>
            <div style="background:white;border-radius:12px;padding:32px;text-align:center;">
              <div style="font-size:24px;font-weight:900;margin-bottom:8px;">
                aur<span style="color:#FF6B1A;">o</span>re
              </div>
              <h2 style="margin:0 0 8px;font-size:18px;">Code d'acc\u00E8s admin</h2>
              <p style="color:#6B6B6B;font-size:13px;margin:0 0 24px;">Valable 10 minutes</p>
              <div style="font-size:40px;font-weight:900;letter-spacing:12px;color:#FF6B1A;padding:24px;background:#FFF4EE;border-radius:12px;margin-bottom:24px;">
                ${otp}
              </div>
              <p style="color:#6B6B6B;font-size:12px;margin:0;">
                Si vous n'avez pas demand\u00E9 ce code, ignorez cet email.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ACTION : vérifier le code OTP
  if (action === 'verify') {
    const doc = await db.collection('admin-otp').doc('current').get();
    const data = doc.data();

    if (!data) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'Aucun code généré' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (Date.now() > data.expiresAt) {
      await db.collection('admin-otp').doc('current').delete();
      return new Response(
        JSON.stringify({ valid: false, reason: 'Code expiré' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (code !== data.otp) {
      return new Response(
        JSON.stringify({ valid: false, reason: 'Code incorrect' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Code valide - supprimer pour éviter la réutilisation
    await db.collection('admin-otp').doc('current').delete();
    return new Response(JSON.stringify({ valid: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Action invalide' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
