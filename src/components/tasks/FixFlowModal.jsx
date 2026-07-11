import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { base44 } from '@/api/base44Client';
import { X, CheckCircle2, Sparkles } from 'lucide-react';
import FixStepItem from './FixStepItem';
import InfoTip from '@/components/ui/InfoTip';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const GREEN = '#10B981';
const VIOLET = '#7C3AED';

function parseInstr(t) { try { return JSON.parse(t.instructions_json || '') || null; } catch { return null; } }

export default function FixFlowModal({ task, meta, onClose, onComplete }) {
  const saved = parseInstr(task);
  const [steps, setSteps] = useState(saved?.steps || []);
  const [doneFlags, setDoneFlags] = useState(saved?.done || []);
  const [generating, setGenerating] = useState(!saved?.steps?.length);
  const [finishing, setFinishing] = useState(false);

  // Generate real, tailored steps on first open
  useEffect(() => {
    if (saved?.steps?.length) return;
    (async () => {
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `You are UseWok, an assistant helping a non-technical business owner improve their visibility in AI answers (ChatGPT, Gemini, Claude).
Task to complete: "${task.action_title}".
Business website: ${task.site_url || 'unknown'}. Extra context: ${meta?.description || 'none'}.
Break this task into 3 to 5 ultra-simple, concrete steps the owner can follow right now. Zero technical jargon.
For each step provide:
- "title": short action (max 8 words)
- "detail": one plain-English sentence explaining exactly what to do
- "copy_text": if the step involves writing something (a title, a description, a bio, a listing), provide the EXACT ready-to-paste text tailored to this business — otherwise empty string
- "link": a direct real URL to open if relevant (e.g. the signup page of the platform) — otherwise empty string
- "icon": one of: link, write, web, star, promote, doc, sparkle`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              steps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' }, detail: { type: 'string' },
                    copy_text: { type: 'string' }, link: { type: 'string' }, icon: { type: 'string' },
                  },
                },
              },
            },
          },
        });
        const s = (res?.steps || []).slice(0, 5);
        setSteps(s);
        setDoneFlags(s.map(() => false));
        base44.entities.ActionTask.update(task.id, { instructions_json: JSON.stringify({ steps: s, done: s.map(() => false) }) }).catch(() => {});
      } catch {}
      setGenerating(false);
    })();
  }, []);

  const toggle = (i) => {
    setDoneFlags(prev => {
      const next = prev.map((d, j) => (j === i ? !d : d));
      base44.entities.ActionTask.update(task.id, { instructions_json: JSON.stringify({ steps, done: next }) }).catch(() => {});
      return next;
    });
  };

  const allDone = steps.length > 0 && doneFlags.every(Boolean);
  const doneCount = doneFlags.filter(Boolean).length;

  const finish = () => {
    setFinishing(true);
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.7 }, colors: [GREEN, VIOLET, '#FF5A1F', '#FBBF24'] });
    setTimeout(() => confetti({ particleCount: 60, spread: 100, origin: { y: 0.6 }, colors: [GREEN, '#FBBF24'] }), 250);
    setTimeout(() => onComplete(task), 1100);
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <motion.div initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{ background: '#F7F5F0', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '86vh', overflowY: 'auto', padding: '24px 26px 26px', fontFamily: F, position: 'relative' }}>

          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(21,19,15,0.06)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
            <X size={15} color={INK3} />
          </button>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, background: 'rgba(59,139,235,0.12)', color: '#2563EB', fontSize: 11, fontWeight: 800, marginBottom: 10 }}>
            In progress
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.02em', paddingRight: 30 }}>{task.action_title}</h2>
          <p style={{ fontSize: 12.5, color: INK3, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            Follow the steps — we prepared everything for you <InfoTip text="UseWok wrote the exact texts and links you need. Just copy, paste, and check each step off. No thinking required." />
          </p>

          {/* Progress dots */}
          {steps.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
              {steps.map((_, i) => (
                <motion.span key={i} animate={{ background: doneFlags[i] ? GREEN : 'rgba(21,19,15,0.12)', scale: doneFlags[i] ? [1, 1.4, 1] : 1 }}
                  style={{ height: 6, borderRadius: 20, flex: 1 }} />
              ))}
              <span style={{ fontSize: 11.5, fontWeight: 800, color: allDone ? GREEN : INK3, marginLeft: 4 }}>{doneCount}/{steps.length}</span>
            </div>
          )}

          {generating ? (
            <div style={{ textAlign: 'center', padding: '38px 0' }}>
              <div style={{ width: 30, height: 30, margin: '0 auto 12px', borderRadius: '50%', border: '3px solid rgba(124,58,237,0.18)', borderTopColor: VIOLET, animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 3px' }}>Preparing your step-by-step guide…</p>
              <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Writing the exact texts and links for you</p>
            </div>
          ) : steps.length === 0 ? (
            <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '30px 0' }}>Couldn't build the guide. Close and try again.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {steps.map((s, i) => (
                <FixStepItem key={i} step={s} index={i} done={!!doneFlags[i]} onToggle={() => toggle(i)} />
              ))}
            </div>
          )}

          {/* Final reward button */}
          {steps.length > 0 && !generating && (
            <motion.button onClick={finish} disabled={!allDone || finishing}
              animate={allDone ? { scale: [1, 1.03, 1] } : {}}
              transition={allDone ? { repeat: Infinity, duration: 1.6 } : {}}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 18, padding: '14px 0', border: 'none', borderRadius: 14, background: allDone ? GREEN : 'rgba(21,19,15,0.08)', color: allDone ? '#fff' : INK3, fontSize: 15, fontWeight: 800, cursor: allDone ? 'pointer' : 'not-allowed', fontFamily: F, boxShadow: allDone ? '0 8px 22px rgba(16,185,129,0.35)' : 'none', transition: 'background 0.3s' }}>
              {finishing ? <Sparkles size={17} /> : <CheckCircle2 size={17} strokeWidth={2.4} />}
              {finishing ? 'Amazing work! 🎉' : allDone ? 'Done — claim your win!' : `Complete the ${steps.length - doneCount} step${steps.length - doneCount > 1 ? 's' : ''} left`}
            </motion.button>
          )}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}