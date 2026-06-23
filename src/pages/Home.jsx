import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Globe, ChevronRight, BarChart2, ClipboardCheck, TrendingUp, ExternalLink } from 'lucide-react';
import { getActiveDomain, setActiveDomain, getDomainsList, saveDomainsList, onActiveDomainChange } from '@/lib/active-domain';
import { initUserCredits, checkAndRenewCredits } from '@/lib/credits';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0F0F10';
const INK2 = '#555';
const INK3 = '#999';
const BORDER = '#E8E7E4';
const SURFACE = '#F7F6F3';
const WHITE = '#FFFFFF';

// ── AI Engine pills ──────────────────────────────────────────────────────────
const MX = { mixBlendMode: 'multiply' };
const AI_ENGINES = [
  { label: 'ChatGPT',    logo: <svg width="14" height="14" viewBox="0 0 41 41" fill="none"><path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.99-3.136 10.079 10.079 0 0 0-9.618 6.977 9.967 9.967 0 0 0-6.69 4.839 10.081 10.081 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.99 3.135 10.078 10.078 0 0 0 9.617-6.976 9.967 9.967 0 0 0 6.691-4.839 10.079 10.079 0 0 0-1.24-11.818z" fill="#10A37F"/></svg>, bg: '#10A37F', plain: true },
  { label: 'Gemini',     logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/f300509ef_image.png" width="14" height="14" style={{ objectFit: 'contain' }} />, bg: 'transparent' },
  { label: 'Claude',     logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/3221a054f_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} />, bg: 'transparent' },
  { label: 'Perplexity', logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/1addf06ad_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} />, bg: 'transparent' },
  { label: 'Mistral',    logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/251e56634_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} />, bg: 'transparent' },
  { label: 'Llama',      logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/bfd4ab8b1_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} />, bg: 'transparent' },
  { label: 'Grok',       logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/1df5231e6_image.png" width="14" height="14" style={{ objectFit: 'contain', ...MX }} />, bg: 'transparent' },
  { label: 'Copilot',    logo: <img src="https://media.base44.com/images/public/6a2edc91082e534601118582/518c7e73f_image.png" width="14" height="14" style={{ objectFit: 'contain' }} />, bg: 'transparent' },
];

// ── Add Domain Modal ─────────────────────────────────────────────────────────
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: '24px', width: '100%', maxWidth: 380, position: 'relative', fontFamily: F }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: 'none', background: SURFACE, cursor: 'pointer', color: INK3 }}>
          <X size={13} />
        </button>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: INK, margin: '0 0 18px' }}>Ajouter un domaine</h2>
        <label style={{ fontSize: 11, fontWeight: 600, color: INK3, display: 'block', marginBottom: 5 }}>URL du site</label>
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
          placeholder="https://mon-site.com"
          style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: F, color: INK }} />
        <label style={{ fontSize: 11, fontWeight: 600, color: INK3, display: 'block', marginBottom: 5 }}>Nom (optionnel)</label>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Mon entreprise"
          style={{ width: '100%', padding: '9px 12px', fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 8, outline: 'none', boxSizing: 'border-box', marginBottom: 18, fontFamily: F, color: INK }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px 0', fontSize: 13, color: INK2, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, cursor: 'pointer', fontFamily: F }}>Annuler</button>
          <button onClick={submit} disabled={!url.trim()} style={{ flex: 2, padding: '9px 0', fontSize: 13, fontWeight: 700, color: WHITE, background: INK, border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: F, opacity: url.trim() ? 1 : 0.4 }}>Ajouter</button>
        </div>
      </div>
    </div>
  );
}

