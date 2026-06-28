import React from "react";
import { Link } from "react-router-dom";

const CORAL = '#F95738';
const BG = '#0A0A0B';
const F = "'Inter', -apple-system, system-ui, sans-serif";

function Section({ number, title, children }) {
  return (
    <section style={{ marginBottom: 72 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 28 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: CORAL,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(249,87,56,0.10)', border: '1px solid rgba(249,87,56,0.2)',
          borderRadius: 6, padding: '3px 9px', flexShrink: 0,
        }}>{number}</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{title}</h2>
      </div>
      <div style={{ paddingLeft: 0 }}>{children}</div>
    </section>
  );
}

function P({ children, style = {} }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.85, color: '#374151', marginBottom: 16, ...style }}>
      {children}
    </p>
  );
}

function SubSection({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoBox({ icon, children }) {
  return (
    <div style={{
      background: 'rgba(249,87,56,0.04)', border: '1px solid rgba(249,87,56,0.15)',
      borderRadius: 10, padding: '16px 20px', marginBottom: 16, marginTop: 8,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: '#374151' }}>{children}</div>
    </div>
  );
}

function WarningBox({ icon, children }) {
  return (
    <div style={{
      background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: 10, padding: '16px 20px', marginBottom: 16, marginTop: 8,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: '#374151' }}>{children}</div>
    </div>
  );
}

function SuccessBox({ icon, children }) {
  return (
    <div style={{
      background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: 10, padding: '16px 20px', marginBottom: 16, marginTop: 8,
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: '#374151' }}>{children}</div>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 20, marginTop: 8, borderRadius: 10, border: '1px solid #E5E7EB' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: F }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '12px 16px', textAlign: 'left', fontWeight: 600,
                color: '#374151', borderBottom: '1px solid #E5E7EB',
                fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: '13px 16px', color: '#374151', lineHeight: 1.6,
                  verticalAlign: 'top',
                  background: i % 2 === 0 ? 'white' : '#FAFAFA',
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 16 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 15, lineHeight: 1.75, color: '#374151' }}>
          <span style={{ color: CORAL, marginTop: 2, flexShrink: 0, fontSize: 10 }}>▶</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RightCard({ icon, title, desc }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #E5E7EB', borderRadius: 12,
      padding: '24px', marginBottom: 12, display: 'flex', gap: 16, alignItems: 'flex-start',
    }}>
      <div style={{
        fontSize: 24, width: 44, height: 44, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F9FAFB', borderRadius: 10, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.65 }}>{desc}</div>
      </div>
    </div>
  );
}

