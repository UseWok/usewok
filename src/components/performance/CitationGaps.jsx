import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Crosshair, RefreshCw, Trophy, Target, ChevronDown } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#D8D4CC';
const WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const CORAL = '#E8622A';
const GREEN = '#3CC660';

// ── Authority bar (competitor vs you) ─────────────────────────────────────────
function AuthorityBar({ competitor, you }) {
  const max = Math.max(competitor, you, 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 120 }}>
      {[
        { label: 'Them', val: competitor, color: INK3 },
        { label: 'You', val: you, color: CORAL },
      ].map(row => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 10, color: INK3, width: 28, flexShrink: 0 }}>{row.label}</span>
          <div style={{ flex: 1, height: 5, background: '#EDE8DE', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${(row.val / max) * 100}%`, height: '100%', background: row.color, borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: row.color, width: 20, textAlign: 'right' }}>{row.val}</span>
        </div>
      ))}
    </div>
  );
}

// ── Gap card ──────────────────────────────────────────────────────────────────
function GapCard({ gap, you, index }) {
  const [open, setOpen] = useState(false);
  const winnable = gap.is_winnable;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      style={{ background: WHITE, border: `1.5px solid ${winnable ? 'rgba(60,198,96,0.4)' : BORDER}`, borderRadius: 12, marginBottom: 8, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '13px 15px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, fontFamily: F }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: winnable ? '#177A3A' : '#6B6B6B', background: winnable ? 'rgba(60,198,96,0.12)' : '#EDE8DE', border: `1px solid ${winnable ? 'rgba(60,198,96,0.3)' : '#DDD8CE'}`, borderRadius: 999, padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {winnable ? <><Trophy size={10} /> Winnable</> : 'Hard'}
            </span>
            <span style={{ fontSize: 12, color: INK3 }}>AI cites <b style={{ color: INK }}>{gap.competitor_name}</b></span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.4 }}>“{gap.query}”</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <AuthorityBar competitor={Math.round(gap.competitor_authority || 0)} you={you} />
          <ChevronDown size={15} color={INK3} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: `1px solid ${BORDER}` }}>
            <div style={{ padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 11 }}>
              {gap.why_they_win && (
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Why they win</p>
                  <p style={{ fontSize: 12.5, color: INK2, margin: 0, lineHeight: 1.5 }}>{gap.why_they_win}</p>
                </div>
              )}
              {gap.your_move && (
                <div style={{ background: 'rgba(232,98,42,0.06)', border: '1px solid rgba(232,98,42,0.18)', borderRadius: 10, padding: '11px 13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                    <Target size={12} color={CORAL} />
                    <p style={{ fontSize: 10, fontWeight: 700, color: CORAL, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Your move</p>
                  </div>
                  <p style={{ fontSize: 12.5, color: INK, margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{gap.your_move}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CitationGaps({ profile }) {
  const [phase, setPhase] = useState('idle'); // idle | loading | done | error
  const [data, setData] = useState(null);

  const run = async () => {
    if (!profile?.site_url) return;
    setPhase('loading');
    try {
      const res = await base44.functions.invoke('citationGaps', {
        url: profile.site_url,
        business_name: profile.identity_name || profile.business_name || '',
        industry: profile.identity_industry || profile.business_type || '',
        city: profile.identity_city || profile.city || '',
        authority_score: profile.authority_score || null,
      });
      if (!res?.data || res.data.error || !(res.data.gaps || []).length) { setPhase('error'); return; }
      setData(res.data);
      setPhase('done');
    } catch { setPhase('error'); }
  };

  const you = data?.your_authority_estimate || 0;

  return (
    <div style={{ fontFamily: F, marginBottom: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Crosshair size={13} color={CORAL} />
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.01em' }}>Cross-competitor gaps</p>
            <p style={{ fontSize: 11, color: INK3, margin: '1px 0 0' }}>Where AI cites rivals instead of you</p>
          </div>
        </div>
        {(phase === 'done' || phase === 'error') && (
          <button onClick={run} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
            <RefreshCw size={11} /> Refresh
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: WHITE, border: `1.5px dashed ${BORDER}`, borderRadius: 14, padding: '22px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: INK2, margin: '0 0 14px', lineHeight: 1.55 }}>
              Find the niche questions where AI engines recommend your competitors — and spot the winnable ones with lower authority than you.
            </p>
            <button onClick={run} style={{ padding: '10px 20px', background: DARK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Crosshair size={14} /> Find citation gaps
            </button>
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: DARK, margin: '0 auto 14px' }} />
            <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Probing AI engines…</p>
            <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Finding which rivals get cited on your niche queries</p>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 12px' }}>Analysis failed. Please try again.</p>
            <button onClick={run} style={{ padding: '9px 18px', background: DARK, color: WHITE, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Retry</button>
          </motion.div>
        )}

        {phase === 'done' && data && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Summary banner */}
            <div style={{ background: DARK, borderRadius: 14, padding: '16px 20px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: data.summary ? 8 : 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: GREEN, lineHeight: 1 }}>{data.winnable_count}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>winnable</span>
                </div>
                <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.12)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: WHITE, lineHeight: 1 }}>{data.gaps.length}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>total gaps</span>
                </div>
                <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.12)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 24, fontWeight: 900, color: CORAL, lineHeight: 1 }}>{you}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>your authority</span>
                </div>
              </div>
              {data.summary && <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.5 }}>{data.summary}</p>}
            </div>

            {data.gaps.map((g, i) => <GapCard key={i} gap={g} you={you} index={i} />)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}