// ── Domain Row ───────────────────────────────────────────────────────────────
function DomainRow({ domain, active, onSelect, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const domainLabel = domain.url.replace(/https?:\/\//, '').split('/')[0];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderRadius: 10, cursor: 'pointer', transition: 'background 120ms',
        background: active ? INK : hovered ? SURFACE : WHITE,
        border: `1px solid ${active ? INK : BORDER}`,
      }}
      onClick={() => onSelect(domain)}
    >
      <div style={{ width: 28, height: 28, borderRadius: 7, background: active ? 'rgba(255,255,255,0.12)' : SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Globe size={13} color={active ? WHITE : INK3} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: active ? WHITE : INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domain.name || domainLabel}</div>
        <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.5)' : INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{domainLabel}</div>
      </div>
      {active && <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>Actif</div>}
      <button
        onClick={e => { e.stopPropagation(); onDelete(domain); }}
        style={{ width: 24, height: 24, borderRadius: 5, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 0.7 : 0, transition: 'opacity 120ms', flexShrink: 0 }}
      >
        <Trash2 size={12} color={active ? WHITE : '#EF4444'} />
      </button>
    </div>
  );
}

// ── Folder (tool) card ────────────────────────────────────────────────────────
function FolderCard({ label, icon: Icon, color, onClick, comingSoon }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={comingSoon ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 8, padding: '14px',
        background: hovered && !comingSoon ? SURFACE : WHITE,
        border: `1px solid ${BORDER}`, borderRadius: 12,
        cursor: comingSoon ? 'default' : 'pointer', transition: 'all 120ms',
        opacity: comingSoon ? 0.45 : 1,
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: INK, lineHeight: 1.3 }}>{label}</div>
      {comingSoon && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 8, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bientôt</div>}
    </div>
  );
}

