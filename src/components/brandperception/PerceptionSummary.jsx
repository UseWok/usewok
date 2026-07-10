// Temps 1 : "Ce que les IA disent de toi aujourd'hui" — résumé 1-2 phrases + verdict couleur.
// Génère une phrase claire à partir du sentiment quand aucun résumé n'est fourni par le backend.

const F = "'Wix Madefor Text', 'Wix Madefor Display', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';

const CARD_BG = '#15130F';
const GREEN = '#3DD68C';
const ORANGE = '#FF9F45';
const RED = '#FF6B6B';

function buildSummary({ positive = 0, negative = 0, prompts = [] }) {
  const cited = prompts.filter(p => p.cited).length;
  const total = prompts.length;
  const citedPart = total > 0 ? `Tu es mentionné dans ${cited} réponse${cited > 1 ? 's' : ''} sur ${total}.` : '';

  if (positive >= 55) {
    return { tone: 'good', text: `Bonne nouvelle : les IA parlent de toi de façon plutôt positive (${positive}% des réponses). ${citedPart}`.trim() };
  }
  if (negative >= 30) {
    return { tone: 'bad', text: `Attention : ${negative}% des réponses des IA à ton sujet sont négatives. Il y a du travail pour améliorer ton image. ${citedPart}`.trim() };
  }
  return { tone: 'mixed', text: `Les IA restent surtout neutres à ton sujet — ni vraiment positives, ni négatives. ${citedPart} C'est l'occasion de renforcer ce qu'elles disent de toi.`.trim() };
}

const TONE = {
  good:  { color: GREEN,  label: 'Plutôt positif' },
  mixed: { color: ORANGE, label: 'Neutre' },
  bad:   { color: RED,    label: 'À améliorer' },
};

export default function PerceptionSummary({ sentiment, prompts }) {
  const { tone, text } = buildSummary({
    positive: sentiment?.positive || 0,
    negative: sentiment?.negative || 0,
    prompts: prompts || [],
  });
  const t = TONE[tone];

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, padding: '22px 24px', marginBottom: 18, fontFamily: F }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
          Ce que les IA disent de toi aujourd'hui
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 100, background: `${t.color}22`, color: t.color, fontSize: 11, fontWeight: 800 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.color }} />
          {t.label}
        </span>
      </div>
      <p style={{ fontSize: 16.5, fontWeight: 600, color: '#fff', margin: 0, lineHeight: 1.55, letterSpacing: '-0.01em' }}>{text}</p>
    </div>
  );
}