import React from "react";
import { Link } from "react-router-dom";

const CORAL = '#F95738';

function Section({ number, title, children }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 24 }}>
        <span style={{
          fontSize: 12, fontWeight: 700, color: CORAL,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'rgba(249,87,56,0.10)', border: '1px solid rgba(249,87,56,0.2)',
          borderRadius: 6, padding: '3px 9px', flexShrink: 0,
        }}>{number}</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>{title}</h2>
      </div>
      {children}
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
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 12 }}>{title}</h3>
      {children}
    </div>
  );
}

function InfoBox({ icon, children }) {
  return (
    <div style={{
      background: 'rgba(59,139,235,0.05)', border: '1px solid rgba(59,139,235,0.2)',
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

function BulletList({ items }) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: 'none', marginBottom: 16 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 15, lineHeight: 1.75, color: '#374151' }}>
          <span style={{ color: CORAL, marginTop: 4, flexShrink: 0, fontSize: 10 }}>▶</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const TOC = [
  [1, "Définitions"],
  [2, "Objet du Service"],
  [3, "Création de compte et accès"],
  [4, "Abonnements et conditions financières"],
  [5, "Propriété intellectuelle"],
  [6, "Règles d'usage acceptable"],
  [7, "Suspension et résiliation par UseWok"],
  [8, "Résiliation par l'Utilisateur"],
  [9, "Garanties et exclusion de responsabilité"],
  [10, "Limitation de responsabilité"],
  [11, "Données personnelles"],
  [12, "Modification des Conditions"],
  [13, "Droit applicable et juridiction"],
  [14, "Médiation à la consommation"],
  [15, "Dispositions diverses"],
  [16, "Contact"],
];

export default function TermsOfServicePage() {
  return (
    <div style={{ background: '#F8F9FA', fontFamily: "'Inter', -apple-system, system-ui, sans-serif", minHeight: '100vh' }}>
      {/* Navbar */}
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
            <span style={{ fontSize: 11, color: CORAL, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Contrat d'utilisation</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: 'white', margin: '0 0 16px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Conditions Générales d'Utilisation
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>
            Dernière mise à jour : <strong style={{ color: 'rgba(255,255,255,0.8)' }}>28 juin 2026</strong>
          </p>
        </div>
      </div>

      {/* Intro block */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px clamp(20px, 3vw, 40px) 0' }}>
        <div style={{
          background: 'white', border: '1px solid #E5E7EB', borderRadius: 12,
          padding: '28px 32px',
        }}>
          <P>Les présentes Conditions Générales d'Utilisation (les « CGU » ou les « Conditions ») constituent un contrat entre <strong>UseWok</strong> [forme juridique à compléter dès l'immatriculation], dont le siège social est situé [adresse complète à compléter — Gironde, France] (« nous », « UseWok », « la Société »), et toute personne utilisant le service accessible à l'adresse <a href="https://usewok.com" style={{ color: CORAL }}>https://usewok.com</a> (le « Service », l'« Utilisateur », « vous »).</P>
          <P style={{ marginBottom: 0 }}>En créant un compte ou en utilisant le Service, vous acceptez pleinement et sans réserve les présentes Conditions ainsi que notre <Link to="/privacy" style={{ color: CORAL }}>Politique de Confidentialité</Link>. Si vous n'acceptez pas ces Conditions, vous ne devez pas utiliser le Service.</P>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(20px, 3vw, 40px)', display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }}>
        <main>
          <Section number="1" title="Définitions">
            <BulletList items={[
              <><strong>« Service »</strong> : la plateforme UseWok accessible via le site usewok.com et toute application associée.</>,
              <><strong>« Compte »</strong> : l'espace personnel créé par l'Utilisateur pour accéder au Service.</>,
              <><strong>« Abonnement »</strong> : la formule payante souscrite par l'Utilisateur pour accéder à des fonctionnalités étendues du Service.</>,
              <><strong>« Contenu »</strong> : tout texte, donnée, fichier ou élément transmis ou généré par l'Utilisateur via le Service.</>,
            ]} />
          </Section>

          <Section number="2" title="Objet du Service">
            <P>UseWok est une plateforme accessible en ligne, proposée selon un modèle freemium avec abonnements payants. La Société se réserve le droit de modifier, faire évoluer ou retirer tout ou partie des fonctionnalités du Service à tout moment, avec ou sans préavis, notamment pour des raisons techniques, légales ou commerciales.</P>
          </Section>

          <Section number="3" title="Création de compte et accès">
            <SubSection title="3.1 Modalités d'inscription">
              <P>L'accès au Service nécessite la création d'un Compte, soit par inscription via email, soit via connexion avec un compte tiers (Google ou Facebook — « SSO »). En vous inscrivant via Google ou Facebook, vous autorisez UseWok à accéder à votre nom, votre adresse email et votre photo de profil, conformément à notre <Link to="/privacy" style={{ color: CORAL }}>Politique de Confidentialité</Link>.</P>
            </SubSection>
            <SubSection title="3.2 Âge minimum">
              <P>L'utilisation du Service est réservée aux personnes âgées d'au moins <strong>16 ans</strong>, ou disposant du consentement de leur représentant légal si la loi applicable l'exige.</P>
            </SubSection>
            <SubSection title="3.3 Exactitude des informations">
              <P>Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription, et à les maintenir à jour.</P>
            </SubSection>
            <SubSection title="3.4 Sécurité du compte">
              <P>Vous êtes seul responsable de la confidentialité de vos identifiants de connexion et de toute activité réalisée depuis votre Compte. Vous devez nous informer immédiatement à <a href="mailto:antoinevalton954@gmail.com" style={{ color: CORAL }}>antoinevalton954@gmail.com</a> en cas d'accès non autorisé suspecté.</P>
            </SubSection>
          </Section>

          <Section number="4" title="Abonnements et conditions financières">
            <SubSection title="4.1 Formules">
              <P>Le Service est proposé selon un modèle freemium : une offre gratuite avec fonctionnalités limitées, et des offres d'abonnement payant donnant accès à des fonctionnalités étendues.</P>
            </SubSection>
            <SubSection title="4.2 Essai gratuit">
              <InfoBox icon="🎁">
                L'offre d'abonnement <strong>« Starter »</strong> bénéficie d'un essai gratuit de <strong>7 jours</strong>. À l'expiration de cette période d'essai, l'abonnement est automatiquement facturé selon le moyen de paiement enregistré, sauf annulation préalable par l'Utilisateur depuis les paramètres de son Compte.
              </InfoBox>
            </SubSection>
            <SubSection title="4.3 Paiement">
              <P>Les paiements sont traités par notre prestataire tiers <strong>Stripe</strong>. UseWok n'a accès à aucune donnée de carte bancaire, celle-ci étant directement gérée par Stripe selon ses propres conditions et standards de sécurité (PCI-DSS).</P>
            </SubSection>
            <SubSection title="4.4 Absence de remboursement">
              <P>Sauf disposition légale impérative contraire, les sommes versées au titre d'un abonnement ne sont ni remboursables ni annulables, y compris en cas de non-utilisation du Service pendant la période d'abonnement.</P>
              <WarningBox icon="⚖️">
                <strong>Précision légale importante :</strong> conformément au droit français de la consommation (article L221-18 du Code de la consommation), tout consommateur bénéficie en principe d'un délai de rétractation de 14 jours pour un achat en ligne. Si l'Utilisateur est un consommateur (et non un professionnel), il peut exercer ce droit de rétractation dans les 14 jours suivant la souscription, sauf s'il a expressément renoncé à ce droit avant la fin du délai en demandant un accès immédiat au Service.
              </WarningBox>
            </SubSection>
            <SubSection title="4.5 Renouvellement automatique">
              <P>Les abonnements payants se renouvellent automatiquement à l'échéance de leur période, sauf annulation par l'Utilisateur avant la date de renouvellement, depuis les paramètres de son Compte.</P>
            </SubSection>
            <SubSection title="4.6 Modification des tarifs">
              <P>UseWok peut modifier ses tarifs à tout moment. Toute modification de tarif sera notifiée à l'Utilisateur avant son entrée en vigueur et ne s'appliquera qu'au renouvellement suivant de l'Abonnement en cours.</P>
            </SubSection>
          </Section>

          <Section number="5" title="Propriété intellectuelle">
            <SubSection title="5.1 Propriété de UseWok">
              <P>L'ensemble des éléments du Service — code source, design, interface, logos, marques, textes, base de données — est la propriété exclusive de UseWok ou de ses concédants de licence, et est protégé par le droit de la propriété intellectuelle. Aucune disposition des présentes Conditions ne confère à l'Utilisateur un quelconque droit de propriété sur ces éléments.</P>
            </SubSection>
            <SubSection title="5.2 Licence d'utilisation">
              <P>UseWok vous accorde un droit d'usage personnel, non exclusif, non transférable et révocable sur le Service, pour la durée de votre Compte, exclusivement pour vos besoins personnels conformes à l'objet du Service.</P>
            </SubSection>
            <SubSection title="5.3 Interdictions">
              <P>Il est strictement interdit de copier, reproduire, décompiler, désassembler, procéder à de l'ingénierie inverse, extraire le code source, ou tenter d'extraire la base de données du Service par des moyens automatisés (scraping, crawling ou autre).</P>
            </SubSection>
          </Section>

          <Section number="6" title="Règles d'usage acceptable">
            <P>En utilisant le Service, vous vous engagez à ne pas :</P>
            <BulletList items={[
              "Publier ou transmettre du contenu illicite, haineux, diffamatoire, ou portant atteinte aux droits d'un tiers",
              "Utiliser le Service à des fins de spam, fraude, hameçonnage (phishing) ou usurpation d'identité",
              "Tenter d'accéder de manière non autorisée aux systèmes, comptes ou données d'autres utilisateurs",
              "Utiliser des bots, scripts automatisés ou tout autre moyen non autorisé pour interagir avec le Service",
              "Perturber ou surcharger intentionnellement l'infrastructure du Service",
              "Contourner toute mesure de sécurité ou de limitation mise en place par UseWok",
            ]} />
          </Section>

          <Section number="7" title="Suspension et résiliation par UseWok">
            <P>UseWok se réserve le droit de suspendre, restreindre ou supprimer, à tout moment et sans préavis, l'accès de tout Utilisateur au Service, notamment en cas de violation des présentes Conditions, de comportement frauduleux, ou de risque pour la sécurité du Service ou d'autres utilisateurs. Cette résiliation ne donne droit à aucun remboursement des sommes déjà versées, sauf disposition légale contraire.</P>
          </Section>

          <Section number="8" title="Résiliation par l'Utilisateur">
            <P>Vous pouvez supprimer votre Compte à tout moment depuis les paramètres du Service. La suppression de votre Compte entraîne la suppression de vos données personnelles conformément à notre <Link to="/privacy" style={{ color: CORAL }}>Politique de Confidentialité</Link>, sous réserve des données que nous sommes légalement tenus de conserver (notamment les données de facturation, conservées 10 ans).</P>
          </Section>

          <Section number="9" title="Garanties et exclusion de responsabilité">
            <div style={{
              background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10,
              padding: '20px 24px', marginBottom: 16,
            }}>
              <P style={{ fontSize: 13, fontFamily: 'monospace', color: '#374151', marginBottom: 0, lineHeight: 1.7, letterSpacing: '0.01em' }}>
                LE SERVICE EST FOURNI « EN L'ÉTAT » ET « SELON DISPONIBILITÉ ». USEWOK NE GARANTIT PAS QUE LE SERVICE SERA EXEMPT D'ERREURS, ININTERROMPU, OU PARFAITEMENT SÉCURISÉ. DANS LA MESURE PERMISE PAR LA LOI, USEWOK DÉCLINE TOUTE GARANTIE IMPLICITE DE QUALITÉ MARCHANDE OU D'ADÉQUATION À UN USAGE PARTICULIER.
              </P>
            </div>
          </Section>

          <Section number="10" title="Limitation de responsabilité">
            <div style={{
              background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 10,
              padding: '20px 24px', marginBottom: 16,
            }}>
              <P style={{ fontSize: 13, fontFamily: 'monospace', color: '#374151', marginBottom: 0, lineHeight: 1.7, letterSpacing: '0.01em' }}>
                DANS LA MESURE MAXIMALE PERMISE PAR LA LOI APPLICABLE, USEWOK NE POURRA ÊTRE TENU RESPONSABLE DE TOUT DOMMAGE INDIRECT, PERTE DE DONNÉES, PERTE DE CHIFFRE D'AFFAIRES OU PRÉJUDICE FINANCIER SUBI PAR L'UTILISATEUR DU FAIT DE L'UTILISATION OU DE L'IMPOSSIBILITÉ D'UTILISER LE SERVICE. LA RESPONSABILITÉ TOTALE DE USEWOK, TOUTES CAUSES CONFONDUES, EST LIMITÉE AU MONTANT TOTAL VERSÉ PAR L'UTILISATEUR AU TITRE DE SON ABONNEMENT AU COURS DES DOUZE (12) MOIS PRÉCÉDANT LE FAIT GÉNÉRATEUR DU DOMMAGE.
              </P>
            </div>
            <P>Cette limitation ne s'applique pas en cas de faute lourde, de faute intentionnelle, ou de dommage corporel, conformément aux dispositions impératives du droit français.</P>
          </Section>

          <Section number="11" title="Données personnelles">
            <P>Le traitement de vos données personnelles est régi par notre <Link to="/privacy" style={{ color: CORAL }}>Politique de Confidentialité</Link>, qui fait partie intégrante des présentes Conditions.</P>
          </Section>

          <Section number="12" title="Modification des présentes Conditions">
            <P>UseWok peut modifier les présentes Conditions à tout moment. Toute modification substantielle vous sera notifiée par email ou via une notification sur le Service, avant son entrée en vigueur. La poursuite de l'utilisation du Service après notification vaut acceptation des Conditions modifiées.</P>
          </Section>

          <Section number="13" title="Droit applicable et juridiction compétente">
            <P>Les présentes Conditions sont régies par le <strong>droit français</strong>.</P>
            <InfoBox icon="⚖️">
              <strong>Précision juridique :</strong> si vous êtes un consommateur résidant en France, vous bénéficiez du droit impératif de saisir, en cas de litige, soit le tribunal de votre lieu de résidence, soit celui du siège social de UseWok, conformément à l'article 46 du Code de procédure civile et aux dispositions protectrices du droit de la consommation. Aucune clause des présentes Conditions ne saurait limiter ce droit.<br /><br />
              Si vous agissez en tant que professionnel, les tribunaux du ressort du siège social de UseWok sont seuls compétents.
            </InfoBox>
          </Section>

          <Section number="14" title="Médiation à la consommation">
            <P>Conformément aux articles L611-1 et suivants du Code de la consommation, en cas de litige non résolu directement avec notre service support, tout consommateur a le droit de recourir gratuitement à un médiateur de la consommation. [Nom et coordonnées du médiateur à désigner avant le lancement officiel — obligation légale française pour tout site B2C].</P>
            <P>Vous pouvez également utiliser la plateforme européenne de résolution des litiges en ligne : <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: CORAL }}>ec.europa.eu/consumers/odr</a>.</P>
          </Section>

          <Section number="15" title="Dispositions diverses">
            <BulletList items={[
              <><strong>Intégralité de l'accord :</strong> les présentes Conditions et la Politique de Confidentialité constituent l'intégralité de l'accord entre vous et UseWok concernant l'utilisation du Service.</>,
              <><strong>Divisibilité :</strong> si une clause des présentes Conditions est jugée invalide ou inapplicable, les autres clauses demeurent pleinement en vigueur.</>,
              <><strong>Absence de renonciation :</strong> le fait pour UseWok de ne pas faire valoir un droit prévu par les présentes Conditions ne constitue pas une renonciation à ce droit.</>,
              <><strong>Cession :</strong> UseWok peut céder les présentes Conditions à tout tiers dans le cadre d'une cession de son activité. L'Utilisateur ne peut céder ses droits sans accord écrit préalable de UseWok.</>,
            ]} />
          </Section>

          <Section number="16" title="Contact">
            <P>Pour toute question relative aux présentes Conditions, contactez-nous à :</P>
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 12, padding: '24px 28px' }}>
              <div style={{ fontSize: 14, color: '#374151', lineHeight: 2 }}>
                <div>📧 <a href="mailto:antoinevalton954@gmail.com" style={{ color: CORAL }}>antoinevalton954@gmail.com</a></div>
                <div>🌐 <a href="https://usewok.com" style={{ color: CORAL }}>https://usewok.com</a></div>
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
            <a href="mailto:antoinevalton954@gmail.com" style={{ color: CORAL, fontWeight: 500 }}>antoinevalton954@gmail.com</a>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '24px clamp(20px, 5vw, 60px)', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
          © 2026 UseWok — L'outil français de visibilité IA ·{' '}
          <Link to="/privacy" style={{ color: '#6B7280', textDecoration: 'none' }}>Politique de confidentialité</Link>
          {' '}·{' '}
          <Link to="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Accueil</Link>
        </p>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          aside { display: none !important; }
          main { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </div>
  );
}