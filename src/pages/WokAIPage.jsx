import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Paperclip, Send, Trash2, MessageSquare, Sparkles, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { useAuth } from '@/lib/AuthContext';
import ReactMarkdown from 'react-markdown';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EBEBEB';
const SURFACE = '#F6F6F6';
const WHITE = '#FFFFFF';

// ── Typing dots ───────────────────────────────────────────────────
function TypingDots({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, width: 'fit-content' }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: INK3, animation: `wokdot 1.1s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
      </div>
      {label && <span style={{ fontSize: 11.5, color: INK3 }}>{label}</span>}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────
function MessageBubble({ msg, userInitials }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end', marginBottom: 16 }}>
      {!isUser && (
        <div style={{ width: 24, height: 24, borderRadius: 7, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
          <Sparkles size={11} color={WHITE} />
        </div>
      )}
      {isUser && (
        <div style={{ width: 24, height: 24, borderRadius: 7, background: '#7C6AF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: WHITE, flexShrink: 0, marginBottom: 2, letterSpacing: '-0.02em' }}>
          {userInitials}
        </div>
      )}
      <div style={{ maxWidth: '78%' }}>
        {msg.files?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            {msg.files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11, color: INK2 }}>
                <FileText size={9} color={INK3} />
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{
          padding: isUser ? '9px 14px' : '11px 15px',
          background: isUser ? INK : WHITE,
          border: isUser ? 'none' : `1px solid ${BORDER}`,
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 13.5, lineHeight: 1.65, color: isUser ? WHITE : INK,
        }}>
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          ) : (
            <div className="wok-prose">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div style={{ fontSize: 9.5, color: INK3, marginTop: 3, textAlign: isUser ? 'right' : 'left', paddingLeft: isUser ? 0 : 2 }}>
          {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────
const SUGGESTIONS = [
  'Quels sont mes 3 points urgents à corriger ?',
  'Pourquoi mon score a-t-il baissé ?',
  'Explique-moi l\'audit en termes simples',
  'Quelle est ma part de voix vs concurrents ?',
];

function EmptyState({ onSuggest, domain }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', maxWidth: 520, margin: '0 auto', width: '100%' }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Sparkles size={20} color={WHITE} />
      </div>
      <p style={{ fontSize: 17, fontWeight: 700, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>WOK AI</p>
      <p style={{ fontSize: 13, color: INK3, margin: '0 0 32px', lineHeight: 1.6, textAlign: 'center' }}>
        {domain ? `Données de ${domain} chargées.` : 'Lance un scan depuis l\'accueil pour accéder à tes données.'}
        {domain && ' Pose ta question, je réponds uniquement à partir de tes résultats réels.'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => onSuggest(s)}
            style={{ padding: '11px 14px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 11, fontSize: 12.5, color: INK2, cursor: 'pointer', textAlign: 'left', fontFamily: F, lineHeight: 1.45, transition: 'background 80ms' }}
            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
            onMouseLeave={e => e.currentTarget.style.background = WHITE}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Conversation list panel ───────────────────────────────────────
function ConvPanel({ convs, activeId, onSelect, onNew, onDelete }) {
  return (
    <div style={{ width: 220, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', background: WHITE, flexShrink: 0 }}>
      <div style={{ padding: '16px 12px 10px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={10} color={WHITE} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>WOK AI</span>
      </div>
      <div style={{ padding: '8px' }}>
        <button onClick={onNew}
          style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '8px 10px', border: `1px dashed ${BORDER}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: INK2, fontFamily: F, transition: 'background 80ms' }}
          onMouseEnter={e => e.currentTarget.style.background = SURFACE}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Plus size={11} /> Nouvelle conversation
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
        {convs.length === 0 && (
          <p style={{ fontSize: 11.5, color: INK3, padding: '8px 10px' }}>Aucune conversation</p>
        )}
        {convs.map(c => (
          <div key={c.id} onClick={() => onSelect(c.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 7, cursor: 'pointer', background: c.id === activeId ? SURFACE : 'transparent', transition: 'background 70ms', marginBottom: 1 }}
            onMouseEnter={e => { if (c.id !== activeId) e.currentTarget.style.background = SURFACE; }}
            onMouseLeave={e => { if (c.id !== activeId) e.currentTarget.style.background = 'transparent'; }}>
            <MessageSquare size={11} color={c.id === activeId ? INK : INK3} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 12, fontWeight: c.id === activeId ? 600 : 400, color: c.id === activeId ? INK : INK2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {c.title || 'Discussion'}
            </span>
            <button onClick={e => { e.stopPropagation(); onDelete(c.id); }}
              style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0, transition: 'opacity 80ms', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
              <Trash2 size={9} color="#EF4444" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Google Drive picker ───────────────────────────────────────────
function DrivePickerModal({ open, onClose, onImport }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError(''); setFiles([]); setSelected([]);
    base44.functions.invoke('googleDriveFiles', {}).then(res => {
      const list = res?.data?.files || res?.data || [];
      setFiles(list);
      setLoading(false);
    }).catch(e => {
      setError('Connexion Google Drive requise. Connecte-la dans Connexions.');
      setLoading(false);
    });
  }, [open]);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const handleImport = async () => {
    if (!selected.length) return;
    setImporting(true);
    const picked = files.filter(f => selected.includes(f.id));
    onImport(picked);
    setImporting(false);
    onClose();
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.18)', fontFamily: F }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <svg width="16" height="16" viewBox="0 0 87.3 78" fill="none">
              <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335"/>
              <path d="M43.65 25L57.4 0H30.6L16.85 25z" fill="#00832d"/>
              <path d="M59.8 53H27.5L13.75 76.8h62.35z" fill="#2684fc"/>
              <path d="M73.4 26.35l-12.7-22.05c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Google Drive</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3 }}><X size={14} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loading && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Chargement…</p>}
          {error && <p style={{ fontSize: 13, color: '#EF4444', padding: '12px 6px', lineHeight: 1.5 }}>{error}</p>}
          {!loading && !error && files.length === 0 && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Aucun fichier trouvé</p>}
          {files.map(f => (
            <div key={f.id} onClick={() => toggle(f.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', background: selected.includes(f.id) ? '#F0EEFF' : 'transparent', marginBottom: 2, transition: 'background 80ms' }}
              onMouseEnter={e => { if (!selected.includes(f.id)) e.currentTarget.style.background = SURFACE; }}
              onMouseLeave={e => { if (!selected.includes(f.id)) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 18, height: 18, border: `2px solid ${selected.includes(f.id) ? '#7C6AF4' : BORDER}`, borderRadius: 4, background: selected.includes(f.id) ? '#7C6AF4' : WHITE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 80ms' }}>
                {selected.includes(f.id) && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <FileText size={13} color={INK3} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: INK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 10, color: INK3, flexShrink: 0 }}>{f.mimeType?.split('.').pop()?.split('/').pop()}</span>
            </div>
          ))}
        </div>
        {!error && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}` }}>
            <button onClick={handleImport} disabled={!selected.length || importing}
              style={{ width: '100%', padding: '10px', background: selected.length ? INK : '#DDD', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, color: WHITE, cursor: selected.length ? 'pointer' : 'not-allowed', fontFamily: F }}>
              {importing ? 'Import…' : `Importer ${selected.length ? `${selected.length} fichier${selected.length > 1 ? 's' : ''}` : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Plus menu ─────────────────────────────────────────────────────
function PlusMenu({ onFile, onDrive, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.10)', overflow: 'hidden', minWidth: 210, zIndex: 100 }}>
      {[
        { label: 'Joindre des fichiers', icon: <Paperclip size={13} color={INK2} />, action: onFile },
        { label: 'Importer depuis Google Drive', icon: <svg width="13" height="13" viewBox="0 0 87.3 78" fill="none"><path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/><path d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/><path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335"/><path d="M43.65 25L57.4 0H30.6L16.85 25z" fill="#00832d"/><path d="M59.8 53H27.5L13.75 76.8h62.35z" fill="#2684fc"/><path d="M73.4 26.35l-12.7-22.05c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/></svg>, action: onDrive },
      ].map((item, i) => (
        <button key={i} onClick={() => { item.action(); onClose(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: INK, fontFamily: F, textAlign: 'left', transition: 'background 70ms', borderBottom: i === 0 ? `1px solid ${BORDER}` : 'none' }}
          onMouseEnter={e => e.currentTarget.style.background = SURFACE}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {item.icon} {item.label}
        </button>
      ))}
    </motion.div>
  );
}

// ── Storage ───────────────────────────────────────────────────────
const SK = 'wok_ai_v3';
function loadConvs() { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } }
function saveConvs(c) { try { localStorage.setItem(SK, JSON.stringify(c)); } catch {} }
function pruneConvs(c) { const cut = Date.now() - 60 * 864e5; return c.filter(x => x.updatedAt > cut); }

// ── Context builder ───────────────────────────────────────────────
function buildContext(user, profile, activeDomain) {
  const name = user?.full_name || user?.email?.split('@')[0] || 'utilisateur';
  const url = activeDomain?.url || profile?.site_url || '';
  let ctx = `Tu es WOK AI, l'assistant SEO & visibilité IA de ${name}.\n`;
  ctx += `RÈGLES STRICTES :\n`;
  ctx += `- Base-toi UNIQUEMENT sur les données ci-dessous. Si une donnée est absente, dis-le clairement.\n`;
  ctx += `- Ne jamais inventer de chiffres ou de faits non présents dans ces données.\n`;
  ctx += `- Réponds en français, de façon directe et concrète. Maximum 150 mots sauf si plus demandé.\n\n`;
  ctx += `=== DONNÉES DU COMPTE ===\n`;
  ctx += `Utilisateur : ${name}${user?.email ? ` (${user.email})` : ''}\n`;
  if (url) ctx += `Site analysé : ${url}\n`;
  if (!profile) { ctx += `\nAucune donnée d'analyse disponible. Invite l'utilisateur à lancer un scan depuis l'accueil.\n=== FIN ===\n`; return ctx; }

  if (profile.score_overall) ctx += `Score global : ${profile.score_overall}/100\n`;
  if (profile.lrs_score) ctx += `LRS : ${profile.lrs_score}/100\n`;
  if (profile.score_previous) ctx += `Score précédent : ${profile.score_previous}/100\n`;
  if (profile.score_ai_visibility) ctx += `Visibilité IA : ${profile.score_ai_visibility}/100\n`;
  if (profile.score_message_clarity) ctx += `Clarté message : ${profile.score_message_clarity}/100\n`;
  if (profile.score_commercial_signal) ctx += `Signal commercial : ${profile.score_commercial_signal}/100\n`;
  ['chatgpt', 'gemini', 'claude', 'perplexity'].forEach(k => { if (profile[`${k}_score`]) ctx += `${k} : ${profile[`${k}_score`]}\n`; });
  if (profile.last_scan) ctx += `Dernier scan : ${new Date(profile.last_scan).toLocaleDateString('fr-FR')}\n`;
  if (profile.identity_name) ctx += `\nBusiness : ${profile.identity_name}\n`;
  if (profile.identity_industry) ctx += `Secteur : ${profile.identity_industry}\n`;
  if (profile.identity_city) ctx += `Ville : ${profile.identity_city}\n`;
  if (profile.identity_target) ctx += `Cible : ${profile.identity_target}\n`;
  if (profile.shock_insight) ctx += `\nInsight principal : ${profile.shock_insight}\n`;
  if (profile.recommendation) ctx += `Recommandation : ${profile.recommendation}\n`;
  if (profile.action_plan?.length) {
    ctx += `\nPlan d'action :\n`;
    profile.action_plan.slice(0, 5).forEach((a, i) => {
      ctx += `${i+1}. ${a.title || a}${a.priority ? ` [${a.priority}]` : ''}${a.description ? ` — ${a.description}` : ''}\n`;
    });
  }
  if (profile.competitors?.length) {
    ctx += `\nConcurrents : ${profile.competitors.slice(0, 4).map(c => `${c.name || c.domain || c}${c.score ? ` (${c.score})` : ''}`).join(', ')}\n`;
  }
  if (profile.technical_issues?.length || profile.issues?.length) {
    const issues = profile.technical_issues || profile.issues || [];
    ctx += `\nProblèmes techniques :\n`;
    issues.slice(0, 6).forEach(i => { ctx += `- ${i.title || i.name || i}${i.severity ? ` [${i.severity}]` : ''}\n`; });
  }
  if (profile.audit_data) {
    try {
      const a = typeof profile.audit_data === 'string' ? JSON.parse(profile.audit_data) : profile.audit_data;
      ctx += `\nAudit : score ${a.overall_score}/100`;
      if (a.crawlability_score) ctx += `, crawl ${a.crawlability_score}`;
      if (a.performance_score) ctx += `, perf ${a.performance_score}`;
      ctx += '\n';
      if (a.critical_issues?.length) { ctx += `Critiques : ${a.critical_issues.slice(0,4).map(i => i.title || i).join(', ')}\n`; }
      if (a.broken_links_count) ctx += `Liens cassés : ${a.broken_links_count}\n`;
    } catch {}
  }
  if (profile.perf_data) {
    try {
      const pf = typeof profile.perf_data === 'string' ? JSON.parse(profile.perf_data) : profile.perf_data;
      const sov = pf.share_of_voice?.your_brand;
      if (sov?.voice_share_pct) ctx += `\nPart de voix IA : ${sov.voice_share_pct}%${sov.favorable_pct ? `, favorable ${sov.favorable_pct}%` : ''}\n`;
      if (pf.lrs_trend) ctx += `Tendance LRS : ${pf.lrs_trend}\n`;
      if (pf.ai_mentions_count) ctx += `Mentions IA/mois : ~${pf.ai_mentions_count}\n`;
    } catch {}
  }
  ctx += `=== FIN DES DONNÉES ===\n`;
  return ctx;
}

// ── Main ──────────────────────────────────────────────────────────
export default function WokAIPage({ user: userProp }) {
  const { user: authUser } = useAuth();
  const user = userProp || authUser;
  const [convs, setConvs] = useState(() => pruneConvs(loadConvs()));
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [files, setFiles] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const [showPlus, setShowPlus] = useState(false);
  const [showDrive, setShowDrive] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const userInitials = (user?.full_name || user?.email || '?').slice(0, 2).toUpperCase();
  const domainLabel = activeDomain?.url?.replace(/https?:\/\//, '').split('/')[0] || '';

  useEffect(() => {
    const domain = getActiveDomain();
    setActiveDomainState(domain);
    if (!domain?.url) return;
    base44.entities.BusinessProfile.filter({ site_url: domain.url }).then(results => {
      const mine = results.find(r => r.created_by_id === user?.id) || results[0];
      if (mine) {
        let extra = {};
        try { extra = JSON.parse(mine.brand_keywords || '{}'); } catch {}
        setProfile({ ...mine, ...extra });
      }
    }).catch(() => {});
  }, [user?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const persist = (c) => { saveConvs(c); setConvs(c); };
  const activeConv = convs.find(c => c.id === activeConvId);

  const openConv = (id) => {
    const c = convs.find(cv => cv.id === id);
    if (c) { setMessages(c.messages || []); setActiveConvId(id); }
  };

  const newConv = () => { setMessages([]); setActiveConvId(null); setFiles([]); setDriveFiles([]); };

  const deleteConv = (id) => {
    const next = convs.filter(c => c.id !== id);
    persist(next);
    if (activeConvId === id) { setMessages([]); setActiveConvId(null); }
  };

  const handleDriveImport = (picked) => {
    setDriveFiles(prev => [...prev, ...picked]);
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content && files.length === 0 && driveFiles.length === 0) return;
    setInput('');

    let uploadedFiles = [];
    if (files.length > 0) {
      setLoading(true); setLoadingLabel('Lecture des fichiers…');
      for (const f of files) {
        try { const r = await base44.integrations.Core.UploadFile({ file: f }); uploadedFiles.push({ name: f.name, url: r.file_url }); } catch {}
      }
      setFiles([]);
    }
    const allAttachments = [...uploadedFiles, ...driveFiles.map(f => ({ name: f.name, url: f.webViewLink || f.url || '' }))];
    setDriveFiles([]);

    const userMsg = { role: 'user', content, files: allAttachments, ts: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);
    setLoadingLabel(profile ? 'Je consulte tes données…' : 'Je réfléchis…');

    try {
      const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'USER' : 'WOK_AI'}: ${m.content}`).join('\n');
      const ctx = buildContext(user, profile, activeDomain);
      let prompt = ctx;
      if (history) prompt += `\n--- Historique ---\n${history}\n`;
      prompt += `\nUSER: ${content}`;
      const fileUrls = allAttachments.map(f => f.url).filter(Boolean);

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
      });
      const aiContent = typeof res === 'string' ? res : (res?.response || res?.text || 'Erreur de réponse.');
      const aiMsg = { role: 'assistant', content: aiContent, ts: Date.now() };
      const final = [...nextMessages, aiMsg];
      setMessages(final);

      if (activeConvId) {
        persist(convs.map(c => c.id === activeConvId ? { ...c, messages: final, updatedAt: Date.now() } : c));
      } else {
        const titleRes = await base44.integrations.Core.InvokeLLM({ prompt: `Titre court 3-5 mots (français) pour: "${content.slice(0,100)}". Retourne UNIQUEMENT le titre.` }).catch(() => content.slice(0, 40));
        const title = (typeof titleRes === 'string' ? titleRes : content).slice(0, 48);
        const nc = { id: `c_${Date.now()}`, title, messages: final, createdAt: Date.now(), updatedAt: Date.now() };
        setActiveConvId(nc.id);
        persist([nc, ...convs]);
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Je n\'ai pas pu répondre. Réessaie.', ts: Date.now() }]);
    } finally { setLoading(false); setLoadingLabel(''); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleFileSelect = (e) => {
    setFiles(f => [...f, ...Array.from(e.target.files || []).slice(0, 3 - f.length)]);
    e.target.value = '';
  };

  const allFiles = [...files.map(f => ({ name: f.name, isLocal: true })), ...driveFiles.map(f => ({ name: f.name, isDrive: true }))];

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: F, background: WHITE }}>
      {/* ── Left panel: conversation list ── */}
      <ConvPanel convs={convs} activeId={activeConvId} onSelect={openConv} onNew={newConv} onDelete={deleteConv} />

      {/* ── Right panel: chat ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Subtitle bar (no back arrow) */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: WHITE }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeConv?.title || 'Nouvelle conversation'}
            </span>
            {domainLabel && <span style={{ fontSize: 11, color: INK3, marginLeft: 8 }}>{domainLabel}</span>}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 8px' }}>
          {messages.length === 0 ? (
            <EmptyState onSuggest={s => sendMessage(s)} domain={domainLabel} />
          ) : (
            <>
              {messages.map((m, i) => <MessageBubble key={i} msg={m} userInitials={userInitials} />)}
              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={11} color={WHITE} />
                  </div>
                  <TypingDots label={loadingLabel} />
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Files chips */}
        <AnimatePresence>
          {allFiles.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ padding: '8px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: `1px solid ${BORDER}`, background: WHITE }}>
              {allFiles.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: f.isDrive ? '#F0EEFF' : SURFACE, border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11, color: INK2 }}>
                  <FileText size={9} color={f.isDrive ? '#7C6AF4' : INK3} />
                  <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                  <button onClick={() => f.isLocal ? setFiles(p => p.filter((_, j) => j !== i)) : setDriveFiles(p => p.filter((_, j) => j !== i - files.length))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                    <X size={8} color={INK3} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div style={{ padding: '8px 16px 14px', background: WHITE, borderTop: allFiles.length > 0 ? 'none' : `1px solid ${BORDER}`, flexShrink: 0 }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '10px 12px' }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ta question…" rows={1}
              style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: INK, fontFamily: F, resize: 'none', lineHeight: 1.5, maxHeight: 100, overflowY: 'auto', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowPlus(v => !v)}
                  style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                  onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                  <Plus size={13} color={INK2} />
                </button>
                <AnimatePresence>
                  {showPlus && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowPlus(false)} />
                      <div style={{ position: 'absolute', zIndex: 100 }}>
                        <PlusMenu
                          onFile={() => fileInputRef.current?.click()}
                          onDrive={() => setShowDrive(true)}
                          onClose={() => setShowPlus(false)}
                        />
                      </div>
                    </>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => sendMessage()} disabled={loading || (!input.trim() && allFiles.length === 0)}
                style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: (loading || (!input.trim() && allFiles.length === 0)) ? '#E0E0E0' : INK, cursor: (loading || (!input.trim() && allFiles.length === 0)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}>
                <Send size={13} color={WHITE} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <DrivePickerModal open={showDrive} onClose={() => setShowDrive(false)} onImport={handleDriveImport} />
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handleFileSelect} />

      <style>{`
        @keyframes wokdot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}
        .wok-prose p{margin:0 0 8px;font-size:13.5px;line-height:1.65;color:#111110}
        .wok-prose p:last-child{margin:0}
        .wok-prose ul,.wok-prose ol{margin:5px 0;padding-left:18px}
        .wok-prose li{font-size:13px;line-height:1.6;margin-bottom:3px;color:#111110}
        .wok-prose strong{font-weight:700;color:#111110}
        .wok-prose h1,.wok-prose h2,.wok-prose h3{font-size:14px;font-weight:700;margin:10px 0 6px;color:#111110}
        .wok-prose code{font-size:12px;background:#F0F0EE;padding:1px 4px;border-radius:3px}
      `}</style>
    </div>
  );
}