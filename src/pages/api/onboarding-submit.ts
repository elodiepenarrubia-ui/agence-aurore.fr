import type { APIRoute } from 'astro';
import { db } from '../../lib/firebase-admin';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { token, ...data } = body;

    if (!token) {
      return jsonResponse({ success: false, error: 'Token manquant' }, 400);
    }

    // Vérifier le lead
    const leadDoc = await db.collection('leads').doc(token).get();
    if (!leadDoc.exists) {
      return jsonResponse({ success: false, error: 'Token invalide' }, 404);
    }

    const lead = leadDoc.data()!;
    if (lead.onboardingCompleted) {
      return jsonResponse({ success: false, error: 'Dossier déjà complété' }, 400);
    }

    // Mettre à jour Firestore
    await db.collection('leads').doc(token).update({
      ...data,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      status: 'onboarding-complété',
    });

    // Générer le CLAUDE.md
    const claudeMd = generateClaudeMd(data, lead);

    // Envoyer à Élodie
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.error('[onboarding-submit] RESEND_API_KEY manquante');
      return jsonResponse({ success: false, error: 'Configuration email manquante' }, 500);
    }
    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: 'Aurore System <elodie@agence-aurore.fr>',
      to: ['elodie@agence-aurore.fr'],
      subject: `Nouveau dossier complet - ${data.nomCommercial || lead.nom} - ${lead.offre || lead.typeProjet || 'Nouveau projet'}`,
      html: `
        <div style="font-family:Helvetica,Arial,sans-serif;padding:32px;max-width:600px;">
          <div style="height:3px;background:#FF6B1A;margin-bottom:24px;border-radius:2px;"></div>
          <h2 style="color:#1a1a1a;">Nouveau dossier reçu !</h2>
          <p style="font-size:15px;line-height:1.7;">
            <strong>${data.nomCommercial || lead.nom}</strong><br>
            Offre : ${lead.offre || lead.typeProjet || 'Non renseigné'}<br>
            Email : ${lead.email}<br>
            Téléphone : ${lead.telephone || data.telephone || ''}
          </p>
          <p style="font-size:14px;color:#666;">
            Le fichier CLAUDE.md est en pièce jointe.<br>
            Les fichiers (logo, photos) arrivent par email séparé du client.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `CLAUDE-${(data.nomCommercial || lead.nom || 'client').replace(/\s+/g, '-')}.md`,
          content: Buffer.from(claudeMd, 'utf-8'),
          content_type: 'text/markdown',
        },
      ],
    });

    // Email de confirmation au client
    const prenom = data.prenom || lead.prenom || lead.nom?.split(' ')[0] || '';
    await resend.emails.send({
      from: 'Élodie - Aurore <elodie@agence-aurore.fr>',
      to: [lead.email],
      subject: 'Dossier reçu - Je démarre votre projet !',
      html: buildDossierConfirmationHTML({ prenom }),
    });

    return jsonResponse({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[onboarding-submit] Erreur:', err);
    return jsonResponse({ success: false, error: message }, 500);
  }
};

function jsonResponse(data: object, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function buildDossierConfirmationHTML(params: { prenom: string }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F2F2F2;font-family:Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="height:3px;background:#FF6B1A;border-radius:2px;margin-bottom:28px;"></div>
    <div style="background:#fff;border-radius:12px;padding:36px 32px;">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Bonjour ${params.prenom},
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
        Votre dossier a bien été reçu - merci !
      </p>
      <div style="background:#FFF4EE;border-radius:10px;padding:20px 24px;margin:24px 0;">
        <p style="margin:0 0 8px;font-weight:600;font-size:15px;">La suite :</p>
        <p style="margin:2px 0;font-size:14px;">&rarr; Je prends connaissance de votre dossier</p>
        <p style="margin:2px 0;font-size:14px;">&rarr; Je démarre la création de votre site sous 48h</p>
        <p style="margin:2px 0;font-size:14px;">&rarr; Je vous envoie un lien de prévisualisation</p>
      </div>
      <p style="margin:0 0 4px;font-size:14px;">
        N'oubliez pas de m'envoyer vos fichiers par email si ce n'est pas encore fait.
      </p>
      <p style="margin:24px 0 0;font-size:15px;">
        A très vite,<br>
        <strong>Elodie</strong>
      </p>
    </div>
    <!-- Signature -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;">
      <table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;color:#1a1a1a;"><tr><td style="padding-right:16px;border-right:2px solid #FF6B1A;vertical-align:top;"><div style="font-size:18px;font-weight:900;letter-spacing:-0.5px;">aur<span style="color:#FF6B1A;">o</span>re</div></td><td style="padding-left:16px;vertical-align:top;line-height:1.8;"><div style="font-weight:700;font-size:13px;">Élodie Penarrubia</div><div style="color:#6B6B6B;font-size:11px;">Création de sites web pour TPE et indépendants</div><div style="margin-top:4px;"><a href="https://www.agence-aurore.fr" style="color:#FF6B1A;text-decoration:none;font-size:11px;">agence-aurore.fr</a>&nbsp;·&nbsp;<a href="https://wa.me/33659659218" style="color:#FF6B1A;text-decoration:none;font-size:11px;">WhatsApp</a>&nbsp;·&nbsp;<a href="https://share.google/JgmyXhr73QGCq4yAx" style="color:#FF6B1A;text-decoration:none;font-size:11px;">★ Avis Google</a></div></td></tr></table>
    </div>
  </div>
</body>
</html>`;
}

