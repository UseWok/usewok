import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Paperclip, Sparkles, FileText, ArrowUp, Zap, AlertTriangle, TrendingUp, Target, RefreshCw, ArrowRight, Mic, Clock, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getActiveDomain } from '@/lib/active-domain';
import { useAuth } from '@/lib/AuthContext';
import ReactMarkdown from 'react-markdown';
import { getProfileData } from '@/lib/profile-storage';
import { checkChatQuota } from '@/lib/quota-enforcement';
import { useNavigate, useLocation } from 'react-router-dom';
import { ModeSelector, ModeDropdown } from '@/components/home/ModeSelector';

const F = '"Anthropic Sans","Anthropic Sans Variable",Inter,system-ui,sans-serif';
const INK = '#111110';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const SURFACE = '#EEE5D2';
const WHITE = '#FFFFFF';
const BG = '#F5F0E8';
const CORAL = '#FF5A1F';

// ── Typing dots ────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: WHITE, borderRadius: 18, border: `1px solid ${BORDER}`, width: 'fit-content' }}>
      <div style={{ display: 'flex', gap: 3 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: INK3, animation: `wokdot 1.1s ease-in-out ${i * 0.18}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

// ── AI content renderer — detects plan link ────────────────────────
function AIContent({ content, onPlanLink }) {
  // Detect if response contains an "action plan" reference → render link
  const hasPlanRef = /action\s+plan|full\s+report|see\s+the\s+plan|detailed\s+plan/i.test(content);

  // Strip the markdown plan-link marker if present, render rest
  const cleanContent = content.replace(/\[PLAN_LINK\]/gi, '').trim();

  return (
    <div>
      <div className="wok-prose">
        <ReactMarkdown>{cleanContent}</ReactMarkdown>
      </div>
      {hasPlanRef && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
          <button onClick={onPlanLink}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: F }}>
            <ArrowRight size={13} color={CORAL} strokeWidth={2} />
            <span style={{ fontSize: 13, fontWeight: 500, color: CORAL }}>View the detailed action plan</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Message bubble ─────────────────────────────────────────────────
function MessageBubble({ msg, onPlanLink }) {
  const isUser = msg.role === 'user';
  const time = new Date(msg.ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 20 }}>
        <div style={{
          padding: '10px 16px',
          background: INK,
          borderRadius: '20px 20px 4px 20px',
          fontSize: 13.5, lineHeight: 1.6, color: WHITE,
          maxWidth: '75%', fontFamily: F,
        }}>
          <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
        </div>
        <span style={{ fontSize: 10, color: INK3, marginTop: 4 }}>{time}</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 24 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
        <Sparkles size={12} color={CORAL} fill={CORAL} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {msg.files?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 6 }}>
            {msg.files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11, color: INK2 }}>
                <FileText size={9} color={INK3} />
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{
          padding: '12px 16px',
          background: WHITE,
          border: `1px solid ${BORDER}`,
          borderRadius: '4px 18px 18px 18px',
          fontSize: 13.5, lineHeight: 1.65, color: INK,
          maxWidth: '85%',
        }}>
          {msg.isError ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: INK2 }}>
              <RefreshCw size={12} color={INK3} />
              <span style={{ fontSize: 13.5 }}>{msg.content}</span>
            </div>
          ) : (
            <AIContent content={msg.content} onPlanLink={onPlanLink} />
          )}
        </div>
        <span style={{ fontSize: 10, color: INK3, marginTop: 4, display: 'block' }}>{time}</span>
      </div>
    </div>
  );
}

// ── Smart suggestions ──────────────────────────────────────────────
function getSmartSuggestions(profile, domainLabel, actionTasks) {
  let nextPendingTask = null;
  let doneCount = 0;
  const tasks = actionTasks || [];
  doneCount = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.find(t => !t.status || t.status === 'todo');
  if (pending) nextPendingTask = pending.action_title;
  // suppress lint
  void nextPendingTask;

  if (!profile) return [
    { icon: Zap, text: 'Run a scan to analyze my site' },
    { icon: Target, text: 'How can I improve my AI visibility?' },
    { icon: AlertTriangle, text: 'What are the key criteria for ChatGPT?' },
    { icon: TrendingUp, text: 'How do I optimize my content for LLMs?' },
  ];

  const score = profile.score_overall || profile.lrs_score || 0;
  const critiques = (() => { try { const a = typeof profile.audit_data === 'string' ? JSON.parse(profile.audit_data) : profile.audit_data; return a?.critical_issues?.[0]?.title || null; } catch { return null; } })();
  const topCompetitor = profile.competitors?.[0]?.name || profile.competitors?.[0]?.domain || null;

  return [
    { icon: Zap, text: nextPendingTask ? `I've completed ${doneCount} task${doneCount > 1 ? 's' : ''} — what should I do next?` : score > 0 ? `My score is ${score}/100 — how can I improve it quickly?` : 'What are my optimization priorities?' },
    { icon: AlertTriangle, text: critiques ? `How do I fix "${critiques.slice(0, 40)}"?` : 'What technical issues are blocking my AI visibility?' },
    { icon: TrendingUp, text: topCompetitor ? `Why is ${topCompetitor} outranking me on AI engines?` : 'How can I improve my AI share of voice vs competitors?' },
    { icon: Target, text: nextPendingTask ? `Explain how to do: "${nextPendingTask.slice(0, 45)}"` : 'Give me a concrete action plan for this week' },
  ];
}

