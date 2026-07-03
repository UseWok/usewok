import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, X, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111111'; const INK2 = '#555555'; const INK3 = '#999999';
const BORDER = '#E8E7E4'; const SURFACE = '#F7F6F3'; const WHITE = '#FFFFFF';

function Card({ children, style = {} }) {
  return <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px', fontFamily: F, ...style }}>{children}</div>;
}
function Label({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>{children}</p>;
}
function Btn({ children, onClick, variant = 'ghost' }) {
  const s = {
    ghost:   { background: 'none', border: 'none', color: INK2, fontSize: 12, fontWeight: 600, padding: 0 },
    outline: { background: 'none', border: `1px solid ${BORDER}`, color: INK, fontSize: 12, fontWeight: 600, borderRadius: 7, padding: '7px 14px' },
    solid:   { background: INK, border: 'none', color: WHITE, fontSize: 12, fontWeight: 700, borderRadius: 8, padding: '9px 18px' },
  };
  return <button onClick={onClick} style={{ cursor: 'pointer', fontFamily: F, display: 'inline-flex', alignItems: 'center', gap: 5, ...s[variant] }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>{children}</button>;
}
function MiniDonut({ pct, size = 52 }) {
  const r = (size - 8) / 2; const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={SURFACE} strokeWidth={6} />
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={INK} strokeWidth={6}
          strokeLinecap="round"
          initial={{ strokeDasharray: circ, strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - Math.min(pct||0, 100) / 100) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: INK }}>{Math.round(pct||0)}%</div>
    </div>
  );
}
function StackedBar({ segments }) {
  const total = segments.reduce((s, x) => s + (x||0), 0) || 1;
  const SHADES = ['#1a1a1a', '#aaa', '#666', '#ddd'];
  return (
    <div style={{ height: 6, borderRadius: 999, overflow: 'hidden', display: 'flex', background: SURFACE }}>
      {segments.map((v, i) => v > 0 && (
        <motion.div key={i}
          initial={{ width: 0 }}
          animate={{ width: `${(v/total)*100}%` }}
          transition={{ duration: 1.0, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: SHADES[i] }} />
      ))}
    </div>
  );
}

function FixDrawer({ issue, onClose }) {
  if (!issue) return null;
  const steps = issue.fix_steps || [];
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex' }} onClick={onClose}>
      <div style={{ flex: 1 }} />
      <div onClick={e => e.stopPropagation()} style={{ width: 380, background: WHITE, borderLeft: `1px solid ${BORDER}`, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>How to fix</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0, lineHeight: 1.4 }}>{issue.title}</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={13} color={INK2} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {issue.description && <p style={{ fontSize: 13, color: INK2, lineHeight: 1.6, margin: '0 0 20px' }}>{issue.description}</p>}
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: INK, color: WHITE, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                <p style={{ fontSize: 13, color: INK2, margin: 0, lineHeight: 1.55 }}>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function ThematicWidget({ title, gauge, text, locked, action, onAction }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 110 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>{title}</span>
        {locked && <span style={{ fontSize: 9, fontWeight: 700, color: INK3, background: SURFACE, border: `1px solid ${BORDER}`, padding: '2px 7px', borderRadius: 99, textTransform: 'uppercase' }}>Pro</span>}
      </div>
      {gauge != null && <MiniDonut pct={gauge} size={50} />}
      {text && <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.55 }}>{text}</p>}
      {locked && <p style={{ fontSize: 11, color: INK3, margin: 0 }}>Available with a higher plan</p>}
      {action && <Btn variant="ghost" onClick={onAction}>{action} <ChevronRight size={12} /></Btn>}
    </Card>
  );
}

