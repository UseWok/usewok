import { useState, useRef, useEffect } from 'react';
import { Plus, Mic, X, FileText, Wifi, Send, Zap, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getUserPlan } from '@/lib/plans-config';
import { useLanguage } from '@/lib/i18n';
import { ALL_MODES as CHAT_ALL_MODES } from '@/lib/modes-config';
import { getStoredQuiz } from '@/components/landing/GuestQuiz';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import DragDropOverlay from '@/components/DragDropOverlay';

const ALL_MODES = CHAT_ALL_MODES;
const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const SKILLS = [
  { id: 'buy', label: 'Can I buy this?', emoji: '🛒' },
  { id: 'track', label: 'Am I on track?', emoji: '📊' },
  { id: 'move', label: "What's my next move?", emoji: '🎯' },
];

const POWER_TOPICS = [
  { label: 'Build Wealth', prompt: "I want to build serious wealth starting now. Give me a concrete 90-day action plan." },
  { label: 'Crush Debt', prompt: "I want to eliminate all my debt as fast as possible. Give me a realistic monthly plan." },
  { label: 'Start Investing', prompt: "I have $500/month to invest. Tell me exactly where to put it." },
  { label: 'Retire Early', prompt: "I want to retire early using the FIRE method. Calculate how much I need to save monthly." },
];

const popAnim = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.1 },
};

