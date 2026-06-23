import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, X, Paperclip, Send, Trash2, MessageSquare, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import ReactMarkdown from 'react-markdown';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EBEBEB';
const SURFACE = '#F5F5F5';
const WHITE = '#FFFFFF';

// ── Typing indicator ──────────────────────────────────────────────
function TypingDots({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, maxWidth: 220 }}>
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: INK3, animation: `wokdot 1.1s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
      </div>
      <span style={{ fontSize: 11.5, color: INK3 }}>{label || 'Je cherche…'}</span>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────
function MessageBubble({ msg, userInitials }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end', marginBottom: 14 }}>
      {!isUser && (
        <div style={{ width: 22, height: 22, borderRadius: 6, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
          <Sparkles size={10} color={WHITE} />
        </div>
      )}
      {isUser && (
        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#7C6AF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: WHITE, flexShrink: 0, marginBottom: 2 }}>
          {userInitials}
        </div>
      )}
      <div style={{ maxWidth: '85%' }}>
        {msg.files?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 5, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            {msg.files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 10.5, color: INK2 }}>
                <Paperclip size={9} color={INK3} />
                <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{
          padding: isUser ? '9px 13px' : '11px 14px',
          background: isUser ? INK : WHITE,
          border: isUser ? 'none' : `1px solid ${BORDER}`,
          borderRadius: isUser ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
          fontSize: 13, lineHeight: 1.6, color: isUser ? WHITE : INK,
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
  'Quels sont les 3 points urgents ?',
  'Pourquoi mon score a baissé ?',
  'Que corriger en priorité ?',
  'Résume l\'audit en 5 lignes',
];

function EmptyState({ onSuggest, domain }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 12px 12px' }}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 3px' }}>WOK AI</p>
        <p style={{ fontSize: 11.5, color: INK3, margin: 0, lineHeight: 1.5 }}>
          {domain ? `Analysé : ${domain}` : 'Pose ta question sur ton site.'}
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>Suggestions</p>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => onSuggest(s)}
            style={{ padding: '8px 11px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 12, color: INK2, cursor: 'pointer', textAlign: 'left', fontFamily: F, transition: 'background 80ms' }}
            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
            onMouseLeave={e => e.currentTarget.style.background = WHITE}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Conversation list ─────────────────────────────────────────────
function ConvList({ convs, activeId, onSelect, onNew, onDelete }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
      <button onClick={onNew}
        style={{ display: 'flex', alignItems: 'center', gap: 7, width: 'calc(100% - 12px)', margin: '0 6px 6px', padding: '8px 10px', border: `1px dashed ${BORDER}`, borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: INK2, fontFamily: F, transition: 'background 80ms' }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <Plus size={12} /> Nouvelle conversation
      </button>
      {convs.length === 0 && (
        <p style={{ fontSize: 11.5, color: INK3, padding: '12px 10px' }}>Aucune conversation</p>
      )}
      {convs.map(c => (
        <div key={c.id} onClick={() => onSelect(c.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', margin: '0 4px', borderRadius: 7, cursor: 'pointer', background: c.id === activeId ? 'rgba(0,0,0,0.055)' : 'transparent', transition: 'background 70ms' }}
          onMouseEnter={e => { if (c.id !== activeId) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
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
  );
}

// ── Plus menu ─────────────────────────────────────────────────────
function PlusMenu({ onFile, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.12 }}
      style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: '0 6px 24px rgba(0,0,0,0.10)', overflow: 'hidden', minWidth: 190, zIndex: 100 }}>
      <button onClick={onFile}
        style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12.5, color: INK, fontFamily: F, textAlign: 'left', transition: 'background 70ms' }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <Paperclip size={13} color={INK2} />
        Joindre des fichiers
      </button>
      <div style={{ height: 1, background: BORDER }} />
      <button onClick={() => { window.open('https://drive.google.com', '_blank'); onClose(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12.5, color: INK, fontFamily: F, textAlign: 'left', transition: 'background 70ms' }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <svg width="13" height="13" viewBox="0 0 87.3 78" fill="none">
          <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
          <path d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
          <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335"/>
          <path d="M43.65 25L57.4 0H30.6L16.85 25z" fill="#00832d"/>
          <path d="M59.8 53H27.5L13.75 76.8h62.35z" fill="#2684fc"/>
          <path d="M73.4 26.35l-12.7-22.05c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
        </svg>
        Importer depuis Google Drive
      </button>
    </motion.div>
  );
}

// ── Storage ───────────────────────────────────────────────────────
const STORAGE_KEY = 'wok_ai_v2';
function loadConvs() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
function saveConvs(c) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {} }
function pruneOldConvs(c) { const cut = Date.now() - 60 * 864e5; return c.filter(x => x.updatedAt > cut); }

// ── Build full context from profile ──────────────────────────────
function buildFullContext(user, profile, activeDomain) {
  const userName = user?.full_name || user?.email?.split('@')[0] || 'l\'utilisateur';
  const domainUrl = activeDomain?.url || profile?.site_url || '';

  let ctx = `Tu es WOK AI, l'assistant SEO & visibilité IA de ${userName}.\n`;
  ctx += `RÈGLES STRICTES :\n`;
  ctx += `- Réponds UNIQUEMENT à partir des données fournies ci-dessous.\n`;
  ctx += `- Si une donnée n'est pas dans ce contexte, dis "Je n'ai pas cette info précise" — NE JAMAIS inventer de chiffre.\n`;
  ctx += `- Réponds en français, sois direct, sans jargon, sans blabla. Max 150 mots sauf si plus demandé.\n`;
  ctx += `- Structure : point clé → explication simple → action concrète.\n\n`;

  ctx += `=== DONNÉES RÉELLES DU COMPTE ===\n`;
  ctx += `Utilisateur : ${userName}\n`;
  if (user?.email) ctx += `Email : ${user.email}\n`;
  if (domainUrl) ctx += `Site analysé : ${domainUrl}\n`;

  if (!profile) {
    ctx += `\nAucune analyse disponible pour ce domaine. Tu peux informer l'utilisateur qu'il doit d'abord lancer un scan depuis l'accueil.\n`;
    return ctx;
  }

  // Core scores
  ctx += `\n--- Scores ---\n`;
  if (profile.score_overall) ctx += `Score global : ${profile.score_overall}/100\n`;
  if (profile.lrs_score) ctx += `LRS (LLM Resonance Score) : ${profile.lrs_score}/100\n`;
  if (profile.score_previous) ctx += `Score précédent : ${profile.score_previous}/100\n`;
  if (profile.score_ai_visibility) ctx += `Visibilité IA : ${profile.score_ai_visibility}/100\n`;
  if (profile.score_message_clarity) ctx += `Clarté du message : ${profile.score_message_clarity}/100\n`;
  if (profile.score_commercial_signal) ctx += `Signal commercial : ${profile.score_commercial_signal}/100\n`;
  if (profile.chatgpt_score) ctx += `ChatGPT score : ${profile.chatgpt_score}\n`;
  if (profile.gemini_score) ctx += `Gemini score : ${profile.gemini_score}\n`;
  if (profile.claude_score) ctx += `Claude score : ${profile.claude_score}\n`;
  if (profile.perplexity_score) ctx += `Perplexity score : ${profile.perplexity_score}\n`;
  if (profile.last_scan) ctx += `Dernier scan : ${new Date(profile.last_scan).toLocaleDateString('fr-FR')}\n`;

  // Business info
  ctx += `\n--- Entreprise ---\n`;
  if (profile.identity_name) ctx += `Nom : ${profile.identity_name}\n`;
  if (profile.identity_industry) ctx += `Secteur : ${profile.identity_industry}\n`;
  if (profile.identity_city) ctx += `Ville : ${profile.identity_city}\n`;
  if (profile.identity_target) ctx += `Cible : ${profile.identity_target}\n`;
  if (profile.brand_tone) ctx += `Ton de marque : ${profile.brand_tone}\n`;

  // Key insights
  if (profile.shock_insight) ctx += `\n--- Insight principal ---\n${profile.shock_insight}\n`;
  if (profile.ai_reason) ctx += `Raison de la note IA : ${profile.ai_reason}\n`;
  if (profile.recommendation) ctx += `Recommandation principale : ${profile.recommendation}\n`;

  // Action plan
  if (profile.action_plan?.length) {
    ctx += `\n--- Plan d'action ---\n`;
    profile.action_plan.slice(0, 5).forEach((a, i) => {
      const title = a.title || (typeof a === 'string' ? a : '');
      const priority = a.priority || '';
      const impact = a.impact_score || a.impact || '';
      ctx += `${i+1}. ${title}${priority ? ` [${priority}]` : ''}${impact ? ` (impact: ${impact})` : ''}\n`;
      if (a.description) ctx += `   → ${a.description}\n`;
    });
  }

  // Competitors
  if (profile.competitors?.length) {
    ctx += `\n--- Concurrents détectés ---\n`;
    profile.competitors.slice(0, 4).forEach(c => {
      const name = c.name || c.domain || c;
      const score = c.score || c.lrs_score || '';
      ctx += `- ${name}${score ? ` (score: ${score})` : ''}\n`;
    });
  }

  // Technical issues
  if (profile.technical_issues?.length || profile.issues?.length) {
    const issues = profile.technical_issues || profile.issues || [];
    ctx += `\n--- Problèmes techniques ---\n`;
    issues.slice(0, 6).forEach(issue => {
      const t = issue.title || issue.name || (typeof issue === 'string' ? issue : '');
      const sev = issue.severity || issue.priority || '';
      ctx += `- ${t}${sev ? ` [${sev}]` : ''}\n`;
    });
  }

  // Audit data
  if (profile.audit_data) {
    try {
      const a = typeof profile.audit_data === 'string' ? JSON.parse(profile.audit_data) : profile.audit_data;
      ctx += `\n--- Audit technique ---\n`;
      if (a.overall_score) ctx += `Score audit : ${a.overall_score}/100\n`;
      if (a.crawlability_score) ctx += `Crawlabilité : ${a.crawlability_score}/100\n`;
      if (a.performance_score) ctx += `Performance technique : ${a.performance_score}/100\n`;
      if (a.indexation_score) ctx += `Indexation : ${a.indexation_score}/100\n`;
      if (a.critical_issues?.length) {
        ctx += `Problèmes critiques :\n`;
        a.critical_issues.slice(0, 5).forEach(i => { ctx += `  - ${i.title || i.name || i}\n`; });
      }
      if (a.warnings?.length) {
        ctx += `Avertissements :\n`;
        a.warnings.slice(0, 3).forEach(w => { ctx += `  - ${w.title || w.name || w}\n`; });
      }
      if (a.pages_crawled) ctx += `Pages crawlées : ${a.pages_crawled}\n`;
      if (a.broken_links_count) ctx += `Liens cassés : ${a.broken_links_count}\n`;
      if (a.missing_meta_count) ctx += `Méta manquants : ${a.missing_meta_count}\n`;
    } catch {}
  }

  // Perf data
  if (profile.perf_data) {
    try {
      const pf = typeof profile.perf_data === 'string' ? JSON.parse(profile.perf_data) : profile.perf_data;
      ctx += `\n--- Performance & Share of Voice ---\n`;
      if (pf.lrs_score) ctx += `LRS performance : ${pf.lrs_score}\n`;
      if (pf.lrs_trend) ctx += `Tendance : ${pf.lrs_trend}\n`;
      if (pf.lrs_vs_industry) ctx += `vs secteur : ${pf.lrs_vs_industry > 0 ? '+' : ''}${pf.lrs_vs_industry}pts\n`;
      const sov = pf.share_of_voice?.your_brand;
      if (sov?.voice_share_pct) ctx += `Part de voix IA : ${sov.voice_share_pct}%\n`;
      if (sov?.favorable_pct) ctx += `Réponses favorables : ${sov.favorable_pct}%\n`;
      if (pf.ai_mentions_count) ctx += `Mentions IA/mois : ~${pf.ai_mentions_count}\n`;
      if (pf.strategy?.strategic_levers?.length) {
        ctx += `Leviers stratégiques :\n`;
        pf.strategy.strategic_levers.slice(0, 3).forEach(l => { ctx += `  - ${l.title} [${l.priority}]\n`; });
      }
    } catch {}
  }

  ctx += `\n=== FIN DES DONNÉES ===\n`;
  ctx += `Réponds uniquement sur la base de ces données. Ne présume rien d'autre.\n`;
  return ctx;
}

