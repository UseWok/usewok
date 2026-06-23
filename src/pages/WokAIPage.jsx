import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Paperclip, Send, Sparkles, FileText, ArrowUp, Zap, AlertTriangle, TrendingUp, Target } from 'lucide-react';
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

// ── Typing dots ────────────────────────────────────────────────────
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

// ── Message bubble ─────────────────────────────────────────────────
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
      <div style={{ maxWidth: '80%' }}>
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

// ── Smart suggestions based on profile data ──────────────────────
function getSmartSuggestions(profile, domainLabel) {
  if (!profile) return [
    { icon: Zap, text: 'Lance un scan pour analyser mon site', color: '#7C6AF4' },
    { icon: Target, text: 'Comment améliorer ma visibilité sur les IA ?', color: '#10B981' },
    { icon: AlertTriangle, text: 'Quels sont les critères clés pour ChatGPT ?', color: '#F59E0B' },
    { icon: TrendingUp, text: 'Comment optimiser mon contenu pour les LLM ?', color: '#3B8BEB' },
  ];

  const score = profile.score_overall || profile.lrs_score || 0;
  const critiques = (() => {
    try {
      const a = typeof profile.audit_data === 'string' ? JSON.parse(profile.audit_data) : profile.audit_data;
      return a?.critical_issues?.slice(0, 1)?.[0]?.title || null;
    } catch { return null; }
  })();
  const topCompetitor = profile.competitors?.[0]?.name || profile.competitors?.[0]?.domain || null;

  const suggestions = [
    {
      icon: Zap,
      text: score > 0 ? `Mon score est ${score}/100 — comment l'améliorer rapidement ?` : 'Quelles sont mes priorités d\'optimisation ?',
      color: '#7C6AF4'
    },
    {
      icon: AlertTriangle,
      text: critiques ? `Comment corriger "${critiques.slice(0, 40)}" ?` : 'Quels problèmes techniques bloquent mon référencement IA ?',
      color: '#EF4444'
    },
    {
      icon: TrendingUp,
      text: topCompetitor ? `Pourquoi ${topCompetitor} me dépasse-t-il sur les IA ?` : 'Comment améliorer ma part de voix IA vs concurrents ?',
      color: '#10B981'
    },
    {
      icon: Target,
      text: `Donne-moi un plan d'action concret pour ${domainLabel || 'mon site'} cette semaine`,
      color: '#F59E0B'
    },
  ];
  return suggestions;
}

