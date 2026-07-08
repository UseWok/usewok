import { useState } from 'react';
import { X } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const INK = '#1A1A1A';
const INK3 = '#9B9BA8';
const BORDER = 'rgba(21,19,15,0.10)';
const VIOLET = '#7C3AED';
const ORANGE = '#F97316';
const GREEN = '#10B981';

function parseJSON(s, fb) { try { return JSON.parse(s || '') || fb; } catch { return fb; } }

const NO_DATA = "Positioning unavailable — the site could not be analyzed (protected site, JavaScript-only, or incorrect domain). Verify the domain and rerun the scan.";

export default function CompetitorDetailModal({ competitor, rank, onClose }) {
  const [tab, setTab] = useState('details');
  const news = parseJSON(competitor.news_json, []);
  const analyzed = !!competitor.analyzed_at;
  // Rank badge only shown when the competitor is cited in the top 3
  const showRank = rank && rank <= 3 && (competitor.referral_cited > 0 || competitor.authority_cited > 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', padding: 16, fontFamily: F }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 640, maxHeight: '82vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <img src={`https://www.google.com/s2/favicons?domain=${competitor.domain}&sz=64`} width={38} height={38} style={{ borderRadius: 9 }} alt="" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.02em' }}>{competitor.name}</h2>
              {showRank && (
                <span style={{ padding: '2px 9px', background: 'rgba(249,115,22,0.12)', color: ORANGE, borderRadius: 20, fontSize: 11, fontWeight: 800 }}>#{rank}</span>
              )}
            </div>
            <p style={{ fontSize: 12.5, color: INK3, margin: '2px 0 0' }}>{competitor.domain}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: INK3, padding: 4 }}><X size={17} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 22, padding: '14px 24px 0', borderBottom: `1px solid ${BORDER}` }}>
          {[{ id: 'details', label: 'DETAILS' }, { id: 'evolution', label: `NEWS (${news.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 10px', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', fontFamily: F, color: tab === t.id ? VIOLET : INK3, borderBottom: tab === t.id ? `2px solid ${VIOLET}` : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'details' ? (
          !analyzed ? (
            <div style={{ padding: '32px 24px' }}>
              <div style={{ border: '1px solid rgba(249,115,22,0.35)', borderRadius: 10, padding: '14px 16px', background: 'rgba(249,115,22,0.06)' }}>
                <p style={{ fontSize: 12.5, color: '#C2410C', margin: 0, lineHeight: 1.6 }}>{NO_DATA}</p>
              </div>
            </div>
          ) : (
          <div>
            {/* Stat blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ padding: '18px 24px', background: '#FAF9F6', borderRight: `1px solid ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: ORANGE }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.06em' }}>REFERRAL</span>
                </div>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#0B815A', margin: 0 }}>{competitor.referral_pct}%</p>
                <p style={{ fontSize: 11.5, color: INK3, margin: '2px 0 0' }}>recommended {competitor.referral_cited}/{competitor.referral_total}</p>
              </div>
              <div style={{ padding: '18px 24px', background: '#FAF9F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: GREEN }} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.06em' }}>AUTHORITY</span>
                </div>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#0B815A', margin: 0 }}>{competitor.authority_cited}</p>
                <p style={{ fontSize: 11.5, color: INK3, margin: '2px 0 0' }}>present {competitor.authority_cited}/{competitor.authority_total}</p>
              </div>
            </div>

            <div style={{ padding: '18px 24px 24px' }}>
              {/* Synthèse */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: '#F0EDE8', fontSize: 10, fontWeight: 700, color: INK, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.06em' }}>SUMMARY</span>
              </div>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: INK, margin: '0 0 8px' }}>Why {competitor.name} stands out</p>
              <div style={{ border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ORANGE}`, borderRadius: 10, padding: '12px 14px', marginBottom: 22 }}>
                <p style={{ fontSize: 13, color: '#3D3D3D', margin: 0, lineHeight: 1.6 }}>
                  {competitor.synthesis || `${competitor.name} is recommended by AI engines on ${competitor.referral_cited}/${competitor.referral_total} of your referral prompts, and present on ${competitor.authority_cited}/${competitor.authority_total} educational queries.`}
                </p>
              </div>

              {/* Positionnement */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                <span style={{ width: 16, height: 16, borderRadius: 4, background: '#F0EDE8', fontSize: 10, fontWeight: 700, color: INK, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: INK3, letterSpacing: '0.06em' }}>STRATEGIC POSITIONING</span>
              </div>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: INK, margin: '0 0 2px' }}>How they present themselves</p>
              <p style={{ fontSize: 11.5, color: INK3, margin: '0 0 8px' }}>Observed differentiators on their site · inferred editorial targets</p>
              {competitor.positioning_available && competitor.positioning ? (
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: '12px 14px', background: '#FAF9F6' }}>
                  <p style={{ fontSize: 13, color: '#3D3D3D', margin: 0, lineHeight: 1.6 }}>{competitor.positioning}</p>
                </div>
              ) : (
                <div style={{ border: '1px solid rgba(249,115,22,0.35)', borderRadius: 10, padding: '12px 14px', background: 'rgba(249,115,22,0.06)' }}>
                  <p style={{ fontSize: 12.5, color: '#C2410C', margin: 0, lineHeight: 1.6 }}>{NO_DATA}</p>
                </div>
              )}
            </div>
          </div>
          )
        ) : (
          <div style={{ padding: '18px 24px 24px' }}>
            {news.length === 0 && <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '24px 0' }}>No news detected yet.</p>}
            {news.map((n, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${VIOLET}`, padding: '4px 0 4px 14px', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ padding: '2px 8px', background: 'rgba(124,58,237,0.10)', color: VIOLET, borderRadius: 5, fontSize: 10.5, fontWeight: 700 }}>{n.tag || 'News'}</span>
                  <span style={{ fontSize: 11.5, color: INK3 }}>{n.date || ''}</span>
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: INK, margin: '0 0 4px', lineHeight: 1.5 }}>{n.title}</p>
                {n.summary && <p style={{ fontSize: 12.5, color: '#666', margin: '0 0 6px', lineHeight: 1.6 }}>{n.summary}</p>}
                {n.source_url && (
                  <a href={n.source_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: VIOLET, fontWeight: 600, textDecoration: 'none' }}>Source ↗</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}