// ── Main ──────────────────────────────────────────────────────────
export default function WokAIPage({ user, onBack }) {
  const [view, setView] = useState('list');
  const [convs, setConvs] = useState(() => pruneOldConvs(loadConvs()));
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [files, setFiles] = useState([]);
  const [showPlus, setShowPlus] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const userInitials = (user?.full_name || user?.email || '?').slice(0, 2).toUpperCase();
  const domainLabel = activeDomain?.url?.replace(/https?:\/\//, '').split('/')[0] || '';

  // Load profile for the active domain of THIS user
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

  const persistConvs = (c) => { saveConvs(c); setConvs(c); };
  const activeConv = convs.find(c => c.id === activeConvId);

  const openConv = (id) => {
    const c = convs.find(cv => cv.id === id);
    if (c) { setMessages(c.messages || []); setActiveConvId(id); setView('chat'); }
  };

  const newConv = () => { setMessages([]); setActiveConvId(null); setFiles([]); setView('chat'); };

  const deleteConv = (id) => {
    const next = convs.filter(c => c.id !== id);
    persistConvs(next);
    if (activeConvId === id) { setMessages([]); setActiveConvId(null); setView('list'); }
  };

  const generateTitle = async (firstMsg) => {
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Génère un titre court en 3-5 mots (français) qui résume cette question. Question : "${firstMsg.slice(0, 120)}". Retourne UNIQUEMENT le titre, sans guillemets.`,
      });
      return (typeof res === 'string' ? res : firstMsg).slice(0, 48);
    } catch { return firstMsg.slice(0, 40); }
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content && files.length === 0) return;
    setInput('');

    let uploadedFiles = [];
    if (files.length > 0) {
      setLoading(true); setLoadingLabel('Lecture des fichiers…');
      for (const f of files) {
        try { const r = await base44.integrations.Core.UploadFile({ file: f }); uploadedFiles.push({ name: f.name, url: r.file_url }); } catch {}
      }
      setFiles([]);
    }

    const userMsg = { role: 'user', content, files: uploadedFiles, ts: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);
    setLoadingLabel(profile ? 'Je consulte tes données…' : 'Je réfléchis…');

    try {
      const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'USER' : 'WOK_AI'}: ${m.content}`).join('\n');
      const systemCtx = buildFullContext(user, profile, activeDomain);
      let fullPrompt = systemCtx;
      if (history) fullPrompt += `\n--- Historique de cette conversation ---\n${history}\n`;
      fullPrompt += `\nUSER: ${content}`;

      const fileUrls = uploadedFiles.map(f => f.url).filter(Boolean);
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
      });

      const aiContent = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.response || aiResponse?.text || 'Erreur de réponse.');
      const aiMsg = { role: 'assistant', content: aiContent, ts: Date.now() };
      const finalMessages = [...nextMessages, aiMsg];
      setMessages(finalMessages);

      if (activeConvId) {
        persistConvs(convs.map(c => c.id === activeConvId ? { ...c, messages: finalMessages, updatedAt: Date.now() } : c));
      } else {
        const title = await generateTitle(content);
        const nc = { id: `c_${Date.now()}`, title, messages: finalMessages, createdAt: Date.now(), updatedAt: Date.now() };
        setActiveConvId(nc.id);
        persistConvs([nc, ...convs]);
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Je n\'ai pas pu répondre. Réessaie.', ts: Date.now() }]);
    } finally { setLoading(false); setLoadingLabel(''); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleFileSelect = (e) => {
    const sel = Array.from(e.target.files || []).slice(0, 3 - files.length);
    setFiles(f => [...f, ...sel]); setShowPlus(false); e.target.value = '';
  };

  // ── LIST VIEW ──────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', fontFamily: F }}>
        <div style={{ padding: '8px 8px 4px', flexShrink: 0 }}>
          <button onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(0,0,0,0.4)', fontFamily: F, padding: '4px 4px', borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = '#111'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.4)'}>
            <ChevronRight style={{ width: 12, height: 12, transform: 'rotate(180deg)' }} />
            <span>Retour</span>
          </button>
          <div style={{ padding: '8px 4px 4px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={10} color={WHITE} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>WOK AI</span>
            {domainLabel && <span style={{ fontSize: 10, color: INK3, background: SURFACE, borderRadius: 4, padding: '1px 6px', border: `1px solid ${BORDER}` }}>{domainLabel}</span>}
          </div>
        </div>
        <ConvList convs={convs} activeId={activeConvId} onSelect={openConv} onNew={newConv} onDelete={deleteConv} />
      </div>
    );
  }

  // ── CHAT VIEW — inside the sidebar container, no fixed/overflow ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', fontFamily: F, background: WHITE }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '10px 10px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setView('list')}
          style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', borderRadius: 5, color: INK3, transition: 'color 80ms' }}
          onMouseEnter={e => e.currentTarget.style.color = INK}
          onMouseLeave={e => e.currentTarget.style.color = INK3}>
          <ChevronRight style={{ width: 12, height: 12, transform: 'rotate(180deg)' }} />
        </button>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={10} color={WHITE} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeConv?.title || 'Nouvelle conversation'}
          </div>
          {domainLabel && <div style={{ fontSize: 10, color: INK3 }}>{domainLabel}</div>}
        </div>
        <button onClick={onBack}
          style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', flexShrink: 0 }}>
          <X size={10} color={INK3} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 10px 6px' }}>
        {messages.length === 0 ? (
          <EmptyState onSuggest={s => sendMessage(s)} domain={domainLabel} />
        ) : (
          <>
            {messages.map((m, i) => <MessageBubble key={i} msg={m} userInitials={userInitials} />)}
            {loading && (
              <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={10} color={WHITE} />
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
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: '6px 10px 0', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: `1px solid ${BORDER}`, background: WHITE }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11, color: INK2 }}>
                <Paperclip size={9} color={INK3} />
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <button onClick={() => setFiles(f => f.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                  <X size={8} color={INK3} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div style={{ flexShrink: 0, padding: '6px 8px 10px', background: WHITE, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '8px 10px' }}>
          <textarea
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ta question…" rows={1}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: INK, fontFamily: F, resize: 'none', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowPlus(v => !v)}
                style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 80ms' }}
                onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                <Plus size={12} color={INK2} />
              </button>
              <AnimatePresence>
                {showPlus && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowPlus(false)} />
                    <div style={{ position: 'absolute', zIndex: 100 }}>
                      <PlusMenu onFile={() => { fileInputRef.current?.click(); setShowPlus(false); }} onClose={() => setShowPlus(false)} />
                    </div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => sendMessage()} disabled={loading || (!input.trim() && files.length === 0)}
              style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: (loading || (!input.trim() && files.length === 0)) ? '#DDD' : INK, cursor: (loading || (!input.trim() && files.length === 0)) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}>
              <Send size={12} color={WHITE} />
            </button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handleFileSelect} />

      <style>{`
        @keyframes wokdot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}
        .wok-prose p{margin:0 0 7px;font-size:13px;line-height:1.6;color:#111110}
        .wok-prose p:last-child{margin:0}
        .wok-prose ul,.wok-prose ol{margin:5px 0;padding-left:16px}
        .wok-prose li{font-size:12.5px;line-height:1.55;margin-bottom:3px;color:#111110}
        .wok-prose strong{font-weight:700;color:#111110}
        .wok-prose h1,.wok-prose h2,.wok-prose h3{font-size:13px;font-weight:700;margin:8px 0 5px;color:#111110}
        .wok-prose code{font-size:11.5px;background:#F0F0EE;padding:1px 4px;border-radius:3px}
      `}</style>
    </div>
  );
}