function EmptyState({ onSuggest, domain, profile, actionTasks }) {
  const suggestions = getSmartSuggestions(profile, domain, actionTasks);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', maxWidth: 600, margin: '0 auto', width: '100%' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Sparkles size={24} color={CORAL} fill={CORAL} />
      </div>
      <p style={{ fontSize: 20, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.03em', fontFamily: F }}>WOK AI</p>
      <p style={{ fontSize: 13, color: INK3, margin: '0 0 32px', lineHeight: 1.6, textAlign: 'center', fontFamily: F }}>
        {domain ? `Data for ${domain} is ready. Ask your question.` : 'Run a scan from the home page to get answers based on your real data.'}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
        {suggestions.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={i} onClick={() => onSuggest(s.text)}
              style={{ padding: '14px 16px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, fontSize: 13, color: INK, cursor: 'pointer', textAlign: 'left', fontFamily: F, lineHeight: 1.5, transition: 'background 80ms', display: 'flex', flexDirection: 'column', gap: 10, fontWeight: 500 }}
              onMouseEnter={e => e.currentTarget.style.background = SURFACE}
              onMouseLeave={e => e.currentTarget.style.background = WHITE}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} color={INK2} strokeWidth={1.8} />
              </div>
              <span>{s.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Mic Button ────────────────────────────────────────────────────
function MicButton({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef(null);
  const animRef = useRef(null);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);

  const stopAll = () => {
    recognitionRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(animRef.current);
    setListening(false);
    setVolume(0);
  };

  const startListening = async () => {
    if (listening) { stopAll(); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        setVolume(data.reduce((a, b) => a + b, 0) / data.length);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    rec.onresult = (e) => { onTranscript(e.results[0][0].transcript); stopAll(); };
    rec.onerror = () => stopAll();
    rec.onend = () => stopAll();
    setListening(true);
    rec.start();
  };

  const bars = 5;
  return (
    <button onClick={startListening}
      style={{ width: 32, height: 32, border: 'none', background: listening ? `rgba(255,90,31,0.10)` : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexShrink: 0, outline: 'none' }}
      onMouseEnter={e => { if (!listening) e.currentTarget.style.background = SURFACE; }}
      onMouseLeave={e => { if (!listening) e.currentTarget.style.background = 'transparent'; }}>
      {listening ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 16 }}>
          {Array.from({ length: bars }).map((_, i) => {
            const h = Math.max(3, Math.min(14, (volume / 30) * 14 + Math.sin(Date.now() / 150 + i) * 4));
            return <div key={i} style={{ width: 2.5, borderRadius: 2, background: CORAL, height: `${h}px`, transition: 'height 80ms ease' }} />;
          })}
        </div>
      ) : (
        <Mic size={14} color={INK2} strokeWidth={1.7} />
      )}
    </button>
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
      setError('Google Drive connection required. Connect it in Connections.');
      setLoading(false);
    });
  }, [open]);

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 14, width: '100%', maxWidth: 460, maxHeight: '70vh', display: 'flex', flexDirection: 'column', fontFamily: F }}>
        <div style={{ padding: '16px 18px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Google Drive</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3 }}><X size={14} /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {loading && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>Loading…</p>}
          {error && <p style={{ fontSize: 13, color: '#EF4444', padding: '12px 6px', lineHeight: 1.5 }}>{error}</p>}
          {!loading && !error && files.length === 0 && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>No files found</p>}
          {files.map(f => (
            <div key={f.id} onClick={() => toggle(f.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, cursor: 'pointer', background: selected.includes(f.id) ? SURFACE : 'transparent', marginBottom: 2 }}
              onMouseEnter={e => { if (!selected.includes(f.id)) e.currentTarget.style.background = SURFACE; }}
              onMouseLeave={e => { if (!selected.includes(f.id)) e.currentTarget.style.background = 'transparent'; }}>
              <div style={{ width: 18, height: 18, border: `2px solid ${selected.includes(f.id) ? INK : BORDER}`, borderRadius: 4, background: selected.includes(f.id) ? INK : WHITE, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              Import {selected.length ? `${selected.length} file${selected.length > 1 ? 's' : ''}` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Cloud storage helpers ──────────────────────────────────────────
async function loadCloudConvs() {
  try {
    const recs = await base44.entities.Conversation.list('-updated_at', 50);
    return recs.map(r => {
      let messages = [];
      try { messages = JSON.parse(r.messages_json || '[]'); } catch {}
      return { id: r.id, title: r.title || 'Untitled', messages, site_url: r.site_url, updatedAt: r.updated_at || new Date(r.updated_date).getTime() };
    });
  } catch { return []; }
}

async function saveCloudConv(conv) {
  const payload = { title: conv.title, site_url: conv.site_url || '', messages_json: JSON.stringify(conv.messages), updated_at: Date.now() };
  if (conv._dbId) {
    await base44.entities.Conversation.update(conv._dbId, payload);
    return conv._dbId;
  } else {
    const created = await base44.entities.Conversation.create(payload);
    return created.id;
  }
}

// ── Context builder ────────────────────────────────────────────────
function buildContext(user, profile, activeDomain) {
  const name = user?.full_name || user?.email?.split('@')[0] || 'user';
  const url = activeDomain?.url || profile?.site_url || '';

  let ctx = `You are WOK AI, the AI assistant for ${name}.\n\n`;
  ctx += `## STRICT RULES\n`;
  ctx += `1. Respond in English, short and direct. 3-5 sentences max unless a full plan is requested.\n`;
  ctx += `2. NEVER use tables. NEVER use intros or conclusions. Get straight to the point.\n`;
  ctx += `3. If the user asks for an action: 2-3 concrete numbered steps max.\n`;
  ctx += `4. Cite exact numbers if available below.\n`;
  ctx += `5. Start directly with the answer.\n`;
  ctx += `6. IMPORTANT: When you mention the action plan or recommend viewing it, make sure your response contains the words "action plan" or "detailed plan" — this will automatically display a link for the user.\n\n`;
  ctx += `## DATA — ${name} (${url})\n`;

  if (!profile) {
    ctx += `No site data available. If the user asks for site info → tell them to click "Analyze" on the home page.\n`;
    return ctx;
  }

  const score = profile.score_overall || profile.lrs_score;
  if (score) ctx += `Overall score: ${score}/100\n`;
  if (profile.score_ai_visibility) ctx += `AI visibility: ${profile.score_ai_visibility}/100\n`;
  if (profile.score_message_clarity) ctx += `Message clarity: ${profile.score_message_clarity}/100\n`;
  if (profile.score_commercial_signal) ctx += `Commercial signal: ${profile.score_commercial_signal}/100\n`;

  const engines = ['chatgpt', 'gemini', 'claude', 'perplexity', 'mistral', 'grok'];
  const engScores = engines.filter(k => profile[`${k}_score`] != null).map(k => `${k}: ${profile[`${k}_score`]}`);
  if (engScores.length) ctx += `AI engines: ${engScores.join(' | ')}\n`;

  if (profile.identity_name) ctx += `Business: ${profile.identity_name}${profile.identity_industry ? ` (${profile.identity_industry})` : ''}\n`;
  if (profile.shock_insight) ctx += `Insight: "${profile.shock_insight}"\n`;

  if (profile.action_plan?.length) {
    ctx += `Action plan (${profile.action_plan.length} actions):\n`;
    profile.action_plan.slice(0, 6).forEach((a, i) => ctx += `${i+1}. ${a.title || a}\n`);
  }

  const issues = profile.technical_issues || profile.issues || [];
  if (issues.length) ctx += `Issues (${issues.length}): ${issues.slice(0,4).map(i => i.title || i.name || i).join(', ')}\n`;

  if (profile.last_scan) ctx += `Last scan: ${new Date(profile.last_scan).toLocaleDateString('en-US')}\n`;

  // ── Brand Knowledge — user-curated context (highest priority) ──
  const bk = profile.brand_knowledge;
  if (bk && typeof bk === 'object') {
    ctx += `\n## BRAND KNOWLEDGE (user-provided, authoritative — always prioritize this)\n`;
    if (bk.industry) ctx += `Industry: ${bk.industry}\n`;
    if (bk.headquarters) ctx += `Headquarters: ${bk.headquarters}\n`;
    if (bk.audience) ctx += `Target audience: ${bk.audience}\n`;
    if (bk.business_model) ctx += `Business model: ${bk.business_model}\n`;
    if (bk.target_segment) ctx += `Geographic focus: ${bk.target_segment}\n`;
    if (bk.value_description) ctx += `Value proposition: ${bk.value_description}\n`;
    if (bk.value_keywords?.length) ctx += `Differentiators: ${bk.value_keywords.join(', ')}\n`;
    if (bk.use_cases?.length) ctx += `Use cases / sales plays: ${bk.use_cases.join(' | ')}\n`;
    if (bk.authority_topics?.length) ctx += `Authority topics: ${bk.authority_topics.join(', ')}\n`;
    if (bk.pre_purchase_questions?.length) ctx += `Pre-purchase questions: ${bk.pre_purchase_questions.join(' | ')}\n`;
    if (bk.objections?.length) ctx += `Prospect objections: ${bk.objections.join(' | ')}\n`;
    if (bk.avoid_topics?.length) ctx += `Topics to AVOID mentioning: ${bk.avoid_topics.join(', ')}\n`;
    if (bk.scope) ctx += `Brand scope: ${bk.scope}\n`;
    if (bk.wikipedia_url) ctx += `Wikipedia: ${bk.wikipedia_url}\n`;
    if (bk.crunchbase_url) ctx += `Crunchbase: ${bk.crunchbase_url}\n`;
    if (bk.other_sources?.length) ctx += `Other notoriety sources: ${bk.other_sources.join(', ')}\n`;
    if (bk.priority_countries?.length) ctx += `Priority countries: ${bk.priority_countries.join(', ')}\n`;
    if (bk.languages?.length) ctx += `Answer languages: ${bk.languages.join(', ')}\n`;
  }

  // ── GEO Strategy — user-curated GEO plan (highest priority) ──
  const gs = profile.geo_strategy;
  if (gs && typeof gs === 'object') {
    ctx += `\n## GEO STRATEGY (user-provided, authoritative — align every recommendation to this)\n`;
    if (gs.positioning_target) ctx += `Positioning target: ${gs.positioning_target}\n`;
    if (gs.positioning_note) ctx += `Positioning angle: ${gs.positioning_note}\n`;
    if (gs.target_queries?.length) ctx += `Target queries: ${gs.target_queries.join(' | ')}\n`;
    if (gs.query_intents?.length) ctx += `Query intents: ${gs.query_intents.join(', ')}\n`;
    if (gs.query_philosophy) ctx += `Query philosophy / editorial directives: ${gs.query_philosophy}\n`;
    if (gs.known_sources?.length) ctx += `Target authority sources: ${gs.known_sources.join(', ')}\n`;
    if (gs.authority_sources?.length) ctx += `Other target sources: ${gs.authority_sources.join(', ')}\n`;
    if (gs.content_pillars?.length) ctx += `Content pillars: ${gs.content_pillars.join(', ')}\n`;
    if (gs.priority_competitors?.length) ctx += `Priority competitors to beat: ${gs.priority_competitors.join(', ')}\n`;
  }

  return ctx;
}

// ── Easter egg fake demo messages ─────────────────────────────────
const DEMO_MESSAGES = [
  { role: 'user', content: 'hello', ts: Date.now() - 90000 },
  { role: 'assistant', content: 'Hi! Ready to analyze your AI visibility. Ask your question.', ts: Date.now() - 88000 },
  { role: 'user', content: 'My score is 97/100 — how can I improve it further?', ts: Date.now() - 60000 },
  { role: 'assistant', content: 'Great score. The remaining 3 points come mostly from citation frequency on Perplexity and Copilot.', ts: Date.now() - 58000, hasPlanLink: true },
];

// ── Main ───────────────────────────────────────────────────────────
export default function WokAIPage({ user: userProp }) {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const user = userProp || authUser;
  const [convs, setConvs] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeDbId, setActiveDbId] = useState(null); // DB record id (may differ from logical id)
  const [messages, setMessages] = useState([]);
  const [convLoading, setConvLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const [showPlus, setShowPlus] = useState(false);
  const [showDrive, setShowDrive] = useState(false);
  const [mode, setMode] = useState('chat');
  const [showModes, setShowModes] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  const [sendingTest, setSendingTest] = useState(false);
  const [actionTasks, setActionTasks] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (location.state?.autoSend) {
      const msg = location.state.autoSend;
      navigate(location.pathname, { replace: true, state: {} });
      setInput(msg);
      setTimeout(() => sendMessage(msg), 50);
    }
  }, [location.state]);

  const domainLabel = activeDomain?.url?.replace(/https?:\/\//, '').split('/')[0] || '';

  // Load conversations from cloud on mount
  useEffect(() => {
    if (!user?.id) return;
    setConvLoading(true);
    loadCloudConvs().then(loaded => {
      setConvs(loaded);
      const params = new URLSearchParams(window.location.search);
      const convId = params.get('conv');
      if (convId) {
        const c = loaded.find(cv => cv.id === convId);
        if (c) { setMessages(c.messages || []); setActiveConvId(c.id); setActiveDbId(c.id); }
      }
      setConvLoading(false);
    });
  }, [user?.id]);

  useEffect(() => {
    const domain = getActiveDomain();
    setActiveDomainState(domain);
    if (!domain?.url || !user?.id) return;
    base44.entities.BusinessProfile.filter({ site_url: domain.url }).then(async results => {
      const mine = results.find(r => r.created_by_id === user?.id) || results[0];
      if (mine) {
        const extra = await getProfileData(mine);
        setProfile({ ...mine, ...extra });
      }
    }).catch(() => {});
  }, [user?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Load action tasks from cloud (ActionTask entity)
  useEffect(() => {
    if (!user?.id) return;
    base44.entities.ActionTask.filter({ user_id: user.id }).then(tasks => {
      setActionTasks(tasks || []);
    }).catch(() => {});
  }, [user?.id]);

  const activeConv = convs.find(c => c.id === activeConvId);

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content && files.length === 0 && driveFiles.length === 0) return;

    // ── HARD QUOTA: chatbot message limit per month ──
    const chatQuota = await checkChatQuota(user);
    if (!chatQuota.allowed) {
      setMessages(m => [...m, { role: 'user', content, ts: Date.now() }, {
        role: 'assistant',
        content: `⛔ **Message quota reached** (${chatQuota.used}/${chatQuota.limit} this month).\n\nYour subscription limits the number of WOK AI messages. Upgrade to a higher plan to continue.`,
        ts: Date.now() + 1, isError: true,
      }]);
      setInput('');
      return;
    }

    if (mode === 'scan') {
        navigate('/app', { state: { autoScan: content } });
        return;
    }

    setInput('');

    // Easter egg
    if (content.toLowerCase().replace(/\s/g,'') === 'antoinevalton') {
      setMessages(DEMO_MESSAGES);
      return;
    }

    // Dev email test — envoie les 3 mails de la séquence, sans aucun appel IA
    if (content.trim().toLowerCase() === 'aaaaa') {
      setInput('');
      const u = await base44.auth.me().catch(() => null);
      const email = u?.email;
      if (!email) {
        setMessages(m => [...m, { role: 'user', content, ts: Date.now() }, { role: 'assistant', content: '❌ Email not found — please log in first.', ts: Date.now() + 1, isError: true }]);
        return;
      }
      const firstName = u?.full_name?.split(' ')[0] || '';
      const siteUrl = profile?.site_url || '';
      const score = profile?.score_overall || 42;
      const criticalErrors = 3;
      const issues = [{ problem: 'No Organization schema detected on your homepage', urgency: 'high' }];

      setSendingTest(true);
      try {
        await Promise.all([
          base44.functions.invoke('brevoEmailSystem', { action: 'sendEmail', email, firstName, siteUrl, data: { emailType: 'post_scan', score, criticalErrors, issues, scanDate: new Date().toISOString() } }),
          base44.functions.invoke('brevoEmailSystem', { action: 'sendEmail', email, firstName, siteUrl, data: { emailType: 'no_scan_j3', score, criticalErrors, issues } }),
          base44.functions.invoke('brevoEmailSystem', { action: 'sendEmail', email, firstName, siteUrl, data: { emailType: 'final_offer', score, criticalErrors, issues } }),
        ]);
        setMessages(m => [...m, { role: 'user', content, ts: Date.now() }, { role: 'assistant', content: `✅ 3 emails sent to **${email}**:\n- Email 1: Scan results\n- Email 2: Why AI engines ignore you\n- Email 3: Your competitors are capturing these customers`, ts: Date.now() + 1 }]);
      } catch (e) {
        setMessages(m => [...m, { role: 'user', content, ts: Date.now() }, { role: 'assistant', content: `❌ Error: ${e.message}`, ts: Date.now() + 1, isError: true }]);
      } finally { setSendingTest(false); }
      return;
    }

    let uploadedFiles = [];
    if (files.length > 0) {
      setLoading(true);
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

    try {
      const history = messages.slice(-4).map(m => `${m.role === 'user' ? 'USER' : 'WOK_AI'}: ${m.content}`).join('\n');
      const ctx = buildContext(user, profile, activeDomain);
      let prompt = ctx;
      if (history) prompt += `\n---\nHISTORIQUE:\n${history}\n---\n`;
      prompt += `\nUSER: ${content}\nWOK_AI:`;
      const fileUrls = allAttachments.map(f => f.url).filter(Boolean);

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5_mini',
        ...(fileUrls.length > 0 ? { file_urls: fileUrls } : {}),
      });
      const aiContent = typeof res === 'string' ? res : (res?.data ?? res?.response ?? res?.text ?? res?.content ?? JSON.stringify(res) ?? '');
      if (!aiContent || aiContent === 'null' || aiContent === '{}') throw new Error('empty_response');

      const aiMsg = { role: 'assistant', content: aiContent, ts: Date.now() };
      const final = [...nextMessages, aiMsg];
      setMessages(final);

      if (activeDbId) {
        // Update existing cloud conversation
        await base44.entities.Conversation.update(activeDbId, { messages_json: JSON.stringify(final), updated_at: Date.now() });
        setConvs(prev => prev.map(c => c.id === activeDbId ? { ...c, messages: final, updatedAt: Date.now() } : c));
      } else {
        // Create conversation instantly with a provisional title (no blocking LLM call)
        const provisionalTitle = content.slice(0, 40).trim() || 'New conversation';
        const created = await base44.entities.Conversation.create({ title: provisionalTitle, site_url: activeDomain?.url || '', messages_json: JSON.stringify(final), updated_at: Date.now() });
        const newConv = { id: created.id, title: provisionalTitle, messages: final, site_url: activeDomain?.url || '', updatedAt: Date.now() };
        setActiveConvId(created.id);
        setActiveDbId(created.id);
        setConvs(prev => [newConv, ...prev]);
        window.history.replaceState({}, '', `/wok-ai?conv=${created.id}`);
        // Generate a clean title in the background (fire-and-forget, default cheap model)
        base44.integrations.Core.InvokeLLM({ prompt: `Short 3-5 word English title with no punctuation for: "${content.slice(0,100)}". ONLY the title.` })
          .then(titleRes => {
            const titleRaw = typeof titleRes === 'string' ? titleRes : (titleRes?.data || titleRes?.response || '');
            const title = String(titleRaw).replace(/["']/g, '').trim().slice(0, 48);
            if (!title) return;
            base44.entities.Conversation.update(created.id, { title }).catch(() => {});
            setConvs(prev => prev.map(c => c.id === created.id ? { ...c, title } : c));
          }).catch(() => {});
      }
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "I couldn't respond — check your connection and try again.", ts: Date.now(), isError: true }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleFileSelect = (e) => { setFiles(f => [...f, ...Array.from(e.target.files || []).slice(0, 3 - f.length)]); e.target.value = ''; };
  const allFiles = [...files.map(f => ({ name: f.name, isLocal: true })), ...driveFiles.map(f => ({ name: f.name, isDrive: true }))];
  const canSend = !loading && (input.trim().length > 0 || allFiles.length > 0);

  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: F, background: BG, flexDirection: 'column', position: 'relative' }}>

      {/* ── Panneau historique ── */}
      <AnimatePresence>
        {showHistory && (
          <>
            <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.15)' }} onClick={() => setShowHistory(false)} />
            <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} transition={{ duration: 0.2 }}
              style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, background: WHITE, borderRight: `1px solid ${BORDER}`, zIndex: 50, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>Recent conversations</span>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3, padding: 2 }}><X size={14} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
                {/* Bouton Nouvelle conversation */}
                <button onClick={() => { setMessages([]); setActiveConvId(null); setActiveDbId(null); window.history.replaceState({}, '', '/wok-ai'); setShowHistory(false); }}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', background: SURFACE, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12.5, color: INK, fontFamily: F, marginBottom: 6, fontWeight: 600 }}>
                  <Plus size={12} color={INK} /> New conversation
                  </button>
                  {convLoading && <p style={{ fontSize: 12, color: INK3, textAlign: 'center', padding: '16px 0' }}>Loading…</p>}
                  {!convLoading && convs.length === 0 && (
                   <p style={{ fontSize: 12, color: INK3, textAlign: 'center', padding: '24px 0' }}>No conversations</p>
                )}
                {convs.sort((a, b) => b.updatedAt - a.updatedAt).map(conv => (
                  <button key={conv.id} onClick={() => {
                    setMessages(conv.messages || []);
                    setActiveConvId(conv.id);
                    setActiveDbId(conv.id);
                    window.history.replaceState({}, '', `/wok-ai?conv=${conv.id}`);
                    setShowHistory(false);
                  }}
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '9px 10px', background: activeConvId === conv.id ? SURFACE : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 2, textAlign: 'left', fontFamily: F }}
                    onMouseEnter={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = SURFACE; }}
                    onMouseLeave={e => { if (activeConvId !== conv.id) e.currentTarget.style.background = 'transparent'; }}>
                    <span style={{ fontSize: 12.5, color: INK, fontWeight: activeConvId === conv.id ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{conv.title || 'Untitled'}</span>
                    <span style={{ fontSize: 10, color: INK3, marginTop: 2 }}>{new Date(conv.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Overlay envoi test emails ── */}
      {sendingTest && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(10,10,11,0.75)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, fontFamily: F }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#FF5A1F', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Sending 3 emails…</p>
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>Email 1 · Email 2 · Email 3</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={() => setShowHistory(v => !v)}
          style={{ width: 28, height: 28, borderRadius: 8, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: 'pointer' }}
          title="Conversation history">
          <Sparkles size={13} color={CORAL} fill={CORAL} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>{activeConv?.title || 'WOK AI'}</span>
          {domainLabel && <span style={{ fontSize: 11, color: INK3, marginLeft: 8 }}>{domainLabel}</span>}
        </div>
        <button onClick={() => setShowHistory(v => !v)}
          style={{ padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, background: 'transparent', fontSize: 11.5, fontWeight: 500, color: INK2, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 5 }}
          onMouseEnter={e => e.currentTarget.style.background = SURFACE}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <Clock size={10} /> History {convs.length > 0 && <span style={{ fontSize: 10, background: INK, color: '#fff', borderRadius: 10, padding: '1px 5px' }}>{convs.length}</span>}
        </button>
        {activeConvId && (
          <button onClick={() => { setMessages([]); setActiveConvId(null); setActiveDbId(null); window.history.replaceState({}, '', '/wok-ai'); }}
            style={{ padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, background: 'transparent', fontSize: 11.5, fontWeight: 500, color: INK2, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <Plus size={10} /> New
          </button>
        )}
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 8px' }}>
        {messages.length === 0 ? (
          <EmptyState onSuggest={s => setInput(s)} domain={domainLabel} profile={profile} actionTasks={actionTasks} />
        ) : (
          <>
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m}
                onPlanLink={() => navigate('/ai-report')} />
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={12} color={CORAL} fill={CORAL} />
                </div>
                <TypingDots />
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
            style={{ padding: '8px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allFiles.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11, color: INK2 }}>
                <FileText size={9} color={INK3} />
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

      {/* ── Input bar — flat, no shadow ── */}
      <div style={{ padding: '8px 16px 16px', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            background: WHITE, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: '9px 9px 9px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'border-color 200ms',
          }}>
            {/* + button — transparent, looks like Home.jsx */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button onClick={() => setShowPlus(v => !v)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, outline: 'none' }}>
                <Plus size={14} color={INK} strokeWidth={1.8} />
              </button>
              <AnimatePresence>
                {showPlus && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowPlus(false)} />
                    <motion.div initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.12 }}
                      style={{ position: 'absolute', bottom: 'calc(100% + 12px)', left: 0, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: 'hidden', minWidth: 200, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      {[
                        { label: 'Attach files', icon: <Paperclip size={13} color={INK2} />, action: () => { fileInputRef.current?.click(); setShowPlus(false); } },
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

            {/* Textarea */}
            <textarea value={input} onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 4 * 1.5 * 13.5) + 'px';
              }} onKeyDown={handleKeyDown}
              placeholder={mode === 'scan' ? 'Search a domain, run an analysis…' : 'Ask a question, get help...'} rows={1}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: INK, fontFamily: F, resize: 'none', lineHeight: 1.5, maxHeight: 120, overflowY: 'auto', boxSizing: 'border-box', padding: 0 }} />

            {/* Mode selector */}
            <ModeSelector mode={mode} onToggle={() => setShowModes(v => !v)} />

            {/* Mic */}
            <MicButton onTranscript={(t) => setInput(prev => prev ? prev + ' ' + t : t)} />

            {/* Send */}
            <button onClick={canSend ? () => sendMessage() : undefined}
              style={{ width: 34, height: 34, borderRadius: '50%', background: CORAL, border: 'none', cursor: canSend ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'none', flexShrink: 0, opacity: canSend ? 1 : 0.6 }}>
              {loading ? <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: WHITE, animation: 'spin 0.7s linear infinite' }} /> : <ArrowUp size={14} color={WHITE} strokeWidth={2.2} />}
            </button>
          </div>

          <AnimatePresence>
            {showModes && (
              <ModeDropdown mode={mode} onSelect={setMode} onClose={() => setShowModes(false)} anchor="top" />
            )}
          </AnimatePresence>
        </div>
      </div>

      <DrivePickerModal open={showDrive} onClose={() => setShowDrive(false)} onImport={picked => setDriveFiles(prev => [...prev, ...picked])} />
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg" style={{ display: 'none' }} onChange={handleFileSelect} />

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes wokdot{0%,80%,100%{transform:scale(0.5);opacity:0.3}40%{transform:scale(1);opacity:1}}
        .wok-prose p{margin:0 0 8px;font-size:13.5px;line-height:1.65;color:#111110;font-family:${F}}
        .wok-prose p:last-child{margin:0}
        .wok-prose ul,.wok-prose ol{margin:6px 0;padding-left:20px}
        .wok-prose li{font-size:13px;line-height:1.6;margin-bottom:4px;color:#111110}
        .wok-prose strong{font-weight:700;color:#111110}
        .wok-prose h1,.wok-prose h2,.wok-prose h3{font-size:14px;font-weight:700;margin:12px 0 6px;color:#111110}
        .wok-prose h1:first-child,.wok-prose h2:first-child,.wok-prose h3:first-child{margin-top:0}
        .wok-prose code{font-size:12px;background:#F0EDE8;padding:1px 5px;border-radius:3px}
        .wok-prose blockquote{border-left:2px solid #E5E0D8;padding-left:12px;color:#666;margin:8px 0}
      `}</style>
    </div>
  );
}