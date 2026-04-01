import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { randomUUID } from 'crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response('Non autorisé', { status: 401 });
  }

  const { devisId, clientEmail, clientName, offre, totalHT } = await request.json();

  // Vérifier si un lead avec cet email existe déjà
  const existing = await db.collection('leads')
    .where('email', '==', clientEmail)
    .limit(1)
    .get();

  if (!existing.empty) {
    return new Response(
      JSON.stringify({ success: false, reason: 'Un lead existe déjà pour cet email' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Extraire prénom et nom
  const parts = clientName.trim().split(' ');
  const prenom = parts[0] || '';
  const nom = parts.slice(1).join(' ') || '';

  // Créer le lead
  const leadToken = randomUUID();
  await db.collection('leads').doc(leadToken).set({
    token: leadToken,
    nom: `${prenom} ${nom}`.trim(),
    prenom,
    email: clientEmail,
    telephone: '',
    entreprise: '',
    typeProjet: offre || 'Devis manuel',
    offre: offre || '',
    message: `Lead créé manuellement depuis le devis ${devisId}`,
    activite: '',
    ville: '',
    createdAt: new Date(),
    status: 'devis-envoyé',
    onboardingCompleted: false,
    devisId,
    totalHT,
    emailJ1Sent: false,
    emailJ7Sent: false,
  });

  return new Response(
    JSON.stringify({ success: true, token: leadToken }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
