import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response('Non autorisé', { status: 401 });
  }

  const { claudemd } = await request.json();

  const prompt = `Tu es un expert en copywriting pour sites web de TPE françaises.

Voici le CLAUDE.md d'un client :

${claudemd}

Génère le contenu suivant en JSON strict (sans markdown, sans backticks) :

{
  "hero": {
    "h1": "Titre H1 optimisé SEO avec mot-clé principal et ville si pertinent (max 60 caractères)",
    "tagline": "Sous-titre accrocheur orienté bénéfice client (max 80 caractères)",
    "description": "Description du hero en 2 phrases max, orientée résultats concrets pour le client"
  },
  "seo": {
    "metaTitle": "Title SEO optimisé (50-60 caractères, mot-clé + ville + marque)",
    "metaDescription": "Meta description (150-160 caractères, bénéfice + appel à l'action)"
  },
  "services": [
    {
      "nom": "Nom du service",
      "description": "Description courte orientée bénéfice (2 phrases max)",
      "benefice": "Ce que ça apporte concrètement au client final"
    }
  ],
  "apropos": {
    "titre": "Titre de la section À propos",
    "texte": "Texte de présentation du professionnel en 3-4 phrases, ton chaleureux et professionnel, à la première personne"
  },
  "faq": [
    {
      "question": "Question fréquente du client final",
      "reponse": "Réponse complète et rassurante (3-5 lignes)"
    }
  ],
  "jsonld": {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Nom de l'établissement",
    "description": "Description SEO",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Adresse si disponible",
      "addressLocality": "Ville",
      "postalCode": "Code postal si disponible",
      "addressCountry": "FR"
    },
    "telephone": "Téléphone",
    "url": "URL du site",
    "priceRange": "€€",
    "areaServed": "Zone d'intervention"
  }
}

RÈGLES IMPORTANTES :
- Ton professionnel et rassurant, jamais agressif
- Orienté résultats concrets pour les clients du professionnel
- Pas de tirets longs
- Mots-clés SEO locaux intégrés naturellement
- Adapter le vocabulaire au secteur d'activité
- Répondre UNIQUEMENT avec le JSON, rien d'autre`;

  const ANTHROPIC_API_KEY = import.meta.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'Clé API Anthropic manquante' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  try {
    const parsed = JSON.parse(text);
    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Erreur de parsing', raw: text }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
