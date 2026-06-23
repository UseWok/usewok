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
const BORDER = '#E8E8E6';
const SURFACE = '#F7F6F4';
const WHITE = '#FFFFFF';
const BG = '#F8F7F4';

// ── Typing indicator ────────────────────────────────────────────────────────
function TypingDots({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, maxWidth: 260 }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%', background: INK3,
            animation: `wokdot 1.1s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <span style={{ fontSize: 12, color: INK3 }}>{label || 'Je regarde ton espace…'}</span>
    </div>
  );
}

// ── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ msg, userInitials }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-end', marginBottom: 16 }}>
      {!isUser && (
        <div style={{ width: 26, height: 26, borderRadius: 8, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 }}>
          <Sparkles size={12} color={WHITE} />
        </div>
      )}
      {isUser && (
        <div style={{ width: 26, height: 26, borderRadius: 8, background: '#7C6AF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: WHITE, flexShrink: 0, marginBottom: 2 }}>
          {userInitials}
        </div>
      )}
      <div style={{ maxWidth: '82%' }}>
        {msg.files?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
            {msg.files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', background: isUser ? 'rgba(124,106,244,0.12)' : SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11, color: INK2 }}>
                <Paperclip size={10} color={INK3} />
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{
          padding: isUser ? '10px 14px' : '12px 16px',
          background: isUser ? INK : WHITE,
          border: isUser ? 'none' : `1px solid ${BORDER}`,
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          fontSize: 13.5, lineHeight: 1.65, color: isUser ? WHITE : INK,
          boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          {isUser ? (
            <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
          ) : (
            <div className="wok-ai-prose">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, color: INK3, marginTop: 4, textAlign: isUser ? 'right' : 'left', paddingLeft: isUser ? 0 : 4 }}>
          {new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

// ── Empty welcome ───────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'Résume les 3 problèmes les plus urgents',
  'Pourquoi mon score a-t-il baissé ?',
  'Que dois-je corriger en premier ?',
  'Explique-moi l\'audit simplement',
  'Que dit mon dernier scan ?',
];

function EmptyState({ onSuggest, profile }) {
  const domain = profile?.site_url?.replace(/https?:\/\//, '').split('/')[0];
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', textAlign: 'center' }}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, ease: [0.34,1.56,0.64,1] }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          <Sparkles size={22} color={WHITE} />
        </div>
      </motion.div>
      <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>WOK AI</p>
      <p style={{ fontSize: 13, color: INK3, margin: '0 0 28px', lineHeight: 1.6, maxWidth: 260 }}>
        {domain ? `Je connais ${domain} et toutes tes données.` : 'Pose-moi n\'importe quelle question sur ton site.'}
        <br />Pose-moi une question, je vais à l'essentiel.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, width: '100%', maxWidth: 340 }}>
        {SUGGESTIONS.map((s, i) => (
          <motion.button key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => onSuggest(s)}
            style={{ padding: '10px 14px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 12.5, color: INK2, cursor: 'pointer', textAlign: 'left', fontFamily: F, transition: 'all 100ms' }}
            onMouseEnter={e => { e.currentTarget.style.background = SURFACE; e.currentTarget.style.borderColor = '#CCC'; }}
            onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}>
            {s}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Conversation list ───────────────────────────────────────────────────────
function ConvList({ convs, activeId, onSelect, onNew, onDelete }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
      <button onClick={onNew}
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'calc(100% - 16px)', margin: '0 8px 8px', padding: '10px 12px', border: `1.5px dashed ${BORDER}`, borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: INK2, fontFamily: F, transition: 'background 100ms' }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <Plus size={13} /> Nouvelle conversation
      </button>
      {convs.length === 0 && (
        <p style={{ fontSize: 12, color: INK3, textAlign: 'center', padding: '20px 16px' }}>Aucune conversation encore</p>
      )}
      {convs.map(c => (
        <div key={c.id} onClick={() => onSelect(c.id)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', margin: '0 6px', borderRadius: 8, cursor: 'pointer', background: c.id === activeId ? 'rgba(0,0,0,0.06)' : 'transparent', transition: 'background 80ms' }}
          onMouseEnter={e => { if (c.id !== activeId) e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
          onMouseLeave={e => { if (c.id !== activeId) e.currentTarget.style.background = 'transparent'; }}>
          <MessageSquare size={12} color={c.id === activeId ? INK : INK3} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 12.5, fontWeight: c.id === activeId ? 600 : 400, color: c.id === activeId ? INK : INK2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {c.title || 'Discussion'}
          </span>
          <button onClick={e => { e.stopPropagation(); onDelete(c.id); }}
            style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0, transition: 'opacity 100ms', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}>
            <Trash2 size={10} color="#EF4444" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Plus menu ───────────────────────────────────────────────────────────────
function PlusMenu({ onFile, onClose }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.14 }}
      style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: 200, zIndex: 100 }}>
      <button onClick={onFile}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: INK, fontFamily: F, textAlign: 'left', transition: 'background 80ms' }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paperclip size={13} color={INK2} />
        </div>
        Joindre des fichiers
      </button>
      <div style={{ height: 1, background: BORDER, margin: '0 10px' }} />
      <button onClick={() => { window.open('https://drive.google.com', '_blank'); onClose(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '11px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: INK, fontFamily: F, textAlign: 'left', transition: 'background 80ms' }}
        onMouseEnter={e => e.currentTarget.style.background = SURFACE}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: SURFACE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 87.3 78" fill="none">
            <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
            <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#ea4335"/>
            <path d="M43.65 25L57.4 0H30.6L16.85 25z" fill="#00832d"/>
            <path d="M59.8 53H27.5L13.75 76.8h62.35z" fill="#2684fc"/>
            <path d="M73.4 26.35l-12.7-22.05c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>
        </div>
        Importer depuis Google Drive
      </button>
    </motion.div>
  );
}

// ── Storage helpers ─────────────────────────────────────────────────────────
const STORAGE_KEY = 'wok_ai_conversations_v1';
function loadConvs() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
function saveConvs(c) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch {} }

// Auto-prune conversations older than 60 days
function pruneOldConvs(convs) {
  const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
  return convs.filter(c => c.updatedAt > cutoff);
}

// ── Main WOK AI Page ────────────────────────────────────────────────────────
export default function WokAIPage({ user, onBack }) {
  const [view, setView] = useState('list'); // 'list' | 'chat'
  const [convs, setConvs] = useState(() => pruneOldConvs(loadConvs()));
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [files, setFiles] = useState([]);
  const [showPlus, setShowPlus] = useState(false);
  const [profile, setProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const userInitials = (user?.full_name || user?.email || '?').slice(0, 2).toUpperCase();

  // Load profile context
  useEffect(() => {
    const active = getActiveDomain();
    if (!active?.url) return;
    base44.entities.BusinessProfile.filter({ site_url: active.url }).then(results => {
      if (results.length > 0) {
        let extra = {};
        try { extra = JSON.parse(results[0].brand_keywords || '{}'); } catch {}
        setProfile({ ...results[0], ...extra });
      }
    }).catch(() => {});
  }, []);

  // Scroll to bottom
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Save convs
  const persistConvs = (c) => { saveConvs(c); setConvs(c); };

  const activeConv = convs.find(c => c.id === activeConvId);

  const openConv = (id) => {
    const c = convs.find(cv => cv.id === id);
    if (c) { setMessages(c.messages || []); setActiveConvId(id); setView('chat'); }
  };

  const newConv = () => {
    setMessages([]); setActiveConvId(null); setFiles([]); setView('chat');
  };

  const deleteConv = (id) => {
    const next = convs.filter(c => c.id !== id);
    persistConvs(next);
    if (activeConvId === id) { setMessages([]); setActiveConvId(null); setView('list'); }
  };

  // Build system context
  const buildContext = useCallback(() => {
    const domain = getActiveDomain();
    const p = profile;
    let ctx = `Tu es WOK AI, l'assistant personnel de ${user?.full_name || 'l\'utilisateur'}.\n`;
    ctx += `Ton rôle : répondre de façon concrète, claire, sans jargon, directement utile.\n`;
    ctx += `Réponds en français. Sois direct, structuré, orienté action. Pas de blabla.\n\n`;
    if (domain?.url) ctx += `Site analysé : ${domain.url}\n`;
    if (user?.full_name) ctx += `Utilisateur : ${user.full_name}\n`;
    if (p) {
      if (p.identity_name) ctx += `Business : ${p.identity_name}\n`;
      if (p.identity_industry) ctx += `Secteur : ${p.identity_industry}\n`;
      if (p.score_overall) ctx += `Score global : ${p.score_overall}/100\n`;
      if (p.lrs_score) ctx += `LRS score : ${p.lrs_score}/100\n`;
      if (p.score_ai_visibility) ctx += `Visibilité IA : ${p.score_ai_visibility}/100\n`;
      if (p.score_message_clarity) ctx += `Clarté message : ${p.score_message_clarity}/100\n`;
      if (p.shock_insight) ctx += `Insight clé : ${p.shock_insight}\n`;
      // Audit data
      if (p.audit_data) {
        try {
          const a = typeof p.audit_data === 'string' ? JSON.parse(p.audit_data) : p.audit_data;
          if (a.critical_issues?.length) ctx += `Problèmes critiques audit : ${a.critical_issues.slice(0,3).map(i => i.title || i).join(', ')}\n`;
          if (a.overall_score) ctx += `Score audit : ${a.overall_score}/100\n`;
        } catch {}
      }
      // Perf data
      if (p.perf_data) {
        try {
          const pf = typeof p.perf_data === 'string' ? JSON.parse(p.perf_data) : p.perf_data;
          if (pf.lrs_score) ctx += `Score performance LRS : ${pf.lrs_score}\n`;
          if (pf.share_of_voice?.your_brand?.voice_share_pct) ctx += `Part de voix IA : ${pf.share_of_voice.your_brand.voice_share_pct}%\n`;
        } catch {}
      }
      if (p.action_plan?.length) {
        ctx += `Plan d'action (top 3) : ${p.action_plan.slice(0,3).map(a => a.title || a).join(' | ')}\n`;
      }
    }
    ctx += `\nSi une donnée précise existe, cite-la directement. Si elle n'existe pas, dis-le simplement sans inventer.`;
    return ctx;
  }, [profile, user]);

  // Generate title from first message
  const generateTitle = async (firstMsg) => {
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Génère un titre court (3-6 mots, en français) qui résume cette question utilisateur. 
        Question : "${firstMsg}"
        Retourne UNIQUEMENT le titre, sans guillemets, sans ponctuation finale.
        Exemples : "Pourquoi mon score baisse" / "Résumé de l'audit SEO" / "Points urgents à corriger"`,
        model: 'gpt_5_mini',
      });
      return (typeof res === 'string' ? res : res?.title || firstMsg).slice(0, 50);
    } catch {
      return firstMsg.slice(0, 40);
    }
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content && files.length === 0) return;
    setInput('');

    // Upload files if any
    let uploadedFiles = [];
    if (files.length > 0) {
      setLoadingLabel('Lecture des fichiers…');
      for (const f of files) {
        try {
          const res = await base44.integrations.Core.UploadFile({ file: f });
          uploadedFiles.push({ name: f.name, url: res.file_url, type: f.type });
        } catch {}
      }
      setFiles([]);
    }

    const userMsg = { role: 'user', content, files: uploadedFiles, ts: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);
    setLoadingLabel(profile ? 'J\'analyse tes données…' : 'Je réfléchis…');

    try {
      // Build history for context
      const history = messages.slice(-8).map(m => `${m.role === 'user' ? 'Utilisateur' : 'WOK AI'}: ${m.content}`).join('\n');
      const systemCtx = buildContext();
      
      let fullPrompt = `${systemCtx}\n\n`;
      if (history) fullPrompt += `Historique récent :\n${history}\n\n`;
      fullPrompt += `Utilisateur : ${content}`;

      const fileUrls = uploadedFiles.map(f => f.url).filter(Boolean);

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        model: 'gpt_5_mini',
        ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
      });

      const aiContent = typeof aiResponse === 'string' ? aiResponse : (aiResponse?.response || aiResponse?.text || JSON.stringify(aiResponse));
      const aiMsg = { role: 'assistant', content: aiContent, ts: Date.now() };
      const finalMessages = [...nextMessages, aiMsg];
      setMessages(finalMessages);

      // Save / update conversation
      if (activeConvId) {
        const updated = convs.map(c => c.id === activeConvId ? { ...c, messages: finalMessages, updatedAt: Date.now() } : c);
        persistConvs(updated);
      } else {
        const title = await generateTitle(content);
        const newConvObj = { id: `conv_${Date.now()}`, title, messages: finalMessages, createdAt: Date.now(), updatedAt: Date.now() };
        setActiveConvId(newConvObj.id);
        persistConvs([newConvObj, ...convs]);
      }
    } catch (err) {
      const errMsg = { role: 'assistant', content: 'Je n\'ai pas pu répondre cette fois. Réessaie dans un instant.', ts: Date.now() };
      setMessages(m => [...m, errMsg]);
    } finally {
      setLoading(false);
      setLoadingLabel('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    const remaining = 3 - files.length;
    const toAdd = selected.slice(0, remaining);
    setFiles(f => [...f, ...toAdd]);
    setShowPlus(false);
    e.target.value = '';
  };

  // ── LIST VIEW ──
  if (view === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', fontFamily: F }}>
        {/* Header */}
        <div style={{ padding: '10px 8px 6px', flexShrink: 0 }}>
          <button onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: 'rgba(0,0,0,0.45)', fontFamily: F, padding: '4px 4px' }}
            onMouseEnter={e => e.currentTarget.style.color = '#111'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.45)'}>
            <ChevronRight style={{ width: 13, height: 13, transform: 'rotate(180deg)' }} />
            <span>Retour</span>
          </button>
          <div style={{ padding: '10px 4px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={11} color={WHITE} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>WOK AI</span>
          </div>
        </div>
        <ConvList convs={convs} activeId={activeConvId} onSelect={openConv} onNew={newConv} onDelete={deleteConv} />
      </div>
    );
  }

  // ── CHAT VIEW ──
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, background: BG, display: 'flex', flexDirection: 'column', fontFamily: F }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setView('list')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: INK3, fontFamily: F, padding: '4px 6px', borderRadius: 6, transition: 'color 100ms' }}
          onMouseEnter={e => e.currentTarget.style.color = INK}
          onMouseLeave={e => e.currentTarget.style.color = INK3}>
          <ChevronRight style={{ width: 13, height: 13, transform: 'rotate(180deg)' }} />
        </button>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={13} color={WHITE} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeConv?.title || 'Nouvelle conversation'}
          </div>
          {profile?.site_url && (
            <div style={{ fontSize: 10.5, color: INK3 }}>{profile.site_url.replace(/https?:\/\//, '').split('/')[0]}</div>
          )}
        </div>
        <button onClick={onBack}
          style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer' }}>
          <X size={12} color={INK3} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 8px' }}>
        {messages.length === 0 ? (
          <EmptyState onSuggest={s => sendMessage(s)} profile={profile} />
        ) : (
          <>
            {messages.map((m, i) => <MessageBubble key={i} msg={m} userInitials={userInitials} />)}
            {loading && (
              <div style={{ marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={12} color={WHITE} />
                </div>
                <TypingDots label={loadingLabel} />
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Files preview */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ padding: '8px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap', background: WHITE, borderTop: `1px solid ${BORDER}` }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 8px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11, color: INK2 }}>
                <Paperclip size={10} color={INK3} />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <button onClick={() => setFiles(f => f.filter((_, j) => j !== i))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', lineHeight: 1 }}>
                  <X size={9} color={INK3} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div style={{ flexShrink: 0, padding: '8px 12px 16px', background: WHITE, borderTop: files.length > 0 ? 'none' : `1px solid ${BORDER}` }}>
        <div style={{ background: SURFACE, border: `1.5px solid ${BORDER}`, borderRadius: 16, padding: '10px 12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question…"
            rows={1}
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13.5, color: INK, fontFamily: F, resize: 'none',
              lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowPlus(v => !v)}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 100ms' }}
                onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                onMouseLeave={e => e.currentTarget.style.background = WHITE}>
                <Plus size={14} color={INK2} />
              </button>
              <AnimatePresence>
                {showPlus && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowPlus(false)} />
                    <div style={{ position: 'absolute', zIndex: 100 }}>
                      <PlusMenu
                        onFile={() => { fileInputRef.current?.click(); setShowPlus(false); }}
                        onClose={() => setShowPlus(false)}
                      />
                    </div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <button onClick={() => sendMessage()}
              disabled={loading || (!input.trim() && files.length === 0)}
              style={{
                width: 34, height: 34, borderRadius: 10, border: 'none',
                background: (loading || (!input.trim() && files.length === 0)) ? '#DDD' : INK,
                cursor: (loading || (!input.trim() && files.length === 0)) ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms',
              }}>
              <Send size={14} color={WHITE} />
            </button>
          </div>
        </div>
        <p style={{ fontSize: 10, color: INK3, textAlign: 'center', margin: '6px 0 0' }}>Max 3 fichiers · Conversations effacées après 60 jours</p>
      </div>

      <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handleFileSelect} />

      <style>{`
        @keyframes wokdot { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }
        .wok-ai-prose p { margin: 0 0 8px; font-size: 13.5px; line-height: 1.65; color: #111110; }
        .wok-ai-prose p:last-child { margin-bottom: 0; }
        .wok-ai-prose ul, .wok-ai-prose ol { margin: 6px 0; padding-left: 18px; }
        .wok-ai-prose li { font-size: 13px; line-height: 1.6; margin-bottom: 3px; color: #111110; }
        .wok-ai-prose strong { font-weight: 700; color: #111110; }
        .wok-ai-prose h1,h2,h3 { font-size: 14px; font-weight: 700; margin: 10px 0 6px; color: #111110; }
        .wok-ai-prose code { font-size: 12px; background: #F0F0EE; padding: 1px 5px; border-radius: 4px; }
      `}</style>
    </div>
  );
}