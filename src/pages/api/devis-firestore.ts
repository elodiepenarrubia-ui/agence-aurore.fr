import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response('Non autorisé', { status: 401 });
  }

  const { action, devis, devisId, clientEmail } = await request.json();

  // ACTION : sauvegarder un devis
  if (action === 'save') {
    await db.collection('devis').doc(devis.id).set({
      ...devis,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    }, { merge: true });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ACTION : mettre à jour le statut
  if (action === 'update-statut') {
    await db.collection('devis').doc(devisId).update({
      statut: devis.statut,
      updatedAt: Timestamp.now(),
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ACTION : récupérer tous les devis
  if (action === 'get-all') {
    const snapshot = await db.collection('devis')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get();
    const devisList = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date || '',
        clientName: data.clientName || '',
        clientEmail: data.clientEmail || '',
        totalHT: data.totalHT || 0,
        acomptePct: data.acomptePct || 50,
        statut: data.statut || 'envoyé',
      };
    });
    return new Response(JSON.stringify({ devis: devisList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ACTION : supprimer un devis + lead associé (RGPD)
  if (action === 'delete') {
    await db.collection('devis').doc(devisId).delete();

    if (clientEmail) {
      const leadsSnapshot = await db.collection('leads')
        .where('email', '==', clientEmail)
        .get();
      const batch = db.batch();
      leadsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Action invalide' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};
