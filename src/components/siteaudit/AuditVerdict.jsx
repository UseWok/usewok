// Phrase de contexte immédiate sous le score global.
// Un non-expert doit savoir en 1 seconde : est-ce bien ou pas, et pourquoi.

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";

export default function AuditVerdict({ score = 0, critical = 0 }) {
  let tone, title, sub, bg, border, color;

  if (critical > 0) {
    tone = 'warn';
    title = score >= 70
      ? `Bonne base — mais ${critical} problème${critical > 1 ? 's' : ''} critique${critical > 1 ? 's' : ''} bloque${critical > 1 ? 'nt' : ''} ta visibilité IA.`
      : `${critical} problème${critical > 1 ? 's' : ''} critique${critical > 1 ? 's' : ''} empêche${critical > 1 ? 'nt' : ''} les IA de bien te comprendre.`;
    sub = "Corrige-les en priorité : ce sont eux qui te coûtent le plus de recommandations.";
    bg = '#FFF4EC'; border = '#FFD9BF'; color = '#B23E10';
  } else if (score >= 80) {
    title = "Excellent — ton site est bien préparé pour les IA.";
    sub = "Continue comme ça. Quelques petits réglages peuvent encore t'aider à monter.";
    bg = 'rgba(11,129,90,0.07)'; border = 'rgba(11,129,90,0.25)'; color = '#0B815A';
  } else if (score >= 60) {
    title = "Correct — quelques ajustements et tu seras au top.";
    sub = "Pas de blocage majeur, mais il reste des améliorations qui font gagner des recommandations.";
    bg = 'rgba(11,129,90,0.07)'; border = 'rgba(11,129,90,0.25)'; color = '#0B815A';
  } else {
    title = "Il y a du travail — mais rien d'insurmontable.";
    sub = "Suis les corrections ci-dessous une par une : chaque point réglé aide les IA à te recommander.";
    bg = '#FFF4EC'; border = '#FFD9BF'; color = '#B23E10';
  }

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '14px 18px', marginBottom: 18, fontFamily: F }}>
      <p style={{ fontSize: 14.5, fontWeight: 700, color, margin: '0 0 3px', lineHeight: 1.4 }}>{title}</p>
      <p style={{ fontSize: 12.5, color: '#726A5C', margin: 0, lineHeight: 1.5 }}>{sub}</p>
    </div>
  );
}