export default function AuditOverview({ data = {}, onNavigate }) {
  const [issueTab, setIssueTab] = useState('errors');
  const [robotsOpen, setRobotsOpen] = useState(false);
  const [fixIssue, setFixIssue] = useState(null);
  const [aiInfoOpen, setAiInfoOpen] = useState(false);

  const issues = data.issues || [];
  const errors   = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const notices  = issues.filter(i => i.severity === 'notice');

  const displayIssues = issueTab === 'errors' ? errors : issueTab === 'warnings' ? warnings : notices;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontFamily: F }}>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>

        <Card>
          <Label>Site health</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>{data.site_health_score ?? '–'}%</span>
          </div>
          <div style={{ height: 5, background: SURFACE, borderRadius: 999, marginBottom: 10, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.site_health_score || 0}%` }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '100%', background: INK, borderRadius: 999 }} />
          </div>
          <p style={{ fontSize: 11, color: INK3, margin: 0 }}>{issues.length} issue{issues.length !== 1 ? 's' : ''} detected</p>
        </Card>

        <Card>
          <Label>Pages crawled</Label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1 }}>{data.pages_crawled ?? '–'}</span>
            <span style={{ fontSize: 11, color: INK3 }}>pages</span>
          </div>
          <StackedBar segments={[data.pages_healthy||0, data.pages_redirects||0, data.pages_blocked||0, data.pages_broken||0]} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 16px', marginTop: 10 }}>
            {[['Healthy', data.pages_healthy], ['Redirects', data.pages_redirects], ['Blocked', data.pages_blocked], ['Broken', data.pages_broken]].map(([l, c]) => (
              <span key={l} style={{ fontSize: 11, color: INK3 }}>{l} <strong style={{ color: INK }}>{c ?? 0}</strong></span>
            ))}
          </div>
        </Card>

        <Card>
          <Label>AI search health</Label>
          <span style={{ fontSize: 40, fontWeight: 900, color: INK, letterSpacing: '-0.04em', lineHeight: 1, display: 'block', marginBottom: 10 }}>{data.ai_readiness_score ?? '–'}%</span>
          <p style={{ fontSize: 12, color: INK2, margin: '0 0 12px', lineHeight: 1.55 }}>
            {data.ai_bots_blocked?.length > 0
              ? `${data.ai_bots_blocked.length} AI bot(s) blocked in robots.txt.`
              : 'No AI bots blocked. Your site is accessible to AI engines.'}
          </p>
          <Btn variant="ghost" onClick={() => setAiInfoOpen(true)}>How it works <ChevronRight size={12} /></Btn>
        </Card>

        <Card>
          <Label>Blocked AI bots: {data.ai_bots_blocked?.length ?? '–'}</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {(data.ai_bots_allowed?.length ? data.ai_bots_allowed : ['GPTBot', 'OAI-SearchBot', 'Google-Extended', 'ClaudeBot']).slice(0,5).map(bot => (
              <div key={bot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={12} color={INK} />
                  <span style={{ fontSize: 12, color: INK }}>{bot}</span>
                </div>
                <span style={{ fontSize: 11, color: INK3 }}>Allowed</span>
              </div>
            ))}
            {(data.ai_bots_blocked || []).map(bot => (
              <div key={bot} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <X size={12} color={INK} />
                  <span style={{ fontSize: 12, color: INK }}>{bot}</span>
                </div>
                <span style={{ fontSize: 11, color: INK3 }}>Blocked</span>
              </div>
            ))}
          </div>
          {data.has_robots_txt && (
            <Btn variant="outline" onClick={() => setRobotsOpen(true)}>View robots.txt</Btn>
          )}
        </Card>
      </div>

      {/* ── Issues panel ── */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: 0 }}>Detected issues</p>
          <div style={{ display: 'flex', gap: 2, background: SURFACE, borderRadius: 8, padding: 3 }}>
            {[{ id: 'errors', label: 'Errors', count: errors.length }, { id: 'warnings', label: 'Warnings', count: warnings.length }, { id: 'notices', label: 'Notices', count: notices.length }].map(t => (
              <button key={t.id} onClick={() => setIssueTab(t.id)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: issueTab === t.id ? 600 : 400, background: issueTab === t.id ? WHITE : 'transparent', color: issueTab === t.id ? INK : INK3, boxShadow: issueTab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
                {t.label} <span style={{ opacity: 0.55 }}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
        {displayIssues.length === 0 ? (
          <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>No issues in this category. 🎉</p>
        ) : (
          <div>
            {displayIssues.slice(0, 5).map((issue, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: INK, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: INK, flex: 1 }}>{issue.title}</span>
                {issue.count > 0 && <span style={{ fontSize: 12, color: INK3, flexShrink: 0 }}>{issue.count} pages</span>}
                <Btn variant="outline" onClick={() => setFixIssue(issue)}>Fix</Btn>
              </div>
            ))}
            {displayIssues.length > 5 && (
              <div style={{ paddingTop: 14 }}>
                <Btn variant="ghost" onClick={() => onNavigate('issues')}>See all issues ({displayIssues.length}) <ChevronRight size={12} /></Btn>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── Thematic widgets ── */}
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>Thematic reports</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
          <Card style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: INK }}>Robots.txt</span>
            <span style={{ fontSize: 11, color: INK3 }}>{data.has_robots_txt ? 'Found' : 'Not found'}</span>
            {data.has_robots_txt && <Btn variant="outline" onClick={() => setRobotsOpen(true)}>Open file</Btn>}
          </Card>
          <ThematicWidget title="Crawlability" gauge={data.crawlability_score} action="See details" onAction={() => onNavigate('crawlability')} />
          <ThematicWidget title="HTTPS" gauge={data.has_ssl ? 100 : 0} text={data.has_ssl ? 'Valid SSL certificate.' : 'No SSL certificate.'} />
          <ThematicWidget title="Schema Markup" text={data.has_schema ? 'Schema markup detected.' : 'No schema markup detected. AI engines cannot understand your content well.'} />
          <ThematicWidget title="Core Web Vitals" locked />
          <ThematicWidget title="Internal links" gauge={data.has_canonical ? 100 : 70} action="See details" />
          <ThematicWidget title="Open Graph" gauge={data.has_og_tags ? 100 : 0} text={data.has_og_tags ? 'OG tags present.' : 'OG tags missing.'} />
          <ThematicWidget title="Performance" gauge={data.performance_score} action="See details" onAction={() => onNavigate('performance')} />
        </div>
      </div>

      {/* ── Upsell + trends ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Card style={{ background: INK, border: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: WHITE, margin: 0, lineHeight: 1.3 }}>You're only seeing part of the picture.</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.6 }}>Audit more pages and fix how your site appears on Google and AI tools like ChatGPT.</p>
          <button onClick={() => window.location.assign('/pricing')} style={{ padding: '10px 18px', background: WHITE, color: INK, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: F, alignSelf: 'flex-start' }}>Free trial →</button>
        </Card>
        <Card>
          <p style={{ fontSize: 12, fontWeight: 600, color: INK, margin: '0 0 4px' }}>Market trends</p>
          <p style={{ fontSize: 11, color: INK3, margin: '0 0 16px' }}>Estimated traffic sources</p>
          {data.market_traffic ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                ['Direct traffic', data.market_traffic.direct, null],
                ['Organic search', data.market_traffic.organic, data.market_traffic.organic_pct],
                ['Paid search', data.market_traffic.paid, null],
                ['Social media', data.market_traffic.social, data.market_traffic.social_pct],
                ['Other traffic', data.market_traffic.other, data.market_traffic.other_pct],
              ].map(([label, value, pct], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 4 ? `1px solid ${BORDER}` : 'none' }}>
                  <span style={{ fontSize: 12, color: INK2 }}>{label}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>{value ?? '–'}</span>
                    {pct && <span style={{ fontSize: 11, color: INK3 }}>{pct}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: 12, color: INK3 }}>Data not available</p>}
        </Card>
      </div>

      {/* Robots.txt modal */}
      {robotsOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setRobotsOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#0F0F0F', borderRadius: 14, width: '100%', maxWidth: 520, maxHeight: '60vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid #333' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa', fontFamily: 'monospace' }}>robots.txt — {data.domain}</span>
              <button onClick={() => setRobotsOpen(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <pre style={{ margin: 0, padding: '20px 18px', fontSize: 12, color: '#e2e8f0', fontFamily: 'monospace', lineHeight: 1.8, overflowY: 'auto' }}>{data.robots_txt_content || '# robots.txt empty or not found'}</pre>
          </div>
        </div>
      )}

      {/* AI info modal */}
      {aiInfoOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setAiInfoOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: WHITE, borderRadius: 14, width: '100%', maxWidth: 400, padding: '28px', border: `1px solid ${BORDER}` }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 12px' }}>AI search health</p>
            <p style={{ fontSize: 13, color: INK2, lineHeight: 1.65, margin: '0 0 16px' }}>This score evaluates whether AI crawlers (ChatGPT, Perplexity, Google AI…) can freely access and index your content. A score of 100% means no AI bots are blocked in your robots.txt and your site is well-structured for AI engines.</p>
            <Btn variant="solid" onClick={() => setAiInfoOpen(false)}>Got it</Btn>
          </div>
        </div>
      )}

      <FixDrawer issue={fixIssue} onClose={() => setFixIssue(null)} />
    </div>
  );
}