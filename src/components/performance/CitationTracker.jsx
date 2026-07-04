import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Radar, ExternalLink, RefreshCw, ShieldCheck, AlertTriangle, Minus, TrendingUp } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#D8D4CC';
const WHITE = '#FFFFFF';
const DARK = '#1A1A1A';
const CORAL = '#E8622A';
const GREEN = '#3CC660';

// ── Sentiment labels → color + French display ─────────────────────────────────
const SENTIMENT = {
  reference:  { label: 'Reference',  color: '#0E9F6E', bg: 'rgba(14,159,110,0.10)', border: 'rgba(14,159,110,0.25)' },
  trusted:    { label: 'Trusted',    color: '#2563EB', bg: 'rgba(37,99,235,0.10)',  border: 'rgba(37,99,235,0.22)' },
  neutral:    { label: 'Neutral',    color: '#6B6B6B', bg: '#EDE8DE',               border: '#DDD8CE' },
  expensive:  { label: 'Expensive',  color: '#D97706', bg: 'rgba(217,119,6,0.10)',  border: 'rgba(217,119,6,0.25)' },
  complex:    { label: 'Complex',    color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', border: 'rgba(124,58,237,0.22)' },
  criticized: { label: 'Criticized', color: '#DC2626', bg: 'rgba(220,38,38,0.10)',  border: 'rgba(220,38,38,0.22)' },
};
const sentInfo = (s) => SENTIMENT[s] || SENTIMENT.neutral;

function SentimentPill({ sentiment }) {
  const s = sentInfo(sentiment);
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 999, padding: '3px 9px', flexShrink: 0, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// ── Citation row ──────────────────────────────────────────────────────────────
function CitationRow({ c, index }) {
  let host = '';
  try { host = new URL(c.source_url).hostname.replace(/^www\./, ''); } catch { host = c.source_name || ''; }
  return (
    <motion.a
      href={c.source_url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      style={{ display: 'block', textDecoration: 'none', background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 12, padding: '13px 15px', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.source_name || host}</span>
          <ExternalLink size={11} color={INK3} style={{ flexShrink: 0 }} />
        </div>
        <SentimentPill sentiment={c.sentiment} />
      </div>
      {c.snippet && (
        <p style={{ fontSize: 12, color: INK2, margin: '0 0 8px', lineHeight: 1.5, fontStyle: 'italic' }}>“{c.snippet}”</p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 10.5, color: INK3 }}>{host}{c.source_type ? ` · ${c.source_type}` : ''}</span>
        {c.authority_weight != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: i < (c.authority_weight || 0) ? CORAL : '#E3DED4' }} />
            ))}
          </span>
        )}
      </div>
    </motion.a>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function CitationTracker({ profile }) {
  const [phase, setPhase] = useState('idle'); // idle | loading | done | empty | error
  const [data, setData] = useState(null);

  const run = async () => {
    if (!profile?.site_url) return;
    setPhase('loading');
    try {
      const res = await base44.functions.invoke('trackCitations', {
        url: profile.site_url,
        business_name: profile.identity_name || profile.business_name || '',
        industry: profile.identity_industry || profile.business_type || '',
      });
      if (!res?.data || res.data.error) { setPhase('error'); return; }
      setData(res.data);
      setPhase(res.data.found_any ? 'done' : 'empty');
    } catch { setPhase('error'); }
  };

  const score = data?.contextual_sentiment_score || 0;
  const dominant = data?.dominant_perception && data.dominant_perception !== 'unknown' ? sentInfo(data.dominant_perception) : null;
  const breakdown = data?.sentiment_breakdown || {};
  const breakdownEntries = Object.entries(breakdown).filter(([, v]) => v > 0);

  return (
    <div style={{ fontFamily: F, marginBottom: 14 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radar size={13} color={CORAL} />
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.01em' }}>Live citation tracker</p>
            <p style={{ fontSize: 11, color: INK3, margin: '1px 0 0' }}>Real mentions & contextual sentiment</p>
          </div>
        </div>
        {(phase === 'done' || phase === 'empty' || phase === 'error') && (
          <button onClick={run} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
            <RefreshCw size={11} /> Refresh
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE — prompt to run */}
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: WHITE, border: `1.5px dashed ${BORDER}`, borderRadius: 14, padding: '22px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: INK2, margin: '0 0 14px', lineHeight: 1.55 }}>
              Sweep the AI-readable web in real time to find where your brand is actually cited — and how it's framed.
            </p>
            <button onClick={run} style={{ padding: '10px 20px', background: DARK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <Radar size={14} /> Scan live citations
            </button>
          </motion.div>
        )}

        {/* LOADING */}
        {phase === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${BORDER}`, borderTopColor: DARK, margin: '0 auto 14px' }} />
            <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Sweeping the web…</p>
            <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Finding real citations & analyzing sentiment</p>
          </motion.div>
        )}

        {/* ERROR */}
        {phase === 'error' && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: '0 0 12px' }}>Scan failed. Please try again.</p>
            <button onClick={run} style={{ padding: '9px 18px', background: DARK, color: WHITE, border: 'none', borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Retry</button>
          </motion.div>
        )}

        {/* EMPTY — no citations found (this is itself a signal) */}
        {phase === 'empty' && (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: DARK, borderRadius: 14, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={16} color="#F4866A" />
              <p style={{ fontSize: 14, fontWeight: 800, color: WHITE, margin: 0 }}>Invisible to AI</p>
            </div>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.72)', margin: 0, lineHeight: 1.55 }}>
              We found no real citations of your brand on the AI-readable web. LLMs like ChatGPT or Gemini have almost nothing to cite about you — which is exactly why they recommend competitors instead.
            </p>
          </motion.div>
        )}

        {/* DONE */}
        {phase === 'done' && data && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Contextual sentiment hero */}
            <div style={{ background: DARK, borderRadius: 14, padding: '18px 20px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 30, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.03em' }}>{score}</span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.40)', marginTop: 2 }}>/100 perception</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {dominant && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>AI mostly sees you as</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: dominant.color, background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: '3px 10px' }}>{dominant.label}</span>
                    </div>
                  )}
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.5 }}>{data.perception_summary}</p>
                </div>
              </div>

              {/* Sentiment breakdown bars */}
              {breakdownEntries.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
                  {breakdownEntries.map(([key, count]) => {
                    const s = sentInfo(key);
                    return (
                      <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '4px 9px' }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
                        {s.label} <span style={{ color: 'rgba(255,255,255,0.45)' }}>{count}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Citations list */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 8px' }}>
                <ShieldCheck size={12} color={GREEN} />
                <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                  {data.citations.length} real mention{data.citations.length > 1 ? 's' : ''} found
                </p>
              </div>
              {data.citations.map((c, i) => <CitationRow key={i} c={c} index={i} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}