const TOC = [
  [1, "Introduction et mises à jour"],
  [2, "Identité du responsable du traitement"],
  [3, "Données collectées"],
  [4, "Base juridique du traitement"],
  [5, "Finalités du traitement"],
  [6, "Partage des données avec des tiers"],
  [7, "Transferts internationaux de données"],
  [8, "Durée de conservation des données"],
  [9, "Sécurité des données"],
  [10, "Cookies et technologies de suivi"],
  [11, "Vos droits en matière de données personnelles"],
  [12, "Contact et réclamations"],
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ background: '#F8F9FA', fontFamily: F, minHeight: '100vh' }}>
      {/* Navbar minimal */}
      <nav style={{
        background: 'white', borderBottom: '1px solid #E5E7EB',
        height: 58, display: 'flex', alignItems: 'center',
        padding: '0 clamp(20px, 5vw, 60px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L10.5 9H1.5L6 1Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>UseWok</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link to="/" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none', fontWeight: 500 }}>← Retour au site</Link>
      </nav>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: 'clamp(48px, 8vw, 80px) clamp(20px, 5vw, 60px)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(249,87,56,0.15)', border: '1px solid rgba(249,87,56,0.3)',
            borderRadius: 20, padding: '4px 14px', marginBottom: 20,
          }}>
            <span style={{ fontSize: 11, color: CORAL, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Conformité RGPD</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Politique de confidentialité
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
            Dernière mise à jour : <strong style={{ color: 'rgba(255,255,255,0.8)' }}>28 juin 2026</strong>
            <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
            Applicable à <strong style={{ color: 'rgba(255,255,255,0.8)' }}>usewok.com</strong>
          </p>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px, 5vw, 64px) clamp(20px, 3vw, 40px)', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }}>
        {/* Content */}
        <main>
          <Section number="1" title="Introduction et mises à jour">
            <P>La présente politique de confidentialité décrit la manière dont <strong>UseWok, Inc.</strong> et ses affiliés (ci-après « UseWok », « nous », « notre » ou « nos ») traitent les informations personnelles collectées via notre site web accessible à l'adresse <a href="https://usewok.com" style={{ color: CORAL }}>https://usewok.com</a> (le « Site ») et notre plateforme de service en ligne (la « Plateforme »).</P>
            <P>Cette politique a été rédigée conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des données à caractère personnel (« RGPD ») et à la loi française n° 78-17 du 6 janvier 1978 relative à l'informatique, aux fichiers et aux libertés (« Loi Informatique et Libertés »), telle que modifiée par la loi n° 2018-493 du 20 juin 2018.</P>
            <P>Nous pouvons mettre à jour la présente politique à tout moment en publiant une nouvelle version sur cette page et en modifiant la date de « Dernière mise à jour ». Nous vous recommandons de la consulter régulièrement. En cas de modification substantielle, nous vous en informerons par e-mail ou via une notification sur la Plateforme.</P>
          </Section>

          <Section number="2" title="Identité du responsable du traitement">
            <P>Le responsable du traitement de vos données personnelles, au sens du RGPD, est :</P>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px 28px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 12 }}>UseWok, Inc.</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 2 }}>
                <div>📍 Libourne, Gironde, France</div>
                <div>📧 <a href="mailto:privacy@usewok.com" style={{ color: CORAL }}>privacy@usewok.com</a></div>
                <div>🌐 <a href="https://usewok.com" style={{ color: CORAL }}>https://usewok.com</a></div>
              </div>
            </div>
            <P>Pour toute question relative à la présente politique ou à vos données personnelles, veuillez nous contacter à l'adresse e-mail indiquée ci-dessus. Nous nous engageons à répondre dans un délai raisonnable.</P>
          </Section>

          <Section number="3" title="Données collectées">
            <P>Nous collectons différentes catégories de données personnelles selon votre mode d'interaction avec la Plateforme.</P>

            <SubSection title="3.1 Données fournies activement par l'utilisateur">
              <BulletList items={[
                <><strong>Identité :</strong> Nom et prénom fournis lors de l'inscription directe par e-mail, ou transmis automatiquement par votre fournisseur d'authentification tiers (Google, Apple).</>,
                <><strong>Adresse e-mail :</strong> Utilisée comme identifiant principal de compte et moyen de communication avec vous.</>,
                <><strong>Mot de passe :</strong> Uniquement pour les comptes créés par e-mail. Stocké exclusivement sous forme hachée et irréversible (bcrypt). UseWok n'a jamais accès à votre mot de passe en clair.</>,
                <><strong>Contenu du support :</strong> Tout message, description de problème ou autre information que vous nous transmettez via notre système de tickets de support client.</>,
              ]} />
            </SubSection>

            <SubSection title="3.2 Données Google – Clause spécifique (Exigence Google OAuth)">
              <InfoBox icon="🔵">
                <strong>Authentification via « Continuer avec Google »</strong><br />
                Lorsque vous choisissez de vous connecter ou de créer un compte via le bouton « Continuer avec Google », UseWok accède aux données suivantes de votre compte Google, dans le cadre des permissions (scopes) limitées que vous autorisez :
              </InfoBox>
              <BulletList items={[
                <><strong>Accès :</strong> Nom, prénom, adresse e-mail, photo de profil Google. Les scopes utilisés sont strictement limités à : openid, email, profile.</>,
                <><strong>Utilisation :</strong> Ces données sont utilisées exclusivement pour créer votre compte UseWok et vous authentifier lors de vos connexions ultérieures. Elles ne sont utilisées à aucune autre fin.</>,
                <><strong>Stockage :</strong> Votre nom et votre adresse e-mail sont conservés dans notre base de données sécurisée. Votre photo de profil Google n'est pas stockée sur nos serveurs : elle est chargée dynamiquement depuis les serveurs de Google au moment de son affichage dans l'interface.</>,
                <><strong>Partage :</strong> Nous ne transférons pas, ne vendons pas et ne partageons pas vos données Google avec des tiers, à l'exception des sous-traitants techniques listés à l'article 6, dans le cadre strict de la fourniture du service et de leurs obligations contractuelles.</>,
              ]} />
              <P style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>UseWok ne demande aucun accès à vos services Google (Drive, Gmail, Calendar, Contacts, etc.). Seules les informations de profil de base sont sollicitées, conformément au principe du moindre privilège.</P>
            </SubSection>

            <SubSection title="3.3 Données Apple – Clause spécifique">
              <InfoBox icon="🍎">
                <strong>Authentification via « Continuer avec Apple »</strong>
              </InfoBox>
              <BulletList items={[
                <><strong>Accès :</strong> Adresse e-mail (réelle ou anonymisée via la fonction « Masquer mon e-mail » d'Apple), nom et prénom (uniquement lors de la première connexion, si vous choisissez de les partager).</>,
                <><strong>Utilisation :</strong> Ces données sont utilisées exclusivement pour créer et authentifier votre compte UseWok.</>,
                <><strong>Stockage :</strong> Seuls votre identifiant unique Apple et votre adresse e-mail sont conservés dans notre base de données sécurisée.</>,
                <><strong>Partage :</strong> Nous ne transférons, ni ne vendons vos données Apple à aucun tiers à des fins commerciales.</>,
              ]} />
            </SubSection>

            <SubSection title="3.4 Données collectées passivement">
              <BulletList items={[
                <><strong>Journaux de connexion :</strong> Adresse IP, horodatage des connexions et déconnexions, identifiant de session.</>,
                <><strong>Données comportementales :</strong> Pages visitées sur la Plateforme, actions effectuées (clics, navigation), durée des sessions. Ces données sont collectées via nos outils d'analyse (voir article 10).</>,
                <><strong>Données techniques :</strong> Type et version du navigateur, système d'exploitation, résolution d'écran, langue du navigateur.</>,
                <><strong>Cookies et technologies similaires :</strong> Voir l'article 10 de la présente politique.</>,
              ]} />
            </SubSection>
          </Section>

          <Section number="4" title="Base juridique du traitement">
            <P>Conformément à l'article 6 du RGPD, chaque traitement de données personnelles effectué par UseWok repose sur l'une des bases juridiques suivantes :</P>
            <Table
              headers={['Finalité du traitement', 'Base juridique RGPD']}
              rows={[
                ['Création et gestion du compte utilisateur', 'Exécution du contrat – Art. 6.1.b'],
                ['Authentification (Google, Apple, email)', 'Exécution du contrat – Art. 6.1.b'],
                ['Traitement des abonnements et paiements (Stripe)', 'Exécution du contrat – Art. 6.1.b'],
                ['Prévention des fraudes, sécurité, journalisation', 'Intérêt légitime – Art. 6.1.f'],
                ['Analyse d\'audience et amélioration du service', 'Intérêt légitime / Consentement (cookies) – Art. 6.1.a & f'],
                ['Support client', 'Exécution du contrat / Intérêt légitime – Art. 6.1.b & f'],
                ['Communications marketing et newsletters', 'Consentement explicite – Art. 6.1.a'],
                ['Conservation des données de facturation', 'Obligation légale (comptabilité) – Art. 6.1.c'],
                ['Réponse aux autorités compétentes', 'Obligation légale – Art. 6.1.c'],
              ]}
            />
          </Section>

          <Section number="5" title="Finalités du traitement">
            <P>UseWok traite vos données personnelles pour les finalités suivantes, chacune justifiée par une base juridique appropriée (voir article 4) :</P>
            <BulletList items={[
              <><strong>Fourniture du service :</strong> Créer et gérer votre compte, vous authentifier, vous donner accès aux fonctionnalités de la Plateforme auxquelles vous avez souscrit.</>,
              <><strong>Gestion des abonnements et facturation :</strong> Traiter vos paiements, gérer vos abonnements mensuels ou annuels (l'abonnement Starter bénéficie d'un essai gratuit de 7 jours), émettre les justificatifs de paiement, via notre prestataire Stripe, Inc.</>,
              <><strong>Support client :</strong> Répondre à vos demandes d'assistance via notre système de tickets, résoudre les problèmes techniques et traiter les litiges liés à l'utilisation du service.</>,
              <><strong>Sécurité et prévention des fraudes :</strong> Détecter, prévenir et traiter les tentatives d'accès non autorisé, les comportements frauduleux, les attaques informatiques et toute activité susceptible de compromettre l'intégrité de la Plateforme ou la sécurité des utilisateurs.</>,
              <><strong>Amélioration du service :</strong> Analyser l'utilisation de la Plateforme afin d'identifier les axes d'amélioration, corriger les dysfonctionnements et développer de nouvelles fonctionnalités.</>,
              <><strong>Communications transactionnelles :</strong> Vous envoyer des notifications liées à votre compte (confirmation d'inscription, alertes de sécurité, reçus de paiement, expiration d'abonnement).</>,
              <><strong>Communications marketing :</strong> Avec votre consentement explicite préalable, vous envoyer des communications promotionnelles, des newsletters ou des informations sur nos nouvelles fonctionnalités. Vous pouvez vous désinscrire à tout moment.</>,
              <><strong>Obligations légales :</strong> Respecter nos obligations légales et réglementaires, répondre aux injonctions des autorités compétentes et aux décisions de justice.</>,
            ]} />
          </Section>

          <Section number="6" title="Partage des données avec des tiers">
            <P>UseWok <strong>ne vend, ne loue et ne cède aucune donnée personnelle</strong> à des tiers à des fins commerciales.</P>
            <P>Vos données peuvent être partagées uniquement avec les catégories de sous-traitants suivants, dans le cadre strict de la fourniture du service et sur la base d'accords contractuels conformes au RGPD :</P>
            <Table
              headers={['Prestataire', 'Rôle', 'Données transmises', 'Localisation']}
              rows={[
                ['IONOS SE', 'Hébergement / Infrastructure', 'Données de compte, journaux serveur', '🇩🇪 Allemagne (Union européenne)'],
                ['Stripe, Inc.', 'Traitement sécurisé des paiements', 'Adresse e-mail, historique de paiement. Les coordonnées bancaires sont traitées directement par Stripe, jamais stockées par UseWok.', '🇺🇸 États-Unis (CCT en vigueur)'],
                ['Google LLC (Analytics)', 'Analyse d\'audience', 'Données de navigation anonymisées, adresse IP tronquée', '🇺🇸 États-Unis (CCT en vigueur)'],
                ['Base44, Inc.', 'Analyse applicative et comportementale', 'Données comportementales pseudonymisées (clics, pages)', '🇺🇸 États-Unis (CCT en vigueur)'],
                ['Futur prestataire emailing', 'Envoi de communications (avec consentement)', 'Adresse e-mail uniquement', 'À préciser lors de la mise en service'],
              ]}
            />
            <P>Tous nos sous-traitants établis hors de l'Union européenne sont soumis aux Clauses Contractuelles Types (CCT) adoptées par la Commission européenne, garantissant un niveau de protection des données équivalent à celui applicable au sein de l'UE.</P>
            <P>En dehors de ce qui précède, UseWok peut divulguer des données personnelles si la loi l'exige, dans le cadre d'une procédure judiciaire ou administrative, ou pour protéger les droits, la propriété ou la sécurité de UseWok, de ses utilisateurs ou du public en général.</P>
          </Section>

          <Section number="7" title="Transferts internationaux de données">
            <P>Notre infrastructure principale est hébergée chez IONOS SE, société de droit allemand dont les centres de données sont situés au sein de l'Union européenne. Vos données sont donc hébergées, en priorité, sur le territoire européen.</P>
            <P>Cependant, certains de nos prestataires de services sont établis aux États-Unis (Stripe, Inc. ; Google LLC ; Base44, Inc.). Des transferts de données personnelles hors de l'Espace Économique Européen (EEE) sont donc susceptibles d'intervenir dans le cadre de l'utilisation de ces services.</P>
            <P>Ces transferts sont encadrés par les garanties appropriées prévues par le RGPD, et notamment par les Clauses Contractuelles Types (CCT) issues de la décision d'exécution de la Commission européenne du 4 juin 2021, qui imposent contractuellement à ces prestataires un niveau de protection des données équivalent à celui exigé au sein de l'EEE.</P>
            <InfoBox icon="ℹ️">
              <strong>Votre droit à l'information</strong><br />
              Vous pouvez obtenir des informations supplémentaires sur les garanties encadrant ces transferts en nous contactant à <a href="mailto:privacy@usewok.com" style={{ color: CORAL }}>privacy@usewok.com</a>.
            </InfoBox>
          </Section>

          <Section number="8" title="Durée de conservation des données">
            <P>UseWok conserve vos données personnelles pour une durée n'excédant pas celle nécessaire à la finalité pour laquelle elles ont été collectées, en tenant compte de nos obligations légales et de la nécessité de traiter d'éventuels litiges.</P>
            <Table
              headers={['Catégorie de données', 'Durée de conservation', 'Justification']}
              rows={[
                ['Données de compte actif (nom, email)', "Pendant toute la durée d'activité du compte, puis 12 mois après la dernière connexion", 'Fourniture du service'],
                ["Données d'un compte supprimé par l'utilisateur", 'Suppression immédiate et irréversible à la demande', 'Droit à l\'effacement – Art. 17 RGPD'],
                ['Journaux de connexion et sécurité (logs)', '12 mois à compter de leur génération', 'Sécurité, prévention des fraudes, intérêt légitime'],
                ["Données de facturation et d'abonnement (via Stripe)", '10 ans à compter de la date de la transaction', 'Obligation légale comptable – Art. L123-22 Code de commerce français'],
                ['Conversations du support client', '3 ans à compter de la clôture du ticket', 'Intérêt légitime (gestion des litiges) – prescription triennale'],
                ['Données analytiques de navigation (Google Analytics)', '26 mois maximum (paramétrage CNIL)', 'Amélioration du service'],
                ['Données analytiques comportementales (Base44)', '12 mois maximum', 'Amélioration du service'],
              ]}
            />
            <SuccessBox icon="✅">
              <strong>Suppression de compte en quelques clics</strong><br />
              Vous pouvez supprimer votre compte à tout moment depuis votre espace personnel, sans condition. La suppression est immédiate et définitive. Seules les données soumises à une obligation légale de conservation (données de facturation) sont conservées pour la durée légale applicable, dans une base isolée du service actif.
            </SuccessBox>
          </Section>

          <Section number="9" title="Sécurité des données">
            <P>UseWok met en œuvre des mesures techniques et organisationnelles appropriées, conformément à l'article 32 du RGPD, pour assurer un niveau de sécurité adapté au risque. Ces mesures comprennent notamment :</P>
            <BulletList items={[
              <><strong>Chiffrement en transit :</strong> L'intégralité des communications entre votre navigateur et nos serveurs est chiffrée via le protocole HTTPS/TLS. Aucune donnée ne circule en clair.</>,
              <><strong>Hachage des mots de passe :</strong> Les mots de passe des comptes créés par e-mail sont transformés en empreinte cryptographique via bcrypt, un algorithme irréversible intégrant un sel aléatoire. UseWok ne peut jamais reconstituer votre mot de passe.</>,
              <><strong>Infrastructure sécurisée :</strong> Notre hébergement est assuré par IONOS SE, prestataire certifié ISO 27001 dont les centres de données répondent aux normes européennes de sécurité.</>,
              <><strong>Contrôle d'accès strict :</strong> L'accès aux données personnelles est limité au personnel de UseWok dont les fonctions l'exigent, et uniquement dans la mesure nécessaire à l'accomplissement de ces fonctions.</>,
              <><strong>Authentification sécurisée :</strong> Les connexions via Google et Apple reposent sur le protocole OAuth 2.0, standard industriel de délégation d'authentification sécurisée.</>,
            ]} />
            <WarningBox icon="⚠️">
              <strong>Aucune sécurité n'est infaillible</strong><br />
              Bien que UseWok mette tout en œuvre pour protéger vos données, aucun système de transmission ou de stockage électronique ne peut garantir une sécurité absolue. Nous vous recommandons d'utiliser un mot de passe fort et unique pour votre compte.
              <br /><br />
              En cas de violation de données personnelles susceptible d'engendrer un risque élevé pour vos droits et libertés, UseWok s'engage à notifier l'incident à la CNIL dans les 72 heures suivant sa découverte (Art. 33 RGPD), et à vous en informer sans délai injustifié si votre situation personnelle l'exige (Art. 34 RGPD).
            </WarningBox>
          </Section>

          <Section number="10" title="Cookies et technologies de suivi">
            <P>UseWok utilise des cookies et des technologies de suivi similaires pour assurer le fonctionnement du service, analyser l'audience et améliorer votre expérience utilisateur.</P>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>Types de cookies utilisés</h3>
            <Table
              headers={['Catégorie', 'Outil', 'Finalité', 'Base légale', 'Durée']}
              rows={[
                ['Essentiels', 'Cookie de session UseWok', 'Maintenir votre authentification, sécuriser votre session, mémoriser vos préférences essentielles', 'Nécessaire au service (pas de consentement requis)', 'Durée de la session'],
                ["Analyse d'audience", 'Google Analytics', 'Mesurer le trafic, analyser les parcours utilisateurs, améliorer le service', 'Consentement préalable (Art. 6.1.a RGPD)', '26 mois max'],
                ['Analyse applicative', 'Base44', 'Analyser les comportements in-app (clics, pages visitées)', 'Consentement préalable (Art. 6.1.a RGPD)', '12 mois max'],
              ]}
            />
            <P>Conformément aux recommandations de la CNIL, nous recueillons votre consentement avant de déposer tout cookie non strictement nécessaire au fonctionnement du service. Vous pouvez retirer votre consentement à tout moment via notre gestionnaire de préférences cookies accessible depuis chaque page du site.</P>
            <P>Vous pouvez également désactiver les cookies depuis les paramètres de votre navigateur. La désactivation des cookies analytiques n'affectera pas les fonctionnalités essentielles de la Plateforme.</P>
            <P style={{ fontSize: 13, color: '#6B7280' }}>Pour en savoir plus sur les cookies : <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" style={{ color: CORAL }}>www.allaboutcookies.org</a></P>
          </Section>

          <Section number="11" title="Vos droits en matière de données personnelles">
            <P>Conformément au RGPD (articles 15 à 22), vous disposez des droits suivants concernant les données personnelles que UseWok traite vous concernant :</P>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 28 }}>
              {[
                { icon: '📋', title: 'Droit d\'accès', desc: 'Obtenir confirmation que des données vous concernant sont traitées, et recevoir une copie de ces données ainsi que toutes les informations relatives à leur traitement. (Art. 15 RGPD)' },
                { icon: '✏️', title: 'Droit de rectification', desc: 'Demander la correction de toute donnée inexacte, incomplète ou obsolète vous concernant. (Art. 16 RGPD)' },
                { icon: '🗑️', title: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données personnelles (« droit à l\'oubli »), sous réserve des obligations légales de conservation qui s\'imposent à UseWok. (Art. 17 RGPD)' },
                { icon: '⛔', title: 'Droit d\'opposition', desc: 'Vous opposer, à tout moment, au traitement de vos données à des fins de marketing direct, ou lorsque le traitement repose sur l\'intérêt légitime de UseWok. (Art. 21 RGPD)' },
                { icon: '⏸️', title: 'Droit à la limitation', desc: 'Demander la suspension temporaire du traitement de vos données dans les cas prévus par la réglementation (ex. : contestation de l\'exactitude des données). (Art. 18 RGPD)' },
                { icon: '📦', title: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format structuré, couramment utilisé et lisible par machine, ou les faire transmettre directement à un autre responsable de traitement. (Art. 20 RGPD)' },
              ].map((r, i) => <RightCard key={i} {...r} />)}
            </div>
            <P>Pour exercer l'un de ces droits, veuillez nous adresser votre demande par e-mail à <a href="mailto:privacy@usewok.com" style={{ color: CORAL }}>privacy@usewok.com</a>, en précisant clairement le droit que vous souhaitez exercer. Nous pourrons vous demander de justifier de votre identité pour traiter votre demande. Nous nous engageons à répondre dans un délai d'un (1) mois à compter de la réception de votre demande. Ce délai peut être prolongé de deux mois supplémentaires en cas de demande complexe ou de nombre élevé de demandes, auquel cas nous vous en informerons.</P>
            <P>Ces droits ne sont pas absolus et peuvent être soumis aux conditions et limitations prévues par la réglementation applicable, notamment pour respecter nos obligations légales ou protéger les droits et intérêts légitimes de UseWok ou de tiers.</P>
          </Section>

          <Section number="12" title="Contact et réclamations">
            <P>Pour toute question relative à la présente politique ou à l'exercice de vos droits, veuillez contacter notre service dédié à la protection des données :</P>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px 28px', marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>UseWok, Inc. — Protection des données personnelles</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 2 }}>
                <div>📧 <a href="mailto:privacy@usewok.com" style={{ color: CORAL }}>privacy@usewok.com</a></div>
                <div>🌐 <a href="https://usewok.com" style={{ color: CORAL }}>https://usewok.com</a></div>
                <div>📍 Libourne, Gironde, France</div>
              </div>
            </div>
            <P>Si vous estimez, après nous avoir contactés, que le traitement de vos données personnelles par UseWok n'est pas conforme à la réglementation applicable en matière de protection des données, vous avez le droit de déposer une plainte auprès de l'autorité de contrôle compétente. En France, il s'agit de la :</P>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px 28px' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>CNIL – Commission Nationale de l'Informatique et des Libertés</div>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 2 }}>
                <div>📍 3 Place de Fontenoy – TSA 80715 – 75334 PARIS CEDEX 07</div>
                <div>📞 +33 (0)1 53 73 22 22</div>
                <div>🌐 <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: CORAL }}>www.cnil.fr</a></div>
              </div>
            </div>
          </Section>
        </main>

        {/* Sidebar TOC */}
        <aside style={{ position: 'sticky', top: 80 }}>
          <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Sommaire</div>
            <nav>
              {TOC.map(([num, label]) => (
                <div key={num} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: CORAL, flexShrink: 0, marginTop: 2 }}>{num}.</span>
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.4 }}>{label}</span>
                </div>
              ))}
            </nav>
          </div>
          <div style={{ background: 'rgba(249,87,56,0.06)', border: '1px solid rgba(249,87,56,0.15)', borderRadius: 12, padding: '16px', fontSize: 13, color: '#374151', lineHeight: 1.65 }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: 6 }}>Questions ?</div>
            <a href="mailto:privacy@usewok.com" style={{ color: CORAL, fontWeight: 500 }}>privacy@usewok.com</a>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '24px clamp(20px, 5vw, 60px)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
          © 2026 UseWok — L'outil français de visibilité IA ·{' '}
          <Link to="/terms" style={{ color: '#6B7280', textDecoration: 'none' }}>CGU</Link>
          {' '}·{' '}
          <Link to="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Accueil</Link>
        </p>
      </footer>

      {/* Responsive sidebar hide */}
      <style>{`
        @media (max-width: 768px) {
          aside { display: none !important; }
          main { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </div>
  );
}