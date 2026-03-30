import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-api-token');
  if (token !== import.meta.env.API_SECRET_TOKEN) {
    return new Response('Non autorisé', { status: 401 });
  }

  const { url } = await request.json();

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuroraAudit/1.0)' }
    });
    const html = await response.text();

    const schema = analyzeSchema(html);
    const content = analyzeContent(html);
    const perf = analyzePerformance(html);

    const results: Record<string, any> = {
      url,
      title: extractTag(html, 'title'),
      metaDescription: extractMeta(html, 'description'),
      h1: extractH1(html),
      h2Count: countTags(html, 'h2'),
      hasGoogleAnalytics: html.includes('gtag') || html.includes('GA_MEASUREMENT_ID') || html.includes('G-'),
      hasGTM: html.includes('googletagmanager'),
      platform: detectPlatform(html),
      hasViewport: html.includes('name="viewport"'),
      hasSitemap: false,
      hasRobots: false,
      imageCount: countImages(html),
      imagesWithoutAlt: countImagesWithoutAlt(html),
      hasCanonical: html.includes('rel="canonical"'),
      keywordStuffing: detectKeywordStuffing(html),
      internalLinks: countInternalLinks(html, url),
      httpsEnabled: url.startsWith('https'),
      schema,
      content,
      perf,
    };

    try {
      const sitemapRes = await fetch(`${new URL(url).origin}/sitemap.xml`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuroraAudit/1.0)' }
      });
      results.hasSitemap = sitemapRes.ok;
    } catch {}

    try {
      const robotsRes = await fetch(`${new URL(url).origin}/robots.txt`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuroraAudit/1.0)' }
      });
      results.hasRobots = robotsRes.ok;
    } catch {}

    return new Response(JSON.stringify(results), { status: 200 });

  } catch {
    return new Response(JSON.stringify({ error: "Impossible d'analyser ce site" }), { status: 400 });
  }
};

// ─── SCHEMA.ORG ───

function analyzeSchema(html: string) {
  const schemas: string[] = [];
  const regex = /application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const json = JSON.parse(match[1]);
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        const type = item['@type'] || '';
        if (Array.isArray(type)) schemas.push(...type);
        else if (type) schemas.push(type);
        // Check @graph
        if (item['@graph'] && Array.isArray(item['@graph'])) {
          for (const g of item['@graph']) {
            const gt = g['@type'] || '';
            if (Array.isArray(gt)) schemas.push(...gt);
            else if (gt) schemas.push(gt);
          }
        }
      }
    } catch {}
  }
  return {
    hasSchema: schemas.length > 0,
    types: [...new Set(schemas)],
    hasLocalBusiness: schemas.some(t =>
      ['LocalBusiness', 'ProfessionalService', 'Store', 'Restaurant',
       'MedicalBusiness', 'HealthAndBeautyBusiness', 'LegalService',
       'RealEstateAgent', 'AutoRepair', 'FinancialService'].includes(t)
    ),
    hasFAQPage: schemas.includes('FAQPage'),
    hasReview: schemas.some(t => ['Review', 'AggregateRating'].includes(t)),
    hasService: schemas.includes('Service'),
  };
}

// ─── CONTENT ───

function analyzeContent(html: string) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[1] : '';
  const bodyText = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const wordCount = bodyText.split(' ').filter(w => w.length > 2).length;

  const hasFAQ = html.includes('FAQPage') ||
    html.includes('<details') ||
    /question|faq|frequemment|frequently/i.test(html);

  const hasBlog = /blog|article|actualit|news/i.test(html);

  const hasAddress = /\d{5}/.test(html);

  const hasPhone = /0[1-9][\s.\-]?(\d{2}[\s.\-]?){4}/.test(html) ||
    /\+33/.test(html);

  const textLength = bodyText.length;
  const htmlLength = html.length;
  const textHtmlRatio = htmlLength > 0 ? Math.round((textLength / htmlLength) * 100) : 0;

  return { wordCount, hasFAQ, hasBlog, hasAddress, hasPhone, textHtmlRatio };
}

// ─── PERFORMANCE ───

function analyzePerformance(html: string) {
  return {
    pageSizeKb: Math.round(html.length / 1024),
    scriptCount: (html.match(/<script/gi) || []).length,
    hasWebP: html.includes('.webp'),
    hasLazyLoading: html.includes('loading="lazy"') || html.includes("loading='lazy'"),
  };
}

// ─── EXISTING HELPERS ───

function extractTag(html: string, tag: string): string | null {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'));
  return match ? match[1].trim() : null;
}

function extractMeta(html: string, name: string): string | null {
  const match = html.match(new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'))
    || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'));
  return match ? match[1].trim() : null;
}

function extractH1(html: string): string | null {
  const match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? match[1].replace(/<[^>]*>/g, '').trim() : null;
}

function countTags(html: string, tag: string): number {
  return (html.match(new RegExp(`<${tag}[\\s>]`, 'gi')) || []).length;
}

function detectPlatform(html: string): string {
  if (html.includes('wp-content') || html.includes('wp-includes')) return 'WordPress';
  if (html.includes('wix.com') || html.includes('wixsite')) return 'Wix';
  if (html.includes('squarespace')) return 'Squarespace';
  if (html.includes('webador') || html.includes('jouwweb')) return 'Webador';
  if (html.includes('shopify')) return 'Shopify';
  if (html.includes('jimdo')) return 'Jimdo';
  if (html.includes('astro') || html.includes('_astro')) return 'Astro';
  return 'Inconnu';
}

function countImages(html: string): number {
  return (html.match(/<img/gi) || []).length;
}

function countImagesWithoutAlt(html: string): number {
  const imgTags = html.match(/<img[^>]*/gi) || [];
  return imgTags.filter(tag => !tag.includes('alt=') || tag.includes('alt=""') || tag.includes("alt=''")).length;
}

function detectKeywordStuffing(html: string): boolean {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return false;
  const text = bodyMatch[1].replace(/<[^>]*>/g, ' ');
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  const freq: Record<string, number> = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const maxFreq = Math.max(...Object.values(freq));
  return maxFreq > 20;
}

function countInternalLinks(html: string, url: string): number {
  try {
    const domain = new URL(url).hostname;
    const links = html.match(/href=["'][^"']*["']/gi) || [];
    return links.filter(l => l.includes(domain) || l.startsWith('href="/')).length;
  } catch { return 0; }
}
