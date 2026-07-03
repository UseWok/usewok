import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Check, X, AlertCircle } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#111111'; const INK2 = '#555555'; const INK3 = '#999999';
const BORDER = '#E8E7E4'; const SURFACE = '#F7F6F3'; const WHITE = '#FFFFFF';

function Card({ children, style = {} }) {
  return <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '18px 20px', fontFamily: F, ...style }}>{children}</div>;
}
function Label({ children }) {
  return <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>{children}</p>;
}
function SpeedRow({ label, pages, maxPages }) {
  const pct = maxPages > 0 ? Math.min((pages / maxPages) * 100, 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: INK2, width: 72, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: INK, borderRadius: 3, transition: 'width 0.7s ease' }} />
      </div>
      <span style={{ fontSize: 11, color: INK3, width: 54, textAlign: 'right', flexShrink: 0 }}>{pages > 0 ? `${pages} pages` : '0'}</span>
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
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>How to fix</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: INK, margin: 0 }}>{issue.title}</p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

function PerfIssueRow({ issue, onFix }) {
  const isAlert = issue.severity === 'error' || issue.severity === 'warning';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ flexShrink: 0 }}>
        {isAlert ? <AlertCircle size={13} color={INK} /> : <Check size={13} color={INK3} />}
      </div>
      <span style={{ fontSize: 12, color: INK, flex: 1 }}>{issue.title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {isAlert ? (
          <>
            {issue.count > 0 && <span style={{ fontSize: 11, color: INK3 }}>{issue.count} pages</span>}
            <button onClick={() => onFix(issue)}
              style={{ fontSize: 11, fontWeight: 600, color: WHITE, background: INK, border: 'none', borderRadius: 7, padding: '5px 11px', cursor: 'pointer', fontFamily: F }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Fix
            </button>
          </>
        ) : (
          <span style={{ fontSize: 11, color: INK3 }}>No issues</span>
        )}
      </div>
    </div>
  );
}

export default function AuditPerformance({ data = {} }) {
  const [fixIssue, setFixIssue] = useState(null);

  const total = data.pages_crawled || 1;
  const pFastest = data.pages_fastest || 0;
  const pFast    = data.pages_fast || 0;
  const pMedium  = data.pages_medium || 0;
  const pSlow    = data.pages_slow || 0;

  const jsFiles = data.js_files_distribution || [];
  const jsSize  = data.js_size_distribution  || [];

  const perfIssues = (data.issues || []).filter(i => i.category === 'CSS' || i.category === 'Performances' || ['error','warning'].includes(i.severity));
  const errors   = perfIssues.filter(i => i.severity === 'error');
  const warnings = perfIssues.filter(i => i.severity === 'warning');
  const ok       = (data.issues || []).filter(i => i.severity === 'notice');

  return (
    <div style={{ fontFamily: F }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 4px', letterSpacing: '-0.03em' }}>Performance</p>
        <p style={{ fontSize: 13, color: INK3, margin: 0 }}>Overall score: <strong style={{ color: INK }}>{data.performance_score ?? '–'} / 100</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <Card>
            <Label>Page load speed</Label>
            <SpeedRow label="< 0.5 s" pages={pFastest} maxPages={total} />
            <SpeedRow label="0.5 – 1 s" pages={pFast} maxPages={total} />
            <SpeedRow label="1 – 3 s" pages={pMedium} maxPages={total} />
            <SpeedRow label="> 3 s" pages={pSlow} maxPages={total} />
          </Card>

          <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '28px 20px' }}>
            <Label>Avg. load speed</Label>
            <span style={{ fontSize: 52, fontWeight: 900, color: INK, letterSpacing: '-0.05em', lineHeight: 1 }}>
              {data.avg_page_load_seconds != null ? data.avg_page_load_seconds.toFixed(2) : '–'}
            </span>
            <span style={{ fontSize: 14, color: INK3, fontWeight: 600 }}>seconds</span>
          </Card>

          {jsFiles.length > 0 && (
            <Card>
              <Label>JS & CSS file count</Label>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={jsFiles} margin={{ top: 4, bottom: 0 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 9, fill: INK3 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: INK3 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE }} cursor={{ fill: SURFACE }} />
                  <Bar dataKey="count" fill={INK} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {jsSize.length > 0 && (
            <Card>
              <Label>JS & CSS file size</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {jsSize.map((d, i) => {
                  const max = Math.max(...jsSize.map(x => x.count), 1);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: INK2, width: 80, flexShrink: 0 }}>{d.range}</span>
                      <div style={{ flex: 1, height: 6, background: SURFACE, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(d.count / max) * 100}%`, background: INK, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: INK3, width: 20, textAlign: 'right' }}>{d.count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Right */}
        <Card>
          <Label>Performance issues</Label>

          {errors.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Errors</p>
              {errors.map((issue, i) => <PerfIssueRow key={i} issue={issue} onFix={setFixIssue} />)}
            </>
          )}

          {warnings.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '20px 0 6px' }}>Warnings</p>
              {warnings.map((issue, i) => <PerfIssueRow key={i} issue={issue} onFix={setFixIssue} />)}
            </>
          )}

          {errors.length === 0 && warnings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ fontSize: 28, margin: '0 0 8px' }}>⚡</p>
              <p style={{ fontSize: 13, color: INK2, margin: 0 }}>No performance issues detected.</p>
            </div>
          )}
        </Card>
      </div>

      {fixIssue && <FixDrawer issue={fixIssue} onClose={() => setFixIssue(null)} />}
    </div>
  );
}