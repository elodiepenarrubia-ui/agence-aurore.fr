import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { db } from '../../lib/firebase-admin';
import { randomUUID } from 'crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      // Step 1
      projectType, projectTypeLabel, activite, ville,
      // Step 2 - site
      hasLogo, hasDomain, budgetSite, delaiSite,
      // Step 2 - logiciel
      besoin, hasTools, outils, budgetLogiciel, delaiLogiciel,
      // Step 2 - carte
      prestations, hasSite, plateforme, budgetCarte,
      // Step 3 - coordonnées
      prenom, nom, email, telephone, messageComplementaire,
    } = body;

    if (!prenom || !nom || !email || !projectType) {
      return new Response(
        JSON.stringify({ error: 'Veuillez remplir tous les champs obligatoires.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sauvegarder le lead dans Firestore
    const token = randomUUID();
    try {
      await db.collection('leads').doc(token).set({
        token,
        nom: `${prenom} ${nom}`.trim(),
        prenom: prenom || '',
        email,
        telephone: telephone || '',
        entreprise: body.entreprise || '',
        typeProjet: projectTypeLabel || projectType || '',
        offre: body.offre || '',
        message: messageComplementaire || '',
        activite: activite || '',
        ville: ville || '',
        createdAt: new Date(),
        status: 'nouveau',
        onboardingCompleted: false,
      });
    } catch (firestoreErr) {
      console.error('[contact] Erreur Firestore:', firestoreErr);
      // Ne pas bloquer l'envoi d'email si Firestore échoue
    }

    const resend = new Resend(import.meta.env.RESEND_API_KEY);

    // Build situation section based on project type
    let situationHtml = '';
    if (projectType === 'site-vitrine' || projectType === 'site-reservation') {
      situationHtml = `
        ${row('Logo existant', hasLogo || 'Non renseigné')}
        ${row('Nom de domaine', hasDomain || 'Non renseigné')}
        ${row('Budget estimé', formatBudget(budgetSite))}
        ${row('Délai souhaité', formatDelai(delaiSite))}
      `;
    } else if (projectType === 'logiciel-metier') {
      situationHtml = `
        ${row('Besoin décrit', besoin || 'Non renseigné')}
        ${row('Outils existants', hasTools === 'oui' ? `Oui — ${escapeHtml(outils || '')}` : (hasTools === 'non' ? 'Non' : 'Non renseigné'))}
        ${row('Budget estimé', formatBudget(budgetLogiciel))}
        ${row('Délai souhaité', formatDelai(delaiLogiciel))}
      `;
    } else if (projectType === 'prestation-carte') {
      const prestLabels = Array.isArray(prestations) && prestations.length > 0
        ? prestations.map((p: string) => escapeHtml(p)).join(', ')
        : 'Non renseigné';
      situationHtml = `
        ${row('Prestations', prestLabels)}
        ${row('Site existant', hasSite === 'oui' ? `Oui — ${escapeHtml(plateforme || '')}` : (hasSite === 'non' ? 'Non' : 'Non renseigné'))}
        ${row('Budget estimé', formatBudget(budgetCarte))}
      `;
    }

    const fullName = `${escapeHtml(prenom)} ${escapeHtml(nom)}`;
    const subject = `Nouvelle demande ${escapeHtml(projectTypeLabel || projectType)} — ${fullName} — ${escapeHtml(ville || 'Ville non renseignée')}`;

    await resend.emails.send({
      from: 'contact@agence-aurore.fr',
      to: 'elodie@agence-aurore.fr',
      subject,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #0A0A0A;">
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 24px; color: #0A0A0A;">
            Nouvelle demande de contact
          </h2>

          ${sectionHeader('Projet')}
          <table style="width: 100%; border-collapse: collapse;">
            ${row('Type de projet', escapeHtml(projectTypeLabel || projectType))}
            ${row('Activité / secteur', activite || 'Non renseigné')}
            ${row('Ville', ville || 'Non renseignée')}
          </table>

          ${sectionHeader('Situation')}
          <table style="width: 100%; border-collapse: collapse;">
            ${situationHtml}
          </table>

          ${sectionHeader('Coordonnées')}
          <table style="width: 100%; border-collapse: collapse;">
            ${row('Nom', fullName)}
            ${row('Email', `<a href="mailto:${escapeHtml(email)}" style="color: #FF6B1A;">${escapeHtml(email)}</a>`)}
            ${row('Téléphone', telephone ? escapeHtml(telephone) : '<em style="color: #6B6B6B;">Non renseigné</em>')}
            ${row('Message', messageComplementaire ? escapeHtml(messageComplementaire) : '<em style="color: #6B6B6B;">Aucun</em>')}
          </table>

          <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f0f0f0;text-align:center;">
            <p style="margin:0 0 12px;font-size:13px;color:#6B6B6B;">
              Créer le devis pour ce client :
            </p>
            <a href="${buildDevisUrl({ prenom, nom, email, telephone, projectType })}"
              target="_blank"
              style="display:inline-block;padding:12px 28px;
              background:#FF6B1A;color:white;border-radius:100px;
              font-size:14px;font-weight:600;text-decoration:none;">
              Générer le devis →
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #F2F2F2; margin: 32px 0 16px;" />
          <p style="font-size: 12px; color: #6B6B6B;">
            Ce message a été envoyé depuis le formulaire de contact de agence-aurore.fr
          </p>
        </div>
      `,
      replyTo: email,
    });

    // Email de confirmation automatique au client
    const budgetDisplay = projectType === 'logiciel-metier'
      ? formatBudget(budgetLogiciel)
      : projectType === 'prestation-carte'
        ? formatBudget(budgetCarte)
        : formatBudget(budgetSite);

    await resend.emails.send({
      from: 'elodie@agence-aurore.fr',
      to: email,
      replyTo: 'elodie@agence-aurore.fr',
      subject: 'Votre demande a bien été reçue — aurore',
      html: `
        <div style="font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FFFFFF;">
          <!-- Header -->
          <div style="padding: 40px 32px 24px; text-align: center;">
            <span style="font-size: 28px; font-weight: 700; letter-spacing: -0.04em; color: #0A0A0A;">aur<span style="color: #FF6B1A;">o</span>re</span>
          </div>

          <!-- Body -->
          <div style="padding: 0 32px;">
            <h1 style="font-size: 22px; font-weight: 700; color: #0A0A0A; line-height: 1.3; margin: 0 0 20px;">
              Bonjour ${escapeHtml(prenom)}, votre demande est bien reçue.
            </h1>

            <p style="font-size: 15px; line-height: 1.6; color: #3D3D3D; margin: 0 0 28px;">
              Merci pour votre message. J'ai bien reçu votre demande concernant <strong>${escapeHtml(projectTypeLabel || projectType)}</strong> et je vous réponds avec un devis détaillé sous 48h ouvrées.
            </p>

            <!-- Bloc récap -->
            <div style="background: #F8F8F8; border-radius: 14px; padding: 24px 28px; margin-bottom: 28px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.05em; width: 140px; vertical-align: top;">Type de projet</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #0A0A0A;">${escapeHtml(projectTypeLabel || projectType)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: top;">Ville</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #0A0A0A;">${escapeHtml(ville || 'Non renseignée')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #6B6B6B; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: top;">Budget estimé</td>
                  <td style="padding: 8px 0; font-size: 15px; color: #0A0A0A;">${budgetDisplay}</td>
                </tr>
              </table>
            </div>

            <p style="font-size: 15px; line-height: 1.6; color: #3D3D3D; margin: 0 0 24px;">
              En attendant, vous pouvez utiliser notre simulateur pour estimer vos économies potentielles.
            </p>

            <!-- Bouton CTA -->
            <div style="text-align: center; margin-bottom: 36px;">
              <a href="https://agence-aurore.fr/simulateur/" style="display: inline-block; background: #FF6B1A; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 100px;">Voir le simulateur</a>
            </div>
          </div>

          <!-- Séparateur -->
          <hr style="border: none; border-top: 1px solid #F2F2F2; margin: 0 32px;" />

          <!-- Pied de page -->
          <div style="padding: 24px 32px 16px; text-align: center;">
            <p style="font-size: 14px; color: #3D3D3D; margin: 0 0 4px; font-weight: 600;">
              Élodie — <span style="font-weight: 700; letter-spacing: -0.03em;">aur<span style="color: #FF6B1A;">o</span>re</span>
            </p>
            <p style="font-size: 13px; color: #6B6B6B; margin: 0 0 2px;">
              agence-aurore.fr · elodie@agence-aurore.fr · 06 59 65 92 18
            </p>
          </div>

          <!-- Mention RGPD -->
          <div style="padding: 8px 32px 32px; text-align: center;">
            <p style="font-size: 11px; color: #C4C4C4; margin: 0; line-height: 1.5;">
              Vous recevez cet email car vous avez soumis une demande sur agence-aurore.fr. Conformément au RGPD, vos données sont utilisées uniquement pour traiter votre demande.
            </p>
          </div>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors de l\'envoi du message.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sectionHeader(title: string): string {
  return `<h3 style="font-size: 14px; font-weight: 700; color: #FF6B1A; text-transform: uppercase; letter-spacing: 0.1em; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #FFF3EB;">${title}</h3>`;
}

function row(label: string, value: string): string {
  const safeValue = value || '<em style="color: #6B6B6B;">Non renseigné</em>';
  return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #F2F2F2; font-weight: 600; width: 160px; vertical-align: top; font-size: 14px;">${label}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #F2F2F2; font-size: 14px;">${safeValue}</td>
    </tr>
  `;
}

function formatBudget(val: string): string {
  const labels: Record<string, string> = {
    'moins-500': 'Moins de 500 €',
    '500-1000': '500 € à 1 000 €',
    '1000-1500': '1 000 € à 1 500 €',
    'plus-1500': 'Plus de 1 500 €',
    '1000-3000': '1 000 € à 3 000 €',
    '3000-6000': '3 000 € à 6 000 €',
    'plus-6000': 'Plus de 6 000 €',
    'moins-200': 'Moins de 200 €',
    '200-500': '200 € à 500 €',
    'plus-500': 'Plus de 500 €',
  };
  return labels[val] || 'Non renseigné';
}

function formatDelai(val: string): string {
  const labels: Record<string, string> = {
    'asap': 'Dès que possible',
    'dans-le-mois': 'Dans le mois',
    'pas-urgent': 'Pas urgent',
  };
  return labels[val] || 'Non renseigné';
}

function buildDevisUrl(params: { prenom: string; nom: string; email: string; telephone: string; projectType: string }): string {
  const url = new URL('https://www.agence-aurore.fr/devis-generateur/');
  if (params.prenom) url.searchParams.set('prenom', params.prenom);
  if (params.nom) url.searchParams.set('nom', params.nom);
  if (params.email) url.searchParams.set('email', params.email);
  if (params.telephone) url.searchParams.set('tel', params.telephone);

  const offreMap: Record<string, string> = {
    'site-vitrine': 'vitrine',
    'site-reservation': 'pro',
    'logiciel-metier': '',
    'prestation-carte': '',
  };
  const offre = offreMap[params.projectType] || '';
  if (offre) url.searchParams.set('offre', offre);

  return url.toString();
}
