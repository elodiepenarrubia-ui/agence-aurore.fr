import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { formations, pack } from '../../data/formations';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const STRIPE_SECRET_KEY = import.meta.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    console.error('[create-formation-checkout] STRIPE_SECRET_KEY manquante');
    return new Response(
      JSON.stringify({ success: false, error: 'Configuration Stripe manquante (STRIPE_SECRET_KEY)' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { slug } = await request.json();
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    let item;
    if (slug === 'pack-complet') {
      item = pack;
    } else {
      item = formations.find(f => f.slug === slug);
    }

    if (!item) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formation introuvable' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const origin = import.meta.env.SITE_URL || new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Formation Aurore — ${item.titre}`,
            description: slug === 'pack-complet'
              ? 'Accès 1 an à toutes les formations + tous les PDFs'
              : 'Accès 1 an + PDF checklist inclus',
          },
          unit_amount: item.prix,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${origin}/formations/merci/?formation=${slug}`,
      cancel_url: `${origin}/formations/${slug === 'pack-complet' ? '' : slug + '/'}`,
    });

    return new Response(
      JSON.stringify({ success: true, url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[create-formation-checkout] Erreur Stripe:', message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