export default function HeroSection({ agentId }) {
  const [query, setQuery] = useState(() => localStorage.getItem('stensor_home_draft') || '');
  const [files, setFiles] = useState([]);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [showSkillMenu, setShowSkillMenu] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const finalTranscriptRef = useRef('');
  const [userPlan, setUserPlan] = useState(null);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsTotal, setCreditsTotal] = useState(10);
  const [dailyBlocked, setDailyBlocked] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [hasInternetState, setHasInternetState] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileMenuRef = useRef(null);
  const skillMenuRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const canUpload = userPlan?.file_upload || false;

  useEffect(() => {
    base44.auth.me().then((u) => {
      const plan = getUserPlan(u);
      setUserPlan(plan);
      const used = u?.credits_used || 0;
      const bonus = u?.credits_bonus || 0;
      const total = (plan.credits_limit || 10) + bonus;
      setCreditsUsed(used);
      setCreditsTotal(total);
      if (plan.daily_credits_limit > 0) {
        const todayKey = new Date().toISOString().slice(0, 10);
        const dailyUsed = (() => { try { return JSON.parse(localStorage.getItem('stensor_daily_usage') || '{}')[todayKey] || 0; } catch { return 0; } })();
        if (dailyUsed >= plan.daily_credits_limit) setDailyBlocked(true);
      }
      if (plan.internet_access) setHasInternetState(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target)) setShowFileMenu(false);
      if (skillMenuRef.current && !skillMenuRef.current.contains(e.target)) setShowSkillMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [query]);

  const handleFileSelect = (e) => { setFiles(prev => [...prev, ...Array.from(e.target.files || [])]); setShowFileMenu(false); };
  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const toggleRecording = async () => {
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); setVoiceLoading(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error('Voice input not supported.'); return; }
    finalTranscriptRef.current = '';
    const rec = new SR();
    rec.lang = navigator.language || 'fr-FR';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const finals = Array.from(e.results).filter(r => r.isFinal).map(r => r[0].transcript.trim()).join(' ');
      if (finals) finalTranscriptRef.current = finals;
    };
    rec.onerror = (e) => { if (e.error !== 'aborted') toast.error('Voice error: ' + e.error); setIsRecording(false); setVoiceLoading(false); };
    rec.onend = () => {
      setIsRecording(false); setVoiceLoading(false);
      const raw = finalTranscriptRef.current.trim();
      if (raw) { let text = raw.charAt(0).toUpperCase() + raw.slice(1); if (!'.!?'.includes(text[text.length - 1])) text += '.'; setQuery(text); }
      finalTranscriptRef.current = '';
    };
    try { setIsRecording(true); rec.start(); recognitionRef.current = rec; } catch { toast.error('Could not start microphone.'); setIsRecording(false); }
  };

  const hasInternet = hasInternetState || userPlan?.internet_access || false;
  const hasText = query.trim().length > 0;
  const isBlocked = creditsUsed >= creditsTotal || dailyBlocked;

  const handleSend = () => {
    if (!query.trim() || isBlocked) return;
    localStorage.removeItem('stensor_home_draft');
    const mode = ALL_MODES.find(m => m.id === 'thinking') || ALL_MODES[ALL_MODES.length - 1];
    const skill = selectedSkill ? SKILLS.find(s => s.id === selectedSkill) : null;
    const skillPrefix = skill ? `[Skill: ${skill.label}] ` : '';
    const params = new URLSearchParams({ q: skillPrefix + query, mode: mode.id, webSearch: useWebSearch && hasInternet ? '1' : '0' });
    if (agentId) params.set('agent', agentId);
    navigate(`/chat?${params.toString()}`);
  };

  return (
    <div className="w-full px-8 pt-12 pb-8"
      onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); } }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault(); dragCounterRef.current = 0; setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files || []);
        if (!dropped.length) return;
        if (!canUpload) return;
        setFiles(prev => [...prev, ...dropped]);
      }}
    >
      <DragDropOverlay visible={isDragging} canUpload={canUpload} />
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />

      {/* Label */}
      <div className="mb-6">
        <span className="text-[10px] font-black tracking-[0.2em] uppercase px-2 py-1" style={{ background: YUZU, color: FG }}>
          AI Financial Coach
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight" style={{ color: FG }}>
        Build your financial freedom.
      </h1>
      <p className="text-sm mb-8" style={{ color: 'rgba(0,0,0,0.38)' }}>
        Ask anything. Get expert-grade answers, instantly.
      </p>

      {/* ── Input card — style image 1 ── */}
      <div style={{
        maxWidth: 640, background: '#FFFFFF',
        border: '1.5px solid rgba(0,0,0,0.09)',
        borderRadius: 16, overflow: 'visible',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        {/* File chips */}
        {files.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '12px 16px 0' }}>
            {files.map((file, idx) => (
              <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 6, fontSize: 11, color: '#555' }}>
                <FileText style={{ width: 11, height: 11 }} />
                <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#aaa' }}>
                  <X style={{ width: 9, height: 9 }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <div style={{ padding: '16px 18px 8px' }}>
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); localStorage.setItem('stensor_home_draft', e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isBlocked) handleSend(); } }}
            placeholder={isBlocked ? 'Limit reached — upgrade to continue' : 'Essayez tâches, flux ou jobs récurrents — tapez @ pour ajouter fichiers ou skills'}
            disabled={isBlocked}
            rows={2}
            style={{
              width: '100%', resize: 'none', background: 'transparent', outline: 'none', border: 'none',
              fontSize: 14, lineHeight: '1.6', color: '#1A1A1A', minHeight: 52,
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            className="placeholder:text-[rgba(0,0,0,0.32)] disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px 12px', gap: 4 }}>
          {/* LEFT tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Plus */}
            <div style={{ position: 'relative' }} ref={fileMenuRef}>
              <button onClick={() => { setShowFileMenu(!showFileMenu); setShowSkillMenu(false); }}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 120ms' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                <Plus style={{ width: 15, height: 15, color: 'rgba(0,0,0,0.5)' }} />
              </button>
              <AnimatePresence>
                {showFileMenu && (
                  <motion.div {...popAnim} style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, background: '#fff', zIndex: 50, minWidth: 190, borderRadius: 10, border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <button onClick={() => { if (!canUpload) return; fileInputRef.current?.click(); setShowFileMenu(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'none', border: 'none', cursor: canUpload ? 'pointer' : 'default', fontSize: 13, color: canUpload ? '#333' : '#bbb', fontFamily: 'Inter, sans-serif', textAlign: 'left', opacity: canUpload ? 1 : 0.5 }}
                      onMouseEnter={e => { if (canUpload) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <FileText style={{ width: 13, height: 13 }} />
                      Attach file
                    </button>
                    <button onClick={() => { if (!hasInternet) { setShowFileMenu(false); return; } setUseWebSearch(w => !w); setShowFileMenu(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'none', border: 'none', cursor: hasInternet ? 'pointer' : 'default', fontSize: 13, color: hasInternet ? '#333' : '#bbb', fontFamily: 'Inter, sans-serif', textAlign: 'left', opacity: hasInternet ? 1 : 0.5 }}
                      onMouseEnter={e => { if (hasInternet) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                      <Wifi style={{ width: 13, height: 13 }} />
                      Web Search
                      {hasInternet && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: useWebSearch ? FG : 'rgba(0,0,0,0.07)', color: useWebSearch ? YUZU : '#999' }}>{useWebSearch ? 'ON' : 'OFF'}</span>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Skills button */}
            <div style={{ position: 'relative' }} ref={skillMenuRef}>
              {selectedSkill ? (
                <button onClick={() => setSelectedSkill(null)}
                  style={{ height: 32, paddingLeft: 10, paddingRight: 10, display: 'flex', alignItems: 'center', gap: 5, borderRadius: 8, border: '1px solid rgba(221,255,0,0.5)', background: 'rgba(221,255,0,0.12)', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: FG, fontFamily: 'Inter, sans-serif' }}>
                  <Zap style={{ width: 13, height: 13 }} />
                  <span>{SKILLS.find(s => s.id === selectedSkill)?.label}</span>
                  <X style={{ width: 11, height: 11, color: 'rgba(0,0,0,0.4)' }} />
                </button>
              ) : (
                <button onClick={() => { setShowSkillMenu(s => !s); setShowFileMenu(false); }}
                  style={{ height: 32, paddingLeft: 10, paddingRight: 10, display: 'flex', alignItems: 'center', gap: 5, borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: '#fff', cursor: 'pointer', fontSize: 13, color: 'rgba(0,0,0,0.5)', fontFamily: 'Inter, sans-serif', transition: 'background 120ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <Zap style={{ width: 13, height: 13 }} />
                  <span>Compétence</span>
                  <ChevronDown style={{ width: 12, height: 12, opacity: 0.5 }} />
                </button>
              )}
              <AnimatePresence>
                {showSkillMenu && (
                  <motion.div {...popAnim} style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, background: '#fff', zIndex: 50, minWidth: 180, borderRadius: 10, border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    {SKILLS.map(s => (
                      <button key={s.id} onClick={() => { setSelectedSkill(s.id); setShowSkillMenu(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#333', fontFamily: 'Inter, sans-serif', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <span>{s.emoji}</span>
                        <span style={{ fontWeight: 500 }}>{s.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* RIGHT: model + mic + send */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Model selector */}
            <button style={{ height: 32, padding: '0 12px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.10)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'rgba(0,0,0,0.55)', fontFamily: 'Inter, sans-serif', transition: 'background 120ms' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L13.5 9H19.5L14.5 13L16.5 19L12 15.5L7.5 19L9.5 13L4.5 9H10.5L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Modèle intelligent
              <ChevronDown style={{ width: 11, height: 11, opacity: 0.5 }} />
            </button>

            {/* Send */}
            <button onClick={handleSend} disabled={!hasText || isBlocked}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none', cursor: !hasText || isBlocked ? 'not-allowed' : 'pointer',
                background: hasText && !isBlocked ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 120ms',
              }}>
              <Send style={{ width: 14, height: 14, color: hasText && !isBlocked ? '#fff' : 'rgba(0,0,0,0.25)' }} />
            </button>
          </div>
        </div>
      </div>

      {isBlocked && (
        <div onClick={() => navigate('/pricing')}
          className="mt-3 py-3 flex items-center justify-between px-4 cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: FG, maxWidth: '640px' }}>
          <p className="text-sm font-bold text-white">{dailyBlocked ? 'Daily limit reached' : 'Monthly limit reached'}</p>
          <span className="text-xs font-black px-3 py-1" style={{ background: YUZU, color: FG }}>Upgrade →</span>
        </div>
      )}

      {/* Topic chips */}
      <div className="mt-8" style={{ maxWidth: '640px' }}>
        <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(0,0,0,0.2)' }}>Quick start</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {POWER_TOPICS.map((topic) => (
            <button key={topic.label} onClick={() => setQuery(topic.prompt)}
              className="text-left px-3 py-3 bg-white border hover:bg-black/3 transition-colors"
              style={{ borderColor: 'rgba(0,0,0,0.07)' }}>
              <p className="text-xs font-black" style={{ color: FG }}>{topic.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}