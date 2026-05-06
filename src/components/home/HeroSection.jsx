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

      {/* Input */}
      <div className="bg-white border" style={{ borderColor: 'rgba(0,0,0,0.09)', maxWidth: '640px' }}>
        {files.length > 0 && (
          <div className="flex gap-2 flex-wrap px-4 pt-3">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 px-2 py-1 group" style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)' }}>
                <FileText className="w-3 h-3" style={{ color: FG }} />
                <span className="text-[10px] font-medium max-w-[80px] truncate" style={{ color: '#444' }}>{file.name}</span>
                <button onClick={() => removeFile(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-2 h-2" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 pt-4 pb-2">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); localStorage.setItem('stensor_home_draft', e.target.value); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!isBlocked) handleSend(); } }}
            placeholder={isBlocked ? 'Limit reached — upgrade to continue' : 'Ask me anything about your finances...'}
            disabled={isBlocked}
            rows={3}
            className="w-full resize-none bg-transparent focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontSize: '15px', lineHeight: '1.6', color: FG, minHeight: '72px' }}
          />
        </div>

        <div className="flex items-center justify-between px-3 pb-3 gap-2">
          <div className="flex items-center gap-1">
            <div className="relative" ref={fileMenuRef}>
              <button onClick={() => { setShowFileMenu(!showFileMenu); setShowSkillMenu(false); }}
                className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors">
                <Plus className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.4)' }} />
              </button>
              <AnimatePresence>
                {showFileMenu && (
                  <motion.div {...popAnim} className="absolute bottom-full mb-1 left-0 bg-white z-50 min-w-[190px]"
                    style={{ border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    <button onClick={() => { if (!canUpload) return; fileInputRef.current?.click(); setShowFileMenu(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-black/5 ${canUpload ? 'text-zinc-600' : 'text-zinc-300'}`}>
                      <FileText className="w-3.5 h-3.5" />
                      Attach file
                      {!canUpload && <span className="ml-auto text-[9px] font-black px-1 py-0.5" style={{ background: '#ede9fe', color: '#6d28d9' }}>Essential+</span>}
                    </button>
                    <button onClick={() => { if (!hasInternet) { setShowFileMenu(false); return; } setUseWebSearch(w => !w); setShowFileMenu(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-black/5 ${hasInternet ? 'text-zinc-600' : 'text-zinc-300'}`}>
                      <Wifi className="w-3.5 h-3.5" />
                      Web Search
                      {!hasInternet && <span className="ml-auto text-[9px] font-black px-1 py-0.5 bg-black/6 text-zinc-400">Advanced+</span>}
                      {hasInternet && <span className="ml-auto text-[9px] font-black px-1 py-0.5" style={{ background: useWebSearch ? FG : 'rgba(0,0,0,0.07)', color: useWebSearch ? YUZU : '#999' }}>{useWebSearch ? 'ON' : 'OFF'}</span>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={skillMenuRef}>
              {selectedSkill ? (
                <button onClick={() => setSelectedSkill(null)}
                  className="h-8 px-2 flex items-center gap-1 transition-colors"
                  style={{ background: 'rgba(221,255,0,0.2)' }}>
                  <Zap className="w-3 h-3" style={{ color: FG }} />
                  <span className="text-xs font-semibold hidden sm:block" style={{ color: FG }}>{SKILLS.find(s => s.id === selectedSkill)?.label}</span>
                  <X className="w-3 h-3" style={{ color: FG }} />
                </button>
              ) : (
                <button onClick={() => { setShowSkillMenu(s => !s); setShowFileMenu(false); }}
                  className="h-8 px-2 flex items-center gap-1 hover:bg-black/5 transition-colors">
                  <Zap className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.4)' }} />
                  <span className="text-xs font-medium hidden sm:block" style={{ color: 'rgba(0,0,0,0.4)' }}>Skills</span>
                  <ChevronDown className="w-3 h-3" style={{ color: 'rgba(0,0,0,0.3)' }} />
                </button>
              )}
              <AnimatePresence>
                {showSkillMenu && (
                  <motion.div {...popAnim} className="absolute bottom-full mb-1 left-0 bg-white z-50 min-w-[180px]"
                    style={{ border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                    {SKILLS.map(s => (
                      <button key={s.id} onClick={() => { setSelectedSkill(s.id); setShowSkillMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-black/5 text-zinc-600">
                        <span>{s.emoji}</span>
                        <span className="font-medium">{s.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleRecording}
              className="w-8 h-8 flex items-center justify-center transition-colors"
              style={{ background: isRecording || voiceLoading ? FG : 'rgba(0,0,0,0.05)' }}>
              {isRecording ? (
                <div className="w-2.5 h-2.5" style={{ background: YUZU }} />
              ) : (
                <Mic className="w-4 h-4" style={{ color: 'rgba(0,0,0,0.4)' }} />
              )}
            </button>

            <button onClick={handleSend} disabled={!hasText || isBlocked}
              className="h-8 px-4 text-sm font-black transition-colors flex items-center gap-2"
              style={{
                background: hasText && !isBlocked ? FG : 'rgba(0,0,0,0.05)',
                color: hasText && !isBlocked ? 'white' : 'rgba(0,0,0,0.2)',
                cursor: !hasText || isBlocked ? 'not-allowed' : 'pointer',
              }}>
              <Send className="w-3.5 h-3.5" />
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