function EmptyState({ onSuggest, domain, profile }) {
  const suggestions = getSmartSuggestions(profile, domain);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', maxWidth: 560, margin: '0 auto', width: '100%' }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Sparkles size={20} color={WHITE} />
      </div>
      <p style={{ fontSize: 18, fontWeight: 700, color: INK, margin: '0 0 6px', letterSpacing: '-0.03em' }}>WOK AI</p>
      <p style={{ fontSize: 13, color: INK3, margin: '0 0 28px', lineHeight: 1.6, textAlign: 'center' }}>
        {domain
          ? `Données de ${domain} disponibles. Pose ta question.`
          : 'Lance un scan depuis l\'accueil pour des réponses basées sur tes données réelles.'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
        {suggestions.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={i} onClick={() => onSuggest(s.text)}
              style={{ padding: '12px 14px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, fontSize: 12.5, color: INK2, cursor: 'pointer', textAlign: 'left', fontFamily: F, lineHeight: 1.45, transition: 'all 80ms', display: 'flex', flexDirection: 'column', gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.background = SURFACE; e.currentTarget.style.borderColor = '#D5D5D5'; }}
              onMouseLeave={e => { e.currentTarget.style.background = WHITE; e.currentTarget.style.borderColor = BORDER; }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={12} color={s.color} />
              </div>
              <span style={{ color: INK, fontWeight: 500 }}>{s.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Google Drive picker ────────────────────────────────────────────
function DrivePickerModal({ open, onClose, onImport }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true); setError(''); setFiles([]); setSelected([]);
    base44.functions.invoke('googleDriveFiles', {}).then(res => {
      setFiles(res?.data?.files || res?.data || []);
      setLoading(false);
    }).catch(() => {
      setError('Connexion Google Drive requise. Connecte-la dans Connexions.');
      setLoading(false);
    });
  }, [open]);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.18)', fontFamily: F }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Google Drive</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3 }}><X size={14} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loading && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Chargement…</p>}
          {error && <p style={{ fontSize: 13, color: '#EF4444', padding: '12px 6px', lineHeight: 1.5 }}>{error}</p>}
          {!loading && !error && files.length === 0 && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Aucun fichier trouvé</p>}
          {files.map(f => (
            <div key={f.id} onClick={() => toggle(f.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', background: selected.includes(f.id) ? '#F0EEFF' : 'transparent', marginBottom: 2 }}
              onMouseEnter={e => { if (!selected.includes(f.id)) e.currentTarget.style.background = SURFACE; }}
              onMouseLeave={e => { if (!selected.includes(f.id)) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 18, height: 18, border: `2px solid ${selected.includes(f.id) ? '#7C6AF4' : BORDER}`, borderRadius: 4, background: selected.includes(f.id) ? '#7C6AF4' : WHITE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected.includes(f.id) && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <FileText size={13} color={INK3} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: INK, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
            </div>
          ))}
        </div>
        {!error && (
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${BORDER}` }}>
            <button onClick={() => { onImport(files.filter(f => selected.includes(f.id))); onClose(); }} disabled={!selected.length}
              style={{ width: '100%', padding: '10px', background: selected.length ? INK : '#DDD', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, color: WHITE, cursor: selected.length ? 'pointer' : 'not-allowed', fontFamily: F }}>
              Importer {selected.length ? `${selected.length} fichier${selected.length > 1 ? 's' : ''}` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Storage ────────────────────────────────────────────────────────
const SK = 'wok_ai_v3';
function loadConvs() { try { return JSON.parse(localStorage.getItem(SK) || '[]'); } catch { return []; } }
function saveConvs(c) { try { localStorage.setItem(SK, JSON.stringify(c)); } catch {} }
function pruneConvs(c) { const cut = Date.now() - 60 * 864e5; return c.filter(x => x.updatedAt > cut); }

// ── Context builder — massively improved ──────────────────────────
function buildContext(user, profile, activeDomain) {
  const name = user?.full_name || user?.email?.split('@')[0] || 'utilisateur';
  const url = activeDomain?.url || profile?.site_url || '';
  const domainLabel = url.replace(/https?:\/\//, '').split('/')[0];

  let ctx = `Tu es WOK AI, l'expert SEO & visibilité IA personnel de ${name}.\n\n`;
  ctx += `## TES RÈGLES ABSOLUES\n`;
  ctx += `1. Réponds TOUJOURS avec des actions concrètes et numérotées. Jamais de vague "tu devrais améliorer ton SEO".\n`;
  ctx += `2. Cite les chiffres EXACTS du compte (scores, pourcentages, titres de problèmes). Pas de chiffres inventés.\n`;
  ctx += `3. Sois direct et pragmatique : "Fais X parce que Y" pas "Il serait intéressant de considérer..."\n`;
  ctx += `4. Si une donnée manque, dis exactement quelle analyse lancer pour l'obtenir.\n`;
  ctx += `5. Réponds en français. 200 mots max sauf si un plan détaillé est demandé.\n`;
  ctx += `6. Priorise par impact : commence toujours par ce qui change le plus le score.\n\n`;

  ctx += `## DONNÉES COMPTE — ${name} (${url})\n`;

  if (!profile) {
    ctx += `**AUCUNE DONNÉE DISPONIBLE** — Pas encore de scan pour ${domainLabel}.\n`;
    ctx += `→ Dis à l'utilisateur de cliquer "Analyser" sur l'accueil pour obtenir son score LRS.\n`;
    return ctx;
  }

  // Scores
  const scores = [];
  if (profile.score_overall) scores.push(`Score global: **${profile.score_overall}/100**`);
  if (profile.lrs_score) scores.push(`LRS: **${profile.lrs_score}/100**`);
  if (profile.score_previous && profile.score_overall) {
    const diff = profile.score_overall - profile.score_previous;
    scores.push(`Évolution: ${diff >= 0 ? '+' : ''}${diff} pts`);
  }
  if (profile.score_ai_visibility) scores.push(`Visibilité IA: ${profile.score_ai_visibility}/100`);
  if (profile.score_message_clarity) scores.push(`Clarté message: ${profile.score_message_clarity}/100`);
  if (profile.score_commercial_signal) scores.push(`Signal commercial: ${profile.score_commercial_signal}/100`);
  if (scores.length) ctx += `### Scores\n${scores.join(' | ')}\n`;

  // Scores par moteur IA
  const engines = ['chatgpt', 'gemini', 'claude', 'perplexity', 'mistral', 'grok'];
  const engScores = engines.filter(k => profile[`${k}_score`] != null).map(k => `${k}: ${profile[`${k}_score`]}`);
  if (engScores.length) ctx += `### Scores moteurs IA\n${engScores.join(' | ')}\n`;

  // Business info
  if (profile.identity_name || profile.identity_industry) {
    ctx += `### Business\n`;
    if (profile.identity_name) ctx += `Nom: ${profile.identity_name}\n`;
    if (profile.identity_industry) ctx += `Secteur: ${profile.identity_industry}\n`;
    if (profile.identity_city) ctx += `Ville: ${profile.identity_city}\n`;
    if (profile.identity_target) ctx += `Cible: ${profile.identity_target}\n`;
  }

  // Insight + recommandation principale
  if (profile.shock_insight) ctx += `### Insight clé\n"${profile.shock_insight}"\n`;
  if (profile.recommendation) ctx += `### Recommandation principale\n${profile.recommendation}\n`;

  // Plan d'action
  if (profile.action_plan?.length) {
    ctx += `### Plan d'action (${profile.action_plan.length} actions)\n`;
    profile.action_plan.slice(0, 8).forEach((a, i) => {
      const title = a.title || a;
      const prio = a.priority ? ` [${a.priority.toUpperCase()}]` : '';
      const desc = a.description ? ` — ${a.description}` : '';
      ctx += `${i+1}. ${title}${prio}${desc}\n`;
    });
  }

  // Problèmes techniques
  const issues = profile.technical_issues || profile.issues || [];
  if (issues.length) {
    ctx += `### Problèmes techniques (${issues.length} détectés)\n`;
    issues.slice(0, 8).forEach(i => {
      const sev = i.severity ? ` [${i.severity.toUpperCase()}]` : '';
      ctx += `- ${i.title || i.name || i}${sev}\n`;
    });
  }

  // Données d'audit
  if (profile.audit_data) {
    try {
      const a = typeof profile.audit_data === 'string' ? JSON.parse(profile.audit_data) : profile.audit_data;
      ctx += `### Audit technique\n`;
      ctx += `Score audit: ${a.overall_score}/100`;
      if (a.crawlability_score) ctx += ` | Crawl: ${a.crawlability_score}`;
      if (a.performance_score) ctx += ` | Perf: ${a.performance_score}`;
      ctx += '\n';
      if (a.critical_issues?.length) {
        ctx += `Critiques (${a.critical_issues.length}):\n`;
        a.critical_issues.slice(0, 5).forEach(i => ctx += `  ⚠ ${i.title || i}: ${i.description || ''}\n`);
      }
      if (a.warnings?.length) ctx += `Avertissements: ${a.warnings.slice(0,3).map(w => w.title || w).join(', ')}\n`;
      if (a.broken_links_count) ctx += `Liens cassés: ${a.broken_links_count}\n`;
      if (a.missing_alt_count) ctx += `Images sans alt: ${a.missing_alt_count}\n`;
      if (a.missing_meta_count) ctx += `Meta manquantes: ${a.missing_meta_count}\n`;
    } catch {}
  }

  // Données de performance
  if (profile.perf_data) {
    try {
      const pf = typeof profile.perf_data === 'string' ? JSON.parse(profile.perf_data) : profile.perf_data;
      ctx += `### Performance & Part de voix\n`;
      const sov = pf.share_of_voice?.your_brand;
      if (sov?.voice_share_pct) ctx += `Part de voix IA: **${sov.voice_share_pct}%**${sov.favorable_pct ? ` (${sov.favorable_pct}% favorable)` : ''}\n`;
      if (pf.lrs_trend) ctx += `Tendance LRS: ${pf.lrs_trend}\n`;
      if (pf.ai_mentions_count) ctx += `Mentions IA/mois: ~${pf.ai_mentions_count}\n`;
      if (pf.competitors?.length) {
        ctx += `Concurrents:\n`;
        pf.competitors.slice(0, 4).forEach(c => {
          ctx += `  - ${c.name || c.domain}${c.score ? ` (score: ${c.score})` : ''}${c.voice_share_pct ? ` (voix: ${c.voice_share_pct}%)` : ''}\n`;
        });
      }
    } catch {}
  }

  // Concurrents directs
  if (profile.competitors?.length && !profile.perf_data) {
    ctx += `### Concurrents\n`;
    profile.competitors.slice(0, 4).forEach(c => {
      ctx += `- ${c.name || c.domain || c}${c.score ? ` (${c.score}/100)` : ''}\n`;
    });
  }

  if (profile.last_scan) ctx += `\n*Dernier scan: ${new Date(profile.last_scan).toLocaleDateString('fr-FR')}*\n`;

  return ctx;
}

// ── Main ───────────────────────────────────────────────────────────
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

  // Read active conv from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const convId = params.get('conv');
    if (convId) {
      const c = loadConvs().find(cv => cv.id === convId);
      if (c) { setMessages(c.messages || []); setActiveConvId(c.id); }
    } else {
      setMessages([]); setActiveConvId(null);
    }
  }, [window.location.search]);

  useEffect(() => {
    const domain = getActiveDomain();
    setActiveDomainState(domain);
    if (!domain?.url || !user?.id) return;
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
    setLoadingLabel('Analyse en cours…');

    try {
      const history = messages.slice(-8).map(m => `${m.role === 'user' ? 'USER' : 'WOK_AI'}: ${m.content}`).join('\n');
      const ctx = buildContext(user, profile, activeDomain);
      let prompt = ctx;
      if (history) prompt += `\n---\nHISTORIQUE RÉCENT :\n${history}\n---\n`;
      prompt += `\nUSER: ${content}\nWOK_AI:`;
      const fileUrls = allAttachments.map(f => f.url).filter(Boolean);

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
      });
      const aiContent = typeof res === 'string' ? res : (res?.data ?? res?.response ?? res?.text ?? res?.content ?? JSON.stringify(res) ?? 'Erreur de réponse.');
      if (!aiContent || aiContent === 'null' || aiContent === '{}') throw new Error('empty_response');
      const aiMsg = { role: 'assistant', content: aiContent, ts: Date.now() };
      const final = [...nextMessages, aiMsg];
      setMessages(final);

      const currentConvs = loadConvs();
      if (activeConvId) {
        const updated = currentConvs.map(c => c.id === activeConvId ? { ...c, messages: final, updatedAt: Date.now() } : c);
        persist(updated);
      } else {
        const titleRes = await base44.integrations.Core.InvokeLLM({ prompt: `Titre court 3-5 mots français sans ponctuation pour cette question: "${content.slice(0,100)}". Retourne UNIQUEMENT le titre.` }).catch(() => null);
        const titleRaw = typeof titleRes === 'string' ? titleRes : (titleRes?.data || titleRes?.response || content);
        const title = String(titleRaw).replace(/["']/g, '').trim().slice(0, 48) || content.slice(0, 40);
        const nc = { id: `c_${Date.now()}`, title, messages: final, createdAt: Date.now(), updatedAt: Date.now() };
        setActiveConvId(nc.id);
        persist([nc, ...currentConvs]);
        window.history.replaceState({}, '', `/wok-ai?conv=${nc.id}`);
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Je n\'ai pas pu répondre. Vérifie ta connexion et réessaie.', ts: Date.now() }]);
    } finally { setLoading(false); setLoadingLabel(''); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleFileSelect = (e) => {
    setFiles(f => [...f, ...Array.from(e.target.files || []).slice(0, 3 - f.length)]);
    e.target.value = '';
  };

  const allFiles = [...files.map(f => ({ name: f.name, isLocal: true })), ...driveFiles.map(f => ({ name: f.name, isDrive: true }))];

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: F, background: WHITE, flexDirection: 'column' }}>

      {/* ── Header bar ── */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, background: WHITE }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={13} color={WHITE} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>
            {activeConv?.title || 'WOK AI'}
          </span>
          {domainLabel && <span style={{ fontSize: 11, color: INK3, marginLeft: 8 }}>{domainLabel}</span>}
        </div>
        {activeConvId && (
          <button onClick={() => { setMessages([]); setActiveConvId(null); window.history.replaceState({}, '', '/wok-ai'); }}
            style={{ padding: '5px 11px', border: `1px solid ${BORDER}`, borderRadius: 7, background: WHITE, fontSize: 11.5, fontWeight: 500, color: INK2, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
            onMouseLeave={e => e.currentTarget.style.background = WHITE}>
            <Plus size={10} /> Nouvelle
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 8px' }}>
        {messages.length === 0 ? (
          <EmptyState onSuggest={s => sendMessage(s)} domain={domainLabel} profile={profile} />
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

      {/* ── Files chips ── */}
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

      {/* ── Input bar ── */}
      <div style={{ padding: '8px 16px 14px', background: WHITE, borderTop: allFiles.length > 0 ? 'none' : `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '10px 12px' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Pose ta question…" rows={1}
            style={{ width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: INK, fontFamily: F, resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', boxSizing: 'border-box' }} />
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
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.10)', overflow: 'hidden', minWidth: 200, zIndex: 100 }}>
                      {[
                        { label: 'Joindre des fichiers', icon: <Paperclip size={13} color={INK2} />, action: () => { fileInputRef.current?.click(); setShowPlus(false); } },
                        { label: 'Google Drive', icon: <FileText size={13} color={INK2} />, action: () => { setShowDrive(true); setShowPlus(false); } },
                      ].map((item, i) => (
                        <button key={i} onClick={item.action}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: INK, fontFamily: F, textAlign: 'left', borderBottom: i === 0 ? `1px solid ${BORDER}` : 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = SURFACE}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {item.icon} {item.label}
                        </button>
                      ))}
                    </motion.div>
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

      <DrivePickerModal open={showDrive} onClose={() => setShowDrive(false)} onImport={picked => setDriveFiles(prev => [...prev, ...picked])} />
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handleFileSelect} />

      <style>{`
        @keyframes wokdot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}
        .wok-prose p{margin:0 0 8px;font-size:13.5px;line-height:1.65;color:#111110}
        .wok-prose p:last-child{margin:0}
        .wok-prose ul,.wok-prose ol{margin:6px 0;padding-left:20px}
        .wok-prose li{font-size:13px;line-height:1.6;margin-bottom:4px;color:#111110}
        .wok-prose strong{font-weight:700;color:#111110}
        .wok-prose h1,.wok-prose h2,.wok-prose h3{font-size:14px;font-weight:700;margin:12px 0 6px;color:#111110}
        .wok-prose h1:first-child,.wok-prose h2:first-child,.wok-prose h3:first-child{margin-top:0}
        .wok-prose code{font-size:12px;background:#F0F0EE;padding:1px 5px;border-radius:3px}
        .wok-prose blockquote{border-left:3px solid #E5E5E5;padding-left:12px;color:#666;margin:8px 0}
      `}</style>
    </div>
  );
}