import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Send, CheckCircle, XCircle, Loader } from 'lucide-react';

const F = '"Anthropic Sans","Anthropic Sans Variable",Inter,system-ui,sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const WHITE = '#FFFFFF';
const BG = '#F8F7F4';
const CORAL = '#FF5A1F';
const SURFACE = '#EEE5D2';

const EMAILS = [
  {
    key: 'post_scan',
    label: 'Mail 1 — Résultats du scan',
    desc: 'Rapport de score IA avec erreurs détectées (J+0 après scan)',
  },
  {
    key: 'no_scan_j3',
    label: 'Mail 2 — Pourquoi les IA t\'ignorent',
    desc: 'Les 3 vraies raisons + actions concrètes (J+3)',
  },
  {
    key: 'final_offer',
    label: 'Mail 3 — Tes concurrents captent ces clients',
    desc: 'Comparatif + social proof + CTA pricing (J+7)',
  },
];

export default function AdminEmailTestPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [siteUrl, setSiteUrl] = useState('usewok.com');
  const [score, setScore] = useState(42);
  const [sending, setSending] = useState({}); // key -> 'loading'|'ok'|'error'
  const [sendingAll, setSendingAll] = useState(false);
  const [globalResult, setGlobalResult] = useState(null);

  const mockData = () => ({
    score: Number(score),
    criticalErrors: 3,
    totalIssues: 7,
    issues: [{ problem: 'Aucun schéma Organization détecté sur votre page d\'accueil — ChatGPT ne peut pas vous identifier.', urgency: 'high' }],
    scanDate: new Date().toISOString(),
  });

  const sendOne = async (emailType) => {
    if (!email) return;
    setSending(s => ({ ...s, [emailType]: 'loading' }));
    try {
      await base44.functions.invoke('brevoEmailSystem', {
        action: 'sendEmail',
        email,
        firstName: firstName || 'Prénom',
        siteUrl,
        data: { emailType, ...mockData() },
      });
      setSending(s => ({ ...s, [emailType]: 'ok' }));
    } catch (e) {
      setSending(s => ({ ...s, [emailType]: 'error' }));
    }
  };

  const sendAll = async () => {
    if (!email) return;
    setSendingAll(true);
    setGlobalResult(null);
    setSending({});
    try {
      await Promise.all(EMAILS.map(e => sendOne(e.key)));
      setGlobalResult('ok');
    } catch {
      setGlobalResult('error');
    } finally {
      setSendingAll(false);
    }
  };

  const icon = (key) => {
    const s = sending[key];
    if (s === 'loading') return <Loader size={14} color={INK3} style={{ animation: 'spin 0.8s linear infinite' }} />;
    if (s === 'ok') return <CheckCircle size={14} color="#10B981" />;
    if (s === 'error') return <XCircle size={14} color="#EF4444" />;
    return <Send size={14} color={INK3} />;
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: 720, margin: '0 auto', fontFamily: F }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: INK3 }}>Admin · Email</p>
      <h1 style={{ margin: '0 0 6px', fontSize: 28, fontWeight: 900, color: INK, letterSpacing: '-0.03em' }}>Test des séquences email</h1>
      <p style={{ margin: '0 0 40px', fontSize: 14, color: INK2, lineHeight: 1.5 }}>Envoie les 3 mails de la séquence à n'importe quelle adresse, comme si c'était un compte lambda.</p>

      {/* Form */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '28px 32px', marginBottom: 28 }}>
        <p style={{ margin: '0 0 20px', fontSize: 13, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>Profil du compte fictif</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: INK2, marginBottom: 6, letterSpacing: '0.5px' }}>Email destinataire *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ton@email.com"
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontFamily: F, color: INK, outline: 'none', boxSizing: 'border-box', background: BG }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: INK2, marginBottom: 6, letterSpacing: '0.5px' }}>Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="Ex: Marie"
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontFamily: F, color: INK, outline: 'none', boxSizing: 'border-box', background: BG }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: INK2, marginBottom: 6, letterSpacing: '0.5px' }}>Site URL fictif</label>
            <input
              type="text"
              value={siteUrl}
              onChange={e => setSiteUrl(e.target.value)}
              placeholder="monsite.fr"
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontFamily: F, color: INK, outline: 'none', boxSizing: 'border-box', background: BG }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: INK2, marginBottom: 6, letterSpacing: '0.5px' }}>Score IA fictif (/100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={e => setScore(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, fontFamily: F, color: INK, outline: 'none', boxSizing: 'border-box', background: BG }}
            />
          </div>
        </div>

        {/* Send all */}
        <button
          onClick={sendAll}
          disabled={!email || sendingAll}
          style={{
            width: '100%', padding: '12px 24px', background: email && !sendingAll ? INK : '#DDD',
            border: 'none', borderRadius: 9, fontSize: 13.5, fontWeight: 700, color: WHITE,
            cursor: email && !sendingAll ? 'pointer' : 'not-allowed', fontFamily: F,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {sendingAll
            ? <><Loader size={14} color={WHITE} style={{ animation: 'spin 0.8s linear infinite' }} /> Envoi en cours…</>
            : <><Send size={14} color={WHITE} /> Envoyer les 3 mails d'un coup</>}
        </button>

        {globalResult === 'ok' && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, fontSize: 13, color: '#059669', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} /> 3 mails envoyés à <strong>{email}</strong>
          </div>
        )}
        {globalResult === 'error' && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#FFF5F5', border: '1px solid #FFDDDD', borderRadius: 8, fontSize: 13, color: '#D93025', display: 'flex', alignItems: 'center', gap: 8 }}>
            <XCircle size={14} /> Une erreur est survenue. Vérifie les logs.
          </div>
        )}
      </div>

      {/* Individual emails */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {EMAILS.map((m) => (
          <div key={m.key} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13.5, fontWeight: 700, color: INK }}>{m.label}</p>
              <p style={{ margin: 0, fontSize: 12, color: INK3, lineHeight: 1.4 }}>{m.desc}</p>
            </div>
            {sending[m.key] === 'ok' && <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>Envoyé ✓</span>}
            {sending[m.key] === 'error' && <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>Erreur</span>}
            <button
              onClick={() => sendOne(m.key)}
              disabled={!email || sending[m.key] === 'loading'}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', border: `1px solid ${BORDER}`, borderRadius: 8,
                background: BG, cursor: email ? 'pointer' : 'not-allowed',
                fontSize: 12.5, fontWeight: 600, color: INK2, fontFamily: F, flexShrink: 0,
              }}
            >
              {icon(m.key)} Envoyer seul
            </button>
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}