import type { APIRoute } from 'astro';
import Stripe from 'stripe';

export const prerender = false;

export const POST: APIRoute = async () => {
  const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Accès formations Aurore — 1 an',
          description: 'Accès à toutes les formations vidéo : Google Business, Search Console, Analytics, Espace rédaction, Charte graphique.',
        },
        unit_amount: 700,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${import.meta.env.SITE_URL}/formations/merci/`,
    cancel_url: `${import.meta.env.SITE_URL}/formations/acces/`,
  });

  return new Response(JSON.stringify({ url: session.url }), { status: 200 });
};