function generateClaudeMd(data: any, lead: any): string {
  const offre = lead.offre || lead.typeProjet || 'Starter';
  const lower = offre.toLowerCase();

  // Determine offer category
  let category = 'site';
  if (lower.includes('migration')) category = 'migration';
  else if (lower.includes('seo')) category = 'seo';
  else if (lower.includes('automatisation')) category = 'auto';
  else if (lower.includes('google') || lower.includes('gbp')) category = 'gbp';
  else if (lower.includes('logiciel')) category = 'logiciel';

  function getSkillsForOffre(offerType: string, offre: string): string {
    const offreLower = offre.toLowerCase();
    if (offerType === 'site') {
      if (offreLower.includes('pro') || offreLower.includes('réservation') || offreLower.includes('reservation')) {
        return '- aurore-astro-setup\n- aurore-seo\n- aurore-resend\n- aurore-firebase-cms\n- aurore-auth-simple\n- aurore-stripe-workflow';
      }
      if (offreLower.includes('vitrine')) {
        return '- aurore-astro-setup\n- aurore-seo\n- aurore-resend\n- aurore-firebase-cms\n- aurore-auth-simple';
      }
      return '- aurore-astro-setup\n- aurore-seo\n- aurore-resend';
    }
    if (offerType === 'migration') {
      return '- aurore-astro-setup\n- aurore-seo\n- aurore-resend';
    }
    if (offerType === 'seo') {
      return '- aurore-seo';
    }
    if (offerType === 'auto') {
      return '- aurore-resend\n- aurore-stripe-workflow';
    }
    if (offerType === 'gbp') {
      return '- aurore-seo';
    }
    if (offerType === 'logiciel') {
      return '- aurore-astro-setup\n- aurore-firebase-cms\n- aurore-auth-simple';
    }
    return '- aurore-astro-setup\n- aurore-seo\n- aurore-resend';
  }

  const schemaTypes: Record<string, string> = {
    'santé': 'HealthAndBeautyBusiness',
    'restaurant': 'Restaurant',
    'artisan': 'LocalBusiness',
    'coach': 'LocalBusiness',
    'immobilier': 'RealEstateAgent',
    'avocat': 'LegalService',
    'architecte': 'ProfessionalService',
    'photographe': 'ProfessionalService',
    'commerce': 'Store',
    'autre': 'LocalBusiness',
  };

  // Common header
  let md = `# CLAUDE.md — ${data.nomCommercial || lead.nom}

## Offre
${lead.offre || lead.typeProjet || 'Starter'}

## Skills à charger
${getSkillsForOffre(category, offre)}

---

## Infos client
- Nom commercial : ${data.nomCommercial || lead.entreprise || ''}
- Secteur : ${data.secteur || ''}
- Gérant : ${data.prenom || ''} ${data.nom || lead.nom || ''}
- Email : ${lead.email}
- Téléphone : ${lead.telephone || data.telephone || ''}
- Adresse : ${data.adresse || ''}
- Ville : ${data.ville || ''} ${data.codePostal || ''}
${data.siren ? `- SIREN : ${data.siren}` : ''}
`;

  // Offer-specific sections
  if (category === 'site') {
    md += `
## Objectif & cible
- Objectif principal : ${data.objectifSite || 'À compléter'}
- Type de clientèle : ${data.typeClientele || 'À compléter'}
- Tranche d'âge : ${data.trancheAge || 'À compléter'}
- Douleur principale clients : ${data.douleurClients || 'À compléter'}

## Réseaux sociaux
${data.instagram ? `- Instagram : ${data.instagram}` : ''}
${data.facebook ? `- Facebook : ${data.facebook}` : ''}
${data.linkedin ? `- LinkedIn : ${data.linkedin}` : ''}
${data.tiktok ? `- TikTok : ${data.tiktok}` : ''}
${data.avisGoogle === 'oui' ? `- Avis Google : Oui — ${data.lienGBP || 'lien à récupérer'}` : '- Avis Google : Non'}

## Identité visuelle
- Couleurs : ${data.couleurs?.filter(Boolean).join(', ') || 'À définir'}
- Polices : ${data.polices || 'À définir'}
- Ton rédactionnel : ${Array.isArray(data.tons) ? data.tons.join(', ') : (data.tons || 'À définir')}
- Inspirations : ${data.inspirations?.filter(Boolean).join(', ') || 'Aucune'}
- Concurrents : ${data.concurrents?.filter(Boolean).join(', ') || 'Aucun'}

## Contenu

### Hero
- Titre : ${data.titrePrincipal || 'À compléter'}
- Sous-titre : ${data.sousTitre || 'À compléter'}

### Présentation
${data.presentation || 'À compléter'}

### Services
${data.services?.filter((s: any) => s.nom).map((s: any, i: number) =>
    `${i + 1}. **${s.nom}**${s.description ? `\n   ${s.description}` : ''}${s.prix ? `\n   Prix : ${s.prix}` : ''}`
  ).join('\n\n') || 'À compléter'}

### Points forts
${data.pointsForts?.filter(Boolean).map((p: string, i: number) => `${i + 1}. ${p}`).join('\n') || 'À compléter'}

### Témoignages
${data.temoignages?.filter((t: any) => t.nom && t.texte).map((t: any, i: number) =>
    `${i + 1}. **${t.nom}**${t.entreprise ? ` (${t.entreprise})` : ''}\n   "${t.texte}"`
  ).join('\n\n') || 'À compléter'}

${data.systemeReservation ? `### Réservation\n- Système souhaité : ${data.systemeReservation}` : ''}

## SEO
- Mot-clé principal : ${data.motCle || 'À compléter'}
- Mots-clés secondaires : ${data.motsClesSecondaires?.filter(Boolean).join(', ') || 'À compléter'}
- Description Google Business : ${data.descriptionGBP || 'À compléter'}
- Schema.org : ${schemaTypes[data.secteur] || 'LocalBusiness'}
- Fourchette de prix : ${data.fourchettePrix || '€€'}
- Horaires : ${data.horaires || 'À compléter'}
- Domaine : ${data.domaine || 'À configurer'}
- Registrar : ${data.registrar || 'À déterminer'}
`;
  } else if (category === 'migration') {
    md += `
## Site actuel
- URL : ${data.siteActuel || 'À compléter'}
- Plateforme : ${data.plateforme || 'À compléter'}
- Hébergeur : ${data.hebergeur || 'À compléter'}
- Domaine : ${data.domaine || 'À compléter'}
- Registrar : ${data.registrar || 'À compléter'}
- Ce qu'on garde : ${data.aGarder || 'À compléter'}
- Ce qu'on change : ${data.aChanger || 'À compléter'}

## Identité visuelle
- Couleurs : ${data.couleurs?.filter(Boolean).join(', ') || 'À définir'}
- Polices : ${data.polices || 'À définir'}
- Ton rédactionnel : ${Array.isArray(data.tons) ? data.tons.join(', ') : (data.tons || 'À définir')}
- Inspirations : ${data.inspirations?.filter(Boolean).join(', ') || 'Aucune'}
- Concurrents : ${data.concurrents?.filter(Boolean).join(', ') || 'Aucun'}

## SEO actuel
- Mots-clés ciblés : ${data.motsClesActuels || 'À compléter'}
- Positions connues : ${data.positionsActuelles || 'À compléter'}
- Backlinks : ${data.backlinks || 'À compléter'}
- Objectif SEO post-migration : ${data.objectifSEO || 'À compléter'}
`;
  } else if (category === 'seo') {
    md += `
## Situation actuelle
- URL : ${data.urlSite || 'À compléter'}
- Plateforme : ${data.plateforme || 'À compléter'}
- Accès Search Console : ${data.accesSearchConsole || 'Non'}
- Accès Analytics : ${data.accesAnalytics || 'Non'}
- Accès GBP : ${data.accesGBP || 'Non'}
- Mots-clés ciblés : ${data.motsClesActuels || 'À compléter'}
- Positions actuelles : ${data.positionsActuelles || 'À compléter'}
- Concurrents mieux classés : ${data.concurrentsSEO || 'À compléter'}

## Objectifs
- Objectif principal : ${data.objectifSEO || 'À compléter'}
- Budget contenu : ${data.budgetContenu || 'À compléter'}
- Délai souhaité : ${data.delaiResultats || 'À compléter'}
`;
  } else if (category === 'auto') {
    md += `
## Automatisation
- Tâche à automatiser : ${data.tacheAuto || 'À compléter'}
- Outils actuels : ${Array.isArray(data.outilsActuels) ? data.outilsActuels.join(', ') : (data.outilsActuels || 'À compléter')}
- Fréquence : ${data.frequence || 'À compléter'} fois/semaine
- Temps par occurrence : ${data.tempsParOccurrence || 'À compléter'}
- Budget outil : ${data.budgetOutil || 'À compléter'}

## Accès & résultat
- Accès API : ${data.accesAPI || 'À compléter'}
- Résultat attendu : ${data.resultatAttendu || 'À compléter'}
`;
  } else if (category === 'gbp') {
    md += `
## Fiche Google Business
- Fiche existante : ${data.ficheExistante || 'Non'}
${data.ficheExistante === 'oui' ? `- URL fiche : ${data.urlFiche || 'À compléter'}\n- Email Google : ${data.emailGoogle || 'À compléter'}` : ''}
- Nom établissement : ${data.nomEtablissement || 'À compléter'}
- Catégorie : ${data.categorie || 'À compléter'}
- Adresse : ${data.adresse || ''} ${data.codePostal || ''} ${data.ville || ''}
- Horaires : ${data.horaires || 'À compléter'}
- Site web : ${data.siteWeb || 'À compléter'}
- Description : ${data.descriptionGBP || 'À compléter'}
- Mots-clés : ${data.motsClesGBP || 'À compléter'}
- Photos : ${data.photosGBP || 'À compléter'}
`;
  } else if (category === 'logiciel') {
    md += `
## Projet logiciel
- Description : ${data.descriptionLogiciel || 'À compléter'}
- Utilisateurs : ${data.utilisateurs || 'À compléter'}
- Fonctionnalités indispensables : ${data.fonctionnalitesIndispensables || 'À compléter'}
- Fonctionnalités souhaitées : ${data.fonctionnalitesSouhaitees || 'À compléter'}
- Inspirations/concurrents : ${data.inspirationsLogiciel || 'À compléter'}
- Budget : ${data.budgetLogiciel || 'À définir'}
- Délai : ${data.delaiLogiciel || 'À définir'}

## Technique
- Hébergeur/domaine existant : ${data.hebergeurExistant || 'Non'}
${data.hebergeurExistant === 'oui' ? `- Détails : ${data.hebergeurDetails || 'À compléter'}` : ''}
- Contraintes techniques : ${data.contraintesTechniques || 'Aucune'}
- Maquettes/wireframes : ${data.maquettes || 'Non'}
`;
  }

  // Common footer
  md += `
## Assets (envoyés par email séparé)
- Logo : à récupérer dans l'email du client
- Photos : à récupérer dans l'email du client
- Documents : à récupérer dans l'email du client

## Notes particulières
${data.notes || 'Aucune note particulière.'}

> Champs vides : à compléter par Élodie lors du premier échange avec le client.

## Checklist avant de démarrer
- [ ] CLAUDE.md lu en entier
- [ ] Skills chargées dans l'ordre
- [ ] Assets reçus par email
- [ ] Domaine confirmé avec le client
- [ ] Variables d'environnement configurées dans Vercel
`;

  return md;
}
