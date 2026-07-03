import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, RefreshCw, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getActiveDomain, onActiveDomainChange } from '@/lib/active-domain';
import AuditOverview from '../components/audit/AuditOverview';
import AuditCrawlability from '../components/audit/AuditCrawlability';
import AuditIssues from '../components/audit/AuditIssues';
import AuditPages from '../components/audit/AuditPages';
import AuditPerformance from '../components/audit/AuditPerformance';
import { getProfileData, uploadProfileData } from '@/lib/profile-storage';
import { usePlanFeatures } from '@/lib/usePlanFeatures';
import UpgradeModal from '@/components/upsell/UpgradeModal';


const TABS = [
  { id: 'overview',      label: 'Aperçu' },
  { id: 'crawlability',  label: 'Crawlabilité' },
  { id: 'issues',        label: 'Problèmes' },
  { id: 'pages',         label: 'Pages analysées' },
  { id: 'performance',   label: 'Performance' },
];

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E6';
const WHITE = '#FFFFFF';
const SURFACE = '#F8F7F5';
const CORAL = '#F95738';

function LoadingSkeleton() {
  return (
    <div style={{ padding: '32px 20px', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[200, 120, 160, 80].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 12, background: 'linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)', backgroundSize: '400% 100%', animation: 'skshimmer 1.4s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes skshimmer{0%{background-position:100% 0}100%{background-position:-100% 0}}`}</style>
    </div>
  );
}

function ThinkingState({ url }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Fetching HTML and HTTP headers…',
    'Reading robots.txt and sitemap.xml…',
    'Analyzing SEO tags and structure…',
    'Detecting technical issues…',
    'Analyzing AI crawl…',
    'Generating full report…',
  ];
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 2800);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center', fontFamily: F }}>
      <div style={{ position: 'relative', width: 60, height: 60, marginBottom: 28 }}>
        <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '3px solid #E8E7E4', borderTopColor: INK, animation: 'spin 0.9s linear infinite' }} />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Audit in progress…</p>
      <p style={{ fontSize: 12, color: INK3, margin: '0 0 28px' }}>{url}</p>
      <div style={{ maxWidth: 320, width: '100%' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', opacity: i <= step ? 1 : 0.2, transition: 'opacity 0.5s' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: i < step ? INK : 'transparent', border: `2px solid ${i <= step ? INK : BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {i < step && <span style={{ fontSize: 8, color: WHITE }}>✓</span>}
              {i === step && <div style={{ width: 6, height: 6, borderRadius: '50%', background: INK, animation: 'pulse 1s ease-in-out infinite' }} />}
            </div>
            <span style={{ fontSize: 12, color: i <= step ? INK : INK3 }}>{s}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.5)}}`}</style>
    </div>
  );
}

function AuditLockedPreview({ onUpgrade }) {
  return (
    <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto', position: 'relative', minHeight: 500 }}>
      {/* Blurred fake content */}
      <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.55 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Score crawl', val: '74/100', color: '#F59E0B' },
            { label: 'Problèmes', val: '12', color: '#EF4444' },
            { label: 'Pages indexées', val: '47', color: '#10B981' },
            { label: 'Performance', val: '61/100', color: '#3B8BEB' },
          ].map((c, i) => (
            <div key={i} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '18px 16px' }}>
              <div style={{ fontSize: 11, color: INK3, marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px', marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 5 ? `1px solid ${BORDER}` : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: i <= 2 ? '#EF4444' : '#F59E0B', flexShrink: 0 }} />
              <div style={{ height: 10, background: '#E8E7E4', borderRadius: 4, flex: 1 }} />
              <div style={{ height: 10, background: '#E8E7E4', borderRadius: 4, width: 60 }} />
            </div>
          ))}
        </div>
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 14, padding: '20px', height: 120 }} />
      </div>

      {/* Lock overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(247,246,243,0.65)', backdropFilter: 'blur(2px)' }}>
        <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '28px 32px', textAlign: 'center', maxWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.09)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${CORAL}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <Lock size={20} color={CORAL} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Technical audit</div>
          <div style={{ fontSize: 12, color: INK3, lineHeight: 1.6, margin: '0 0 20px' }}>
            Available from the <strong style={{ color: CORAL }}>Starter</strong> plan.<br />
            Full crawl, issue detection, pages crawled and performance.
          </div>
          <button onClick={onUpgrade}
            style={{ width: '100%', padding: '12px', background: INK, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F }}>
            Unlock the full audit
          </button>
          <div style={{ fontSize: 11, color: INK3, marginTop: 8 }}>No commitment · Cancel in 1 click</div>
        </div>
      </div>
    </div>
  );
}

export default function AuditPage() {
  const navigate = useNavigate();
  const { can, isFree } = usePlanFeatures();
  const [activeTab, setActiveTab] = useState('overview');
  const [auditData, setAuditData] = useState(null);
  const [phase, setPhase] = useState('loading');
  const [profile, setProfile] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const hasAuditAccess = can('audit_access');

  const loadAudit = async (forceRefresh = false) => {
    if (!hasAuditAccess) { setPhase('locked'); return; }

    try {
      const u = await base44.auth.me();
      if (!u) { setPhase('no_profile'); return; }

      const active = getActiveDomain();
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const p = active ? (profiles.find(pr => pr.site_url === active.url) || profiles[0]) : profiles[0];
      if (!p || !p.site_url) { setPhase('no_profile'); return; }
      setProfile(p);

      if (!forceRefresh) {
        const extra = await getProfileData(p);
        if (extra.audit_data && extra.audit_analyzed_at) {
          const age = Date.now() - new Date(extra.audit_analyzed_at).getTime();
          if (age < 24 * 60 * 60 * 1000) {
            setAuditData(extra.audit_data);
            setPhase('done');
            return;
          }
        }
      }

      setPhase('thinking');
      const res = await base44.functions.invoke('analyzeAudit', { url: p.site_url });
      if (!res?.data || res.data.error) { setPhase('error'); return; }

      setAuditData(res.data);
      setPhase('done');

      base44.entities.BusinessProfile.filter({ created_by_id: (await base44.auth.me().catch(() => null))?.id }).then(async ps => {
        if (!ps?.length) return;
        const fresh = await getProfileData(ps[0]);
        const merged = { ...fresh, audit_data: res.data, audit_analyzed_at: new Date().toISOString() };
        const brand_keywords = await uploadProfileData(merged);
        base44.entities.BusinessProfile.update(ps[0].id, { brand_keywords }).catch(() => {});
      }).catch(() => {});
    } catch {
      setPhase('error');
    }
  };

  useEffect(() => {
    loadAudit();
    const unsub = onActiveDomainChange(() => loadAudit());
    return unsub;
  }, [hasAuditAccess]);

  const siteUrl = profile?.site_url || '';
  const domain = siteUrl.replace(/https?:\/\//, '').split('/')[0];
  const analyzedAt = auditData?.analyzed_at
    ? new Date(auditData.analyzed_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F5', fontFamily: F, overscrollBehavior: 'none' }}>
      {/* Header */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '10px 20px', paddingTop: 'max(10px, env(safe-area-inset-top))', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={14} color="#555" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <ClipboardCheck size={15} color={INK} />
          <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Site audit</span>
          {domain && <span style={{ fontSize: 12, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domain}</span>}
          {isFree && (
            <span style={{ fontSize: 10, fontWeight: 700, color: CORAL, background: `${CORAL}12`, padding: '2px 8px', borderRadius: 20, flexShrink: 0 }}>
              Starter required
            </span>
          )}
        </div>

        {phase === 'done' && (
          <button onClick={() => loadAudit(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: F, marginLeft: 8, flexShrink: 0 }}>
            <RefreshCw size={11} /> Refresh
          </button>
        )}

        {(phase === 'done' || phase === 'locked') && (
          <div style={{ display: 'flex', gap: 2, marginLeft: 'auto', background: SURFACE, borderRadius: 8, padding: 3, flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button key={tab.id}
                onClick={() => phase === 'locked' ? setShowUpgrade(true) : setActiveTab(tab.id)}
                style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: activeTab === tab.id && phase !== 'locked' ? 600 : 400, background: activeTab === tab.id && phase !== 'locked' ? WHITE : 'transparent', color: phase === 'locked' ? INK3 : (activeTab === tab.id ? INK : INK3), boxShadow: activeTab === tab.id && phase !== 'locked' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {phase === 'loading' && <LoadingSkeleton />}
      {phase === 'thinking' && <ThinkingState url={siteUrl} />}
      {phase === 'locked' && <AuditLockedPreview onUpgrade={() => setShowUpgrade(true)} />}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center', fontFamily: F }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: INK, margin: '0 0 8px' }}>No site analyzed</p>
          <p style={{ fontSize: 13, color: INK3, margin: '0 0 20px' }}>Scan your site from the home page to unlock the full audit.</p>
          <button onClick={() => navigate('/app')} style={{ padding: '12px 24px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Go scan</button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center', fontFamily: F }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: INK, margin: '0 0 8px' }}>Audit failed</p>
          <p style={{ fontSize: 13, color: INK3, margin: '0 0 20px' }}>An error occurred during the analysis.</p>
          <button onClick={() => loadAudit(true)} style={{ padding: '12px 24px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Retry</button>
        </div>
      )}

      {phase === 'done' && auditData && (
        <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto' }}>
          {activeTab === 'overview'     && <AuditOverview     data={auditData} onNavigate={setActiveTab} />}
          {activeTab === 'crawlability' && <AuditCrawlability data={auditData} />}
          {activeTab === 'issues'       && <AuditIssues       data={auditData} />}
          {activeTab === 'pages'        && <AuditPages        data={auditData} />}
          {activeTab === 'performance'  && <AuditPerformance  data={auditData} />}
        </div>
      )}

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature="the full technical audit"
        requiredPlan="starter"
        description="The technical audit analyzes crawl, SEO issues, performance and pages crawled by AI engines. Available from the Starter plan."
      />
    </div>
  );
}