// ── Scan hero (first-time empty state) ───────────────────────────────────────
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  const submit = () => {
    if (!url.trim()) return;
    onScan(url.trim());
  };
  return (
    <div style={{ textAlign: 'center', padding: '32px 16px 24px', fontFamily: F }}>
      {/* AI pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginBottom: 24 }}>
        {AI_ENGINES.map(({ label, logo, bg, plain }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px 4px 5px', background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 11, fontWeight: 500, color: '#444', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 18, height: 18, borderRadius: plain ? 5 : 0, background: plain ? bg : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{logo}</div>
            {label}
          </div>
        ))}
      </div>

      <h1 style={{ fontSize: 'clamp(22px, 5vw, 34px)', fontWeight: 800, color: INK, margin: '0 0 8px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
        Êtes-vous visible<br />sur les IA ?
      </h1>
      <p style={{ fontSize: 13, color: INK3, margin: '0 0 24px', lineHeight: 1.5 }}>
        Entrez votre URL — rapport complet en 60 secondes.
      </p>

      <div style={{ maxWidth: 480, margin: '0 auto', background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: `1px solid ${BORDER}` }}>
          <Globe size={13} color={INK3} style={{ marginRight: 8, flexShrink: 0 }} />
          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="https://votre-site.com"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: INK, fontFamily: F, minWidth: 0 }} />
        </div>
        <button onClick={submit} style={{ width: '100%', padding: '13px', background: INK, color: WHITE, border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
          Analyser mon site →
        </button>
      </div>
      <p style={{ fontSize: 11, color: INK3, marginTop: 10 }}>Gratuit · 8 moteurs IA analysés</p>
    </div>
  );
}

// ── MAIN ────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [domains, setDomains] = useState(() => getDomainsList());
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  const [showAddModal, setShowAddModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanUrl, setScanUrl] = useState('');

  // Sync active domain from store
  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) return;
      await initUserCredits(u).catch(() => {});
      const updated = await checkAndRenewCredits(u).catch(() => u);
      setUser(updated);
    }).catch(() => {});
  }, []);

  const handleAddDomain = (domain) => {
    const newList = [...domains, domain];
    setDomains(newList);
    saveDomainsList(newList);
    // Auto-activate if first domain
    if (newList.length === 1) {
      setActiveDomain(domain);
    }
  };

  const handleSelectDomain = (domain) => {
    setActiveDomain(domain);
  };

  const handleDeleteDomain = (domain) => {
    const newList = domains.filter(d => d.url !== domain.url);
    setDomains(newList);
    saveDomainsList(newList);
    if (activeDomain?.url === domain.url) {
      const next = newList[0] || null;
      setActiveDomain(next);
    }
  };

  const handleFirstScan = async (url) => {
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domainLabel = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    const newDomain = { url: cleanUrl, name: domainLabel };

    // Add to list + activate
    const existing = domains.find(d => d.url === cleanUrl);
    if (!existing) {
      const newList = [...domains, newDomain];
      setDomains(newList);
      saveDomainsList(newList);
    }
    setActiveDomain(newDomain);

    // Navigate directly to dashboard
    navigate('/ai-report');
  };

  const domain = activeDomain;
  const domainLabel = domain?.url?.replace(/https?:\/\//, '').split('/')[0];

  const TOOLS = [
    { label: 'Tableau de bord', icon: BarChart2, color: '#7C3AED', route: '/ai-report' },
    { label: 'Audit technique', icon: ClipboardCheck, color: '#0EA5E9', route: '/audit' },
    { label: 'Performance', icon: TrendingUp, color: '#10B981', route: '/performance' },
    { label: 'Visibilité IA', icon: Globe, color: '#6366F1', comingSoon: true },
    { label: 'Concurrents', icon: ChevronRight, color: '#EC4899', comingSoon: true },
    { label: 'Sentiment', icon: ExternalLink, color: '#EF4444', comingSoon: true },
  ];

  return (
    <div style={{ minHeight: '100vh', background: WHITE, fontFamily: F, overflowX: 'hidden' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 80px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '20px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: 0, letterSpacing: '-0.04em' }}>
              {domain ? (domain.name || domainLabel) : 'Stensor'}
            </h1>
            {domain && (
              <a href={domain.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: INK3, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                {domainLabel} <ExternalLink size={9} />
              </a>
            )}
          </div>
          {user?.role === 'admin' && (
            <button onClick={() => navigate('/admin')} style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${BORDER}`, background: WHITE, color: INK2, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
              Admin →
            </button>
          )}
        </div>

        {/* ── Empty state: no domain ── */}
        {!domain && domains.length === 0 && (
          <ScanHero onScan={handleFirstScan} />
        )}

        {/* ── Tools grid (when domain active) ── */}
        {domain && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Outils</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {TOOLS.map(tool => (
                <FolderCard
                  key={tool.label}
                  label={tool.label}
                  icon={tool.icon}
                  color={tool.color}
                  comingSoon={tool.comingSoon}
                  onClick={() => navigate(tool.route)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Domains section ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Domaines à surveiller
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}
            >
              <Plus size={11} /> Ajouter
            </button>
          </div>

          {domains.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', background: SURFACE, borderRadius: 12, border: `1px dashed ${BORDER}` }}>
              <Globe size={20} color={INK3} style={{ margin: '0 auto 8px', display: 'block' }} />
              <p style={{ fontSize: 13, color: INK3, margin: '0 0 12px' }}>Aucun domaine ajouté</p>
              <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 16px', background: INK, color: WHITE, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                Ajouter un domaine
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {domains.map(d => (
                <DomainRow
                  key={d.url}
                  domain={d}
                  active={activeDomain?.url === d.url}
                  onSelect={handleSelectDomain}
                  onDelete={handleDeleteDomain}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Scan button if domains exist but want to add/rescan ── */}
        {domains.length > 0 && (
          <div style={{ marginTop: 20, padding: '14px 16px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: INK }}>Analyser un nouveau site</div>
              <div style={{ fontSize: 11, color: INK3, marginTop: 1 }}>Ajouter et lancer le scan IA</div>
            </div>
            <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: INK, color: WHITE, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F, flexShrink: 0 }}>
              <Plus size={11} /> Nouveau
            </button>
          </div>
        )}
      </div>

      <AddDomainModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDomain} />
    </div>
  );
}