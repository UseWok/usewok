import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuditOverview from '../components/audit/AuditOverview';
import AuditCrawlability from '../components/audit/AuditCrawlability';
import AuditIssues from '../components/audit/AuditIssues';
import AuditPages from '../components/audit/AuditPages';
import AuditPerformance from '../components/audit/AuditPerformance';

const TABS = [
  { id: 'overview',      label: 'Vue d\'ensemble' },
  { id: 'crawlability',  label: 'Explorabilité' },
  { id: 'issues',        label: 'Problèmes' },
  { id: 'pages',         label: 'Pages explorées' },
  { id: 'performance',   label: 'Performances' },
];

const F = 'Inter, system-ui, sans-serif';
const INK = '#111111';
const INK3 = '#999999';
const BORDER = '#E8E7E4';
const WHITE = '#FFFFFF';
const SURFACE = '#F7F6F3';

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
    'Récupération du HTML et des en-têtes HTTP…',
    'Lecture du robots.txt et du sitemap.xml…',
    'Analyse des balises SEO et de la structure…',
    'Détection des problèmes techniques…',
    'Simulation de crawl IA…',
    'Génération du rapport complet…',
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
      <p style={{ fontSize: 16, fontWeight: 700, color: INK, margin: '0 0 4px' }}>Audit en cours…</p>
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

export default function AuditPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [auditData, setAuditData] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | thinking | done | no_profile | error
  const [profile, setProfile] = useState(null);

  const loadAudit = async (forceRefresh = false) => {
    try {
      const u = await base44.auth.me();
      if (!u) { setPhase('no_profile'); return; }

      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      if (!profiles.length || !profiles[0].site_url) { setPhase('no_profile'); return; }

      const p = profiles[0];
      setProfile(p);

      // Try cache first (24h TTL)
      if (!forceRefresh) {
        let extra = {};
        try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
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

      // Re-read freshest brand_keywords before merging to avoid overwriting concurrent writes
      base44.entities.BusinessProfile.filter({ created_by_id: (await base44.auth.me().catch(() => null))?.id }).then(ps => {
        if (!ps?.length) return;
        let fresh = {};
        try { fresh = JSON.parse(ps[0].brand_keywords || '{}'); } catch {}
        const merged = { ...fresh, audit_data: res.data, audit_analyzed_at: new Date().toISOString() };
        base44.entities.BusinessProfile.update(ps[0].id, { brand_keywords: JSON.stringify(merged) }).catch(() => {});
      }).catch(() => {});
    } catch {
      setPhase('error');
    }
  };

  useEffect(() => { loadAudit(); }, []);

  const siteUrl = profile?.site_url || '';
  const domain = siteUrl.replace(/https?:\/\//, '').split('/')[0];
  const analyzedAt = auditData?.analyzed_at
    ? new Date(auditData.analyzed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: F }}>
      {/* Header */}
      <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate('/app')} style={{ width: 32, height: 32, borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ArrowLeft size={14} color="#555" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <ClipboardCheck size={15} color={INK} />
          <span style={{ fontSize: 14, fontWeight: 700, color: INK }}>Audit de site</span>
          {domain && <span style={{ fontSize: 12, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domain}</span>}
          {analyzedAt && <span style={{ fontSize: 10, color: INK3, display: 'none', whiteSpace: 'nowrap' }}>· {analyzedAt}</span>}
        </div>

        {phase === 'done' && (
          <button onClick={() => loadAudit(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, fontSize: 11, fontWeight: 600, color: '#555', cursor: 'pointer', fontFamily: F, marginLeft: 8, flexShrink: 0 }}>
            <RefreshCw size={11} /> Actualiser
          </button>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginLeft: 'auto', background: SURFACE, borderRadius: 8, padding: 3, flexWrap: 'wrap' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 12, fontWeight: activeTab === tab.id ? 600 : 400, background: activeTab === tab.id ? WHITE : 'transparent', color: activeTab === tab.id ? INK : INK3, boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 150ms', whiteSpace: 'nowrap' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {phase === 'loading' && <LoadingSkeleton />}
      {phase === 'thinking' && <ThinkingState url={siteUrl} />}

      {phase === 'no_profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center', fontFamily: F }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔍</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: INK, margin: '0 0 8px' }}>Aucun site analysé</p>
          <p style={{ fontSize: 13, color: INK3, margin: '0 0 20px' }}>Scannez votre site depuis l'accueil pour débloquer l'audit complet.</p>
          <button onClick={() => navigate('/app')} style={{ padding: '12px 24px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>← Aller scanner</button>
        </div>
      )}

      {phase === 'error' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: 32, textAlign: 'center', fontFamily: F }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 17, fontWeight: 700, color: INK, margin: '0 0 8px' }}>Audit échoué</p>
          <p style={{ fontSize: 13, color: INK3, margin: '0 0 20px' }}>Une erreur s'est produite lors de l'analyse.</p>
          <button onClick={() => loadAudit(true)} style={{ padding: '12px 24px', background: INK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Réessayer</button>
        </div>
      )}

      {/* Content — only when done */}
      {phase === 'done' && auditData && (
        <div style={{ padding: '20px', maxWidth: 1100, margin: '0 auto' }}>
          {activeTab === 'overview'     && <AuditOverview     data={auditData} onNavigate={setActiveTab} />}
          {activeTab === 'crawlability' && <AuditCrawlability data={auditData} />}
          {activeTab === 'issues'       && <AuditIssues       data={auditData} />}
          {activeTab === 'pages'        && <AuditPages        data={auditData} />}
          {activeTab === 'performance'  && <AuditPerformance  data={auditData} />}
        </div>
      )}
    </div>
  );
}