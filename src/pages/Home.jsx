import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Trash2, Globe, ChevronRight, BarChart2, ClipboardCheck,
  TrendingUp, ExternalLink, ArrowRight, Search, Zap, Link2
} from 'lucide-react';
import { getActiveDomain, setActiveDomain, getDomainsList, saveDomainsList, onActiveDomainChange } from '@/lib/active-domain';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#EFEFEF';
const SURFACE = '#F9F8F6';
const WHITE = '#FFFFFF';
const VIOLET = '#7C3AED';

// ── AI Engine pills ─────────────────────────────────────────────────────────
const AI_ENGINES = [
  { label: 'ChatGPT',    color: '#10A37F', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/chatgpt_logo.png', fallbackColor: '#10A37F' },
  { label: 'Gemini',     color: '#4285F4', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png' },
  { label: 'Claude',     color: '#C96442', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png' },
  { label: 'Perplexity', color: '#20808D', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png' },
  { label: 'Mistral',    color: '#F97316', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png' },
  { label: 'Llama',      color: '#0064E0', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png' },
  { label: 'Grok',       color: '#1DA1F2', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png' },
  { label: 'Copilot',    color: '#7B5EA7', logo: 'https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png' },
];

// ── URL Scan hero (first-time empty state) ──────────────────────────────────
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', fontFamily: F }}>

      {/* AI engine pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginBottom: 32, maxWidth: 420 }}>
        {AI_ENGINES.map(({ label, color, logo }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px 3px 5px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 11, fontWeight: 500, color: INK2, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            {logo ? (
              <img src={logo} alt={label} width={16} height={16} style={{ objectFit: 'contain', borderRadius: 3, flexShrink: 0 }}
                onError={e => { e.target.style.display = 'none'; }} />
            ) : (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
            )}
            {label}
          </div>
        ))}
      </div>

      {/* Title */}
      <h1 style={{ fontSize: 'clamp(28px, 6vw, 46px)', fontWeight: 900, color: INK, margin: '0 0 10px', letterSpacing: '-0.04em', lineHeight: 1.05, textAlign: 'center', maxWidth: 480 }}>
        Êtes-vous visible<br />sur les IA ?
      </h1>
      <p style={{ fontSize: 14, color: INK3, margin: '0 0 32px', lineHeight: 1.6, textAlign: 'center', maxWidth: 340 }}>
        Scannez votre site — rapport LRS complet en 60 secondes sur 8 moteurs IA.
      </p>

      {/* Input card */}
      <div style={{ width: '100%', maxWidth: 460, background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 10 }}>
          <Globe size={14} color={INK3} style={{ flexShrink: 0 }} />
          <input value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && url.trim() && onScan(url.trim())}
            placeholder="https://votre-site.com"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: INK, fontFamily: F, minWidth: 0 }} />
        </div>
        <button onClick={() => url.trim() && onScan(url.trim())}
          style={{ width: '100%', padding: '14px', background: INK, color: WHITE, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.15s', letterSpacing: '-0.01em' }}>
          Analyser maintenant <ArrowRight size={15} />
        </button>
      </div>
      <p style={{ fontSize: 11, color: INK3, marginTop: 12 }}>Gratuit · 8 moteurs IA analysés · Résultat instantané</p>
    </motion.div>
  );
}

// ── Domain score mini card ──────────────────────────────────────────────────
function DomainMiniCard({ domain, active, profile, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const label = domain.url.replace(/https?:\/\//, '').split('/')[0];
  const lrs = profile?.lrs_score || profile?.overall_score || null;
  const trend = profile?.lrs_trend;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(domain)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
        background: active ? INK : hovered ? SURFACE : WHITE,
        border: `1px solid ${active ? INK : BORDER}`,
        transition: 'all 0.15s',
      }}
    >
      {/* Favicon */}
      <div style={{ width: 36, height: 36, borderRadius: 9, background: active ? 'rgba(255,255,255,0.1)' : SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
        <img
          src={`https://www.google.com/s2/favicons?domain=${label}&sz=32`}
          alt="" width={20} height={20} style={{ borderRadius: 3 }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: active ? WHITE : INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {domain.name || label}
          </span>
          {active && <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>Actif</span>}
        </div>
        <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.4)' : INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
      </div>

      {/* LRS score pill */}
      {lrs != null && (
        <div style={{
          flexShrink: 0, padding: '4px 10px', borderRadius: 20,
          background: active ? 'rgba(255,255,255,0.12)' : SURFACE,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: active ? WHITE : INK, lineHeight: 1 }}>{Math.round(lrs)}</span>
          <span style={{ fontSize: 8, fontWeight: 600, color: active ? 'rgba(255,255,255,0.4)' : INK3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>LRS</span>
        </div>
      )}

      <button
        onClick={e => { e.stopPropagation(); onDelete(domain); }}
        style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 0.7 : 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
        <Trash2 size={12} color={active ? WHITE : '#EF4444'} />
      </button>
    </motion.div>
  );
}

// ── Add Domain Modal ────────────────────────────────────────────────────────
function AddDomainModal({ open, onClose, onAdd }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');

  const submit = () => {
    if (!url.trim()) return;
    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const domain = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    onAdd({ url: cleanUrl, name: name.trim() || domain });
    setUrl(''); setName('');
    onClose();
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 18, padding: '24px', width: '100%', maxWidth: 380, position: 'relative', fontFamily: F, boxShadow: '0 24px 80px rgba(0,0,0,0.15)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, border: 'none', background: SURFACE, cursor: 'pointer', color: INK3 }}>
          <X size={13} />
        </button>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: INK, margin: '0 0 20px', letterSpacing: '-0.02em' }}>Surveiller un domaine</h2>

        <label style={{ fontSize: 11, fontWeight: 600, color: INK3, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>URL du site</label>
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
          placeholder="https://concurrent.com"
          style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: `1.5px solid ${BORDER}`, borderRadius: 9, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: F, color: INK }} />

        <label style={{ fontSize: 11, fontWeight: 600, color: INK3, display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom (optionnel)</label>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Mon concurrent principal"
          style={{ width: '100%', padding: '10px 12px', fontSize: 13, border: `1.5px solid ${BORDER}`, borderRadius: 9, outline: 'none', boxSizing: 'border-box', marginBottom: 20, fontFamily: F, color: INK }} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', fontSize: 13, color: INK2, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 9, cursor: 'pointer', fontFamily: F }}>Annuler</button>
          <button onClick={submit} disabled={!url.trim()}
            style={{ flex: 2, padding: '10px 0', fontSize: 13, fontWeight: 700, color: WHITE, background: INK, border: 'none', borderRadius: 9, cursor: 'pointer', fontFamily: F, opacity: url.trim() ? 1 : 0.4 }}>
            Ajouter
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Tool card ───────────────────────────────────────────────────────────────
function ToolCard({ label, icon: Icon, color, onClick, comingSoon, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={comingSoon ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 14px', borderRadius: 14, cursor: comingSoon ? 'default' : 'pointer',
        background: hovered && !comingSoon ? SURFACE : WHITE,
        border: `1px solid ${BORDER}`, transition: 'all 0.15s',
        opacity: comingSoon ? 0.45 : 1, position: 'relative',
      }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: INK, marginBottom: 2 }}>{label}</div>
      {desc && <div style={{ fontSize: 10, color: INK3 }}>{desc}</div>}
      {comingSoon && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 8, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Soon</div>}
    </div>
  );
}

// ── MAIN ───────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [domains, setDomains] = useState(() => getDomainsList());
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  const [domainProfiles, setDomainProfiles] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) setUser(u);
    }).catch(() => {});
  }, []);

  // Load LRS scores for all domains
  useEffect(() => {
    if (!domains.length) return;
    setLoadingProfiles(true);
    base44.auth.me().then(async u => {
      if (!u) return;
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      const map = {};
      for (const d of domains) {
        const match = profiles.find(p => p.site_url === d.url);
        if (match) {
          let extra = {};
          try { extra = JSON.parse(match.brand_keywords || '{}'); } catch {}
          map[d.url] = { ...match, ...extra };
        }
      }
      setDomainProfiles(map);
      setLoadingProfiles(false);
    }).catch(() => setLoadingProfiles(false));
  }, [domains.map(d => d.url).join(',')]);

  const handleAddDomain = (domain) => {
    const newList = [...domains, domain];
    setDomains(newList);
    saveDomainsList(newList);
    if (newList.length === 1) setActiveDomain(domain);
  };

  const handleSelectDomain = (domain) => {
    setActiveDomain(domain);
  };

  const handleDeleteDomain = (domain) => {
    const newList = domains.filter(d => d.url !== domain.url);
    setDomains(newList);
    saveDomainsList(newList);
    if (activeDomain?.url === domain.url) setActiveDomain(newList[0] || null);
  };

  const handleFirstScan = (url) => {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const label = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    const newDomain = { url: cleanUrl, name: label };
    if (!domains.find(d => d.url === cleanUrl)) {
      const newList = [...domains, newDomain];
      setDomains(newList);
      saveDomainsList(newList);
    }
    setActiveDomain(newDomain);
    navigate('/ai-report');
  };

  const domain = activeDomain;
  const domainLabel = domain?.url?.replace(/https?:\/\//, '').split('/')[0];
  const activeProfile = domain ? domainProfiles[domain.url] : null;

  const TOOLS = [
    { label: 'Tableau de bord', icon: BarChart2, color: VIOLET, route: '/ai-report', desc: 'LRS & rapport IA' },
    { label: 'Audit technique', icon: ClipboardCheck, color: '#0EA5E9', route: '/audit', desc: 'SEO & crawl' },
    { label: 'Performance', icon: TrendingUp, color: '#10B981', route: '/performance', desc: 'Share of voice' },
    { label: 'Concurrents', icon: Search, color: '#EC4899', route: null, comingSoon: true, desc: 'Benchmark' },
    { label: 'Tracking LRS', icon: Zap, color: '#F59E0B', route: null, comingSoon: true, desc: 'Suivi dans le temps' },
    { label: 'Connexions', icon: Link2, color: '#6366F1', route: '/connections', desc: 'GSC · Analytics' },
  ];

  // Show scan hero if no domains
  if (domains.length === 0) {
    return (
      <div style={{ fontFamily: F }}>
        <ScanHero onScan={handleFirstScan} />
        <AddDomainModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDomain} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: WHITE, fontFamily: F }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 100px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '22px 0 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              {domain && (
                <img src={`https://www.google.com/s2/favicons?domain=${domainLabel}&sz=32`} alt="" width={22} height={22} style={{ borderRadius: 5 }} onError={e => { e.target.style.display = 'none'; }} />
              )}
              <h1 style={{ fontSize: 22, fontWeight: 900, color: INK, margin: 0, letterSpacing: '-0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {domain ? (domain.name || domainLabel) : 'Stensor'}
              </h1>
            </div>
            {domain && (
              <a href={domain.url} target="_blank" rel="noreferrer"
                style={{ fontSize: 12, color: INK3, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {domainLabel} <ExternalLink size={9} />
              </a>
            )}
          </div>

          <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: INK2, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                Admin
              </button>
            )}
          </div>
        </div>

        {/* ── LRS Hero (if active domain has data) ── */}
        {domain && activeProfile && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: INK, borderRadius: 18, padding: '20px', marginBottom: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            onClick={() => navigate('/ai-report')}>
            {/* glow */}
            <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: '-0.04em' }}>
                  {Math.round(activeProfile.lrs_score || activeProfile.overall_score || 0)}
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>LRS</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', marginBottom: 7 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#34D399' }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>LLM Resonance Score™</span>
                </div>
                {activeProfile.shock_insight && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '0 0 10px', lineHeight: 1.5 }}>
                    {activeProfile.shock_insight.slice(0, 100)}{activeProfile.shock_insight.length > 100 ? '…' : ''}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                  Voir le rapport complet <ArrowRight size={11} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── CTA to scan if domain exists but no profile ── */}
        {domain && !activeProfile && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: INK, borderRadius: 18, padding: '20px', marginBottom: 16, cursor: 'pointer' }}
            onClick={() => navigate('/ai-report')}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: WHITE, margin: '0 0 4px' }}>Générer votre rapport IA</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Analyse LRS + 8 moteurs + injection plan</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', background: WHITE, borderRadius: 10, fontSize: 12, fontWeight: 700, color: INK, flexShrink: 0 }}>
                Scanner <ArrowRight size={12} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Tools grid ── */}
        {domain && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 10px' }}>Outils d'analyse</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {TOOLS.map(t => (
                <ToolCard key={t.label} label={t.label} icon={t.icon} color={t.color} desc={t.desc} comingSoon={t.comingSoon} onClick={() => t.route && navigate(t.route)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Domains to monitor ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.09em', margin: 0 }}>
              Domaines surveillés
            </p>
            <button onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer' }}>
              <Plus size={11} /> Ajouter
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {domains.map(d => (
              <DomainMiniCard key={d.url} domain={d} active={activeDomain?.url === d.url}
                profile={domainProfiles[d.url] || null}
                onSelect={handleSelectDomain} onDelete={handleDeleteDomain} />
            ))}
          </div>

          {/* Add new scan */}
          <div onClick={() => setShowAddModal(true)}
            style={{ marginTop: 10, padding: '12px 14px', borderRadius: 12, border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = SURFACE}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} color={INK3} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: INK2 }}>Surveiller un nouveau domaine</div>
              <div style={{ fontSize: 11, color: INK3 }}>Ajouter un concurrent ou un autre site</div>
            </div>
          </div>
        </div>
      </div>

      <AddDomainModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDomain} />
    </div>
  );
}