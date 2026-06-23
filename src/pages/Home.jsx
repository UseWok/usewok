import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2, Globe, ExternalLink, ArrowRight, Search, Zap, Link2, BarChart2, ClipboardCheck, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';
import { getActiveDomain, setActiveDomain, getDomainsList, saveDomainsList, onActiveDomainChange } from '@/lib/active-domain';

const F = 'Inter, system-ui, sans-serif';
const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const SURFACE = '#F7F7F5';
const WHITE = '#FFFFFF';

// ── Scan hero (empty state) ──────────────────────────────────────────────────
function ScanHero({ onScan }) {
  const [url, setUrl] = useState('');
  const AI_ENGINES = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity', 'Mistral', 'Llama', 'Grok', 'Copilot'];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: F, background: WHITE }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40, maxWidth: 380 }}>
        {AI_ENGINES.map(e => (
          <span key={e} style={{ fontSize: 11, fontWeight: 500, color: INK3, padding: '3px 8px', background: SURFACE, borderRadius: 20, border: `1px solid ${BORDER}` }}>{e}</span>
        ))}
      </div>

      <h1 style={{ fontSize: 'clamp(30px, 6vw, 48px)', fontWeight: 900, color: INK, margin: '0 0 12px', letterSpacing: '-0.04em', lineHeight: 1.05, textAlign: 'center', maxWidth: 500 }}>
        Êtes-vous recommandé<br />par les IA ?
      </h1>
      <p style={{ fontSize: 15, color: INK3, margin: '0 0 40px', lineHeight: 1.6, textAlign: 'center', maxWidth: 360 }}>
        Votre score LRS en 60 secondes — sur 8 moteurs IA simultanément.
      </p>

      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ background: WHITE, border: `1.5px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 18px', gap: 10 }}>
            <Globe size={15} color={INK3} style={{ flexShrink: 0 }} />
            <input value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && url.trim() && onScan(url.trim())}
              placeholder="https://votre-site.com"
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: INK, fontFamily: F, minWidth: 0 }} />
          </div>
          <button onClick={() => url.trim() && onScan(url.trim())}
            style={{ width: '100%', padding: '15px', background: INK, color: WHITE, border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: F, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Analyser ma visibilité IA <ArrowRight size={15} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: INK3, marginTop: 10, textAlign: 'center' }}>Gratuit · Résultat instantané · Aucune carte requise</p>
      </div>
    </div>
  );
}

// ── Score ring mini ──────────────────────────────────────────────────────────
function ScoreRing({ score, size = 44 }) {
  const R = size / 2 - 4;
  const circ = 2 * Math.PI * R;
  const c = score >= 65 ? '#10B981' : score >= 35 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="#F0F0F0" strokeWidth={3} />
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke={c} strokeWidth={3}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size < 50 ? 11 : 13, fontWeight: 900, color: INK, letterSpacing: '-0.03em' }}>{Math.round(score)}</span>
      </div>
    </div>
  );
}

// ── Add Domain Modal ─────────────────────────────────────────────────────────
function AddDomainModal({ open, onClose, onAdd }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const submit = () => {
    if (!url.trim()) return;
    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const domain = cleanUrl.replace(/https?:\/\//, '').split('/')[0];
    onAdd({ url: cleanUrl, name: name.trim() || domain });
    setUrl(''); setName(''); onClose();
  };
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: WHITE, borderRadius: 20, padding: '28px', width: '100%', maxWidth: 380, position: 'relative', fontFamily: F, boxShadow: '0 32px 80px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${BORDER}`, background: SURFACE, cursor: 'pointer' }}>
          <X size={13} color={INK3} />
        </button>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.03em' }}>Ajouter un domaine</h2>
        <p style={{ fontSize: 13, color: INK3, margin: '0 0 22px' }}>Surveillez n'importe quel site — le vôtre ou un concurrent.</p>
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoFocus
          placeholder="https://votre-site.com"
          style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: `1.5px solid ${BORDER}`, borderRadius: 11, outline: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: F, color: INK }} />
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Nom (optionnel)"
          style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: `1.5px solid ${BORDER}`, borderRadius: 11, outline: 'none', boxSizing: 'border-box', marginBottom: 20, fontFamily: F, color: INK }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', fontSize: 13, color: INK2, background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>Annuler</button>
          <button onClick={submit} disabled={!url.trim()}
            style={{ flex: 2, padding: '11px', fontSize: 13, fontWeight: 700, color: WHITE, background: url.trim() ? INK : '#ccc', border: 'none', borderRadius: 10, cursor: url.trim() ? 'pointer' : 'not-allowed', fontFamily: F }}>
            Ajouter et analyser
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [domains, setDomains] = useState(() => getDomainsList());
  const [activeDomain, setActiveDomainState] = useState(() => getActiveDomain());
  const [domainProfiles, setDomainProfiles] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const unsub = onActiveDomainChange(d => setActiveDomainState(d));
    return unsub;
  }, []);

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setUser(u); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!domains.length) return;
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
    }).catch(() => {});
  }, [domains.map(d => d.url).join(',')]);

  const handleAddDomain = (domain) => {
    const newList = [...domains, domain];
    setDomains(newList);
    saveDomainsList(newList);
    if (newList.length === 1) setActiveDomain(domain);
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

  if (domains.length === 0) {
    return (
      <>
        <ScanHero onScan={handleFirstScan} />
        <AddDomainModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDomain} />
      </>
    );
  }

  const domain = activeDomain;
  const domainLabel = domain?.url?.replace(/https?:\/\//, '').split('/')[0] || '';
  const activeProfile = domain ? domainProfiles[domain.url] : null;
  const lrs = Math.round(activeProfile?.lrs_score || activeProfile?.overall_score || 0);
  const hasData = !!activeProfile;

  const ACTIONS = [
    { label: 'Rapport IA', desc: 'LRS · moteurs · injection', icon: BarChart2, route: '/ai-report', primary: true },
    { label: 'Audit', desc: 'Technique & crawl', icon: ClipboardCheck, route: '/audit' },
    { label: 'Performance', desc: 'Share of voice', icon: TrendingUp, route: '/performance' },
    { label: 'Connexions', desc: 'GSC · Analytics', icon: Link2, route: '/connections' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: WHITE, fontFamily: F }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 100px' }}>

        {/* ── Header ── */}
        <div style={{ padding: '24px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              {domain && <img src={`https://www.google.com/s2/favicons?domain=${domainLabel}&sz=32`} alt="" width={20} height={20} style={{ borderRadius: 4 }} onError={e => { e.target.style.display = 'none'; }} />}
              <h1 style={{ fontSize: 20, fontWeight: 900, color: INK, margin: 0, letterSpacing: '-0.04em' }}>
                {domain ? (domain.name || domainLabel) : 'Accueil'}
              </h1>
            </div>
            {domain && (
              <a href={domain.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: INK3, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                {domainLabel} <ExternalLink size={9} />
              </a>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {user?.role === 'admin' && (
              <button onClick={() => navigate('/admin')} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: WHITE, color: INK2, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Admin</button>
            )}
          </div>
        </div>

        {/* ── LRS Score Card ── */}
        {domain && (
          <div style={{ marginBottom: 20 }}>
            {hasData ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/ai-report')}
                style={{ background: INK, borderRadius: 20, padding: '22px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                {/* ambient glow */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${lrs >= 65 ? '#10B98120' : lrs >= 35 ? '#F59E0B20' : '#EF444420'} 0%, transparent 70%)`, pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 16 }}>LLM Resonance Score™</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: 64, fontWeight: 900, color: WHITE, letterSpacing: '-0.06em', lineHeight: 1 }}>{lrs}</span>
                      <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', fontWeight: 500, marginLeft: 4 }}>/100</span>
                    </div>
                    <div style={{ paddingBottom: 10, flex: 1 }}>
                      {/* Mini engine bars */}
                      {['chatgpt', 'gemini', 'claude'].map((k, i) => {
                        const s = activeProfile[`${k}_score`] || 0;
                        return (
                          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < 2 ? 4 : 0 }}>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', width: 46, fontWeight: 600 }}>{k.charAt(0).toUpperCase() + k.slice(1)}</span>
                            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                              <div style={{ height: '100%', width: `${s}%`, background: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', width: 16, textAlign: 'right', fontWeight: 700 }}>{s}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {activeProfile.shock_insight && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '0 0 14px', lineHeight: 1.5 }}>
                      {activeProfile.shock_insight.slice(0, 90)}{activeProfile.shock_insight.length > 90 ? '…' : ''}
                    </p>
                  )}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>
                    Voir le rapport complet <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate('/ai-report')}
                style={{ background: SURFACE, borderRadius: 20, padding: '22px', cursor: 'pointer', border: `1.5px dashed ${BORDER}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: WHITE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle size={22} color={INK3} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 3px' }}>Aucun rapport généré</p>
                    <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Cliquez pour analyser votre visibilité sur les 8 moteurs IA</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', background: INK, borderRadius: 10, fontSize: 12, fontWeight: 700, color: WHITE, flexShrink: 0 }}>
                    Analyser <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        {domain && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Modules d'analyse</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {ACTIONS.map(a => (
                <button key={a.label} onClick={() => navigate(a.route)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                    background: a.primary ? INK : WHITE,
                    border: `1px solid ${a.primary ? INK : BORDER}`,
                    textAlign: 'left', fontFamily: F,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: a.primary ? 'rgba(255,255,255,0.1)' : SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <a.icon size={16} color={a.primary ? WHITE : INK2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: a.primary ? WHITE : INK }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: a.primary ? 'rgba(255,255,255,0.4)' : INK3, marginTop: 1 }}>{a.desc}</div>
                  </div>
                  <ChevronRight size={13} color={a.primary ? 'rgba(255,255,255,0.3)' : BORDER} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Domain switcher ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Domaines</p>
            <button onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: `1px solid ${BORDER}`, borderRadius: 7, background: WHITE, fontSize: 11, fontWeight: 600, color: INK2, cursor: 'pointer', fontFamily: F }}>
              <Plus size={10} /> Ajouter
            </button>
          </div>

          <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden' }}>
            {domains.map((d, i) => {
              const p = domainProfiles[d.url];
              const score = Math.round(p?.lrs_score || p?.overall_score || 0);
              const isActive = activeDomain?.url === d.url;
              const label = d.url.replace(/https?:\/\//, '').split('/')[0];
              return (
                <div key={d.url}
                  onClick={() => setActiveDomain(d)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer',
                    background: isActive ? SURFACE : WHITE,
                    borderBottom: i < domains.length - 1 ? `1px solid ${BORDER}` : 'none',
                    transition: 'background 0.12s',
                  }}>
                  <img src={`https://www.google.com/s2/favicons?domain=${label}&sz=32`} alt="" width={28} height={28} style={{ borderRadius: 7, flexShrink: 0 }} onError={e => { e.target.style.opacity = '0'; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name || label}</div>
                    <div style={{ fontSize: 11, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                  </div>
                  {score > 0 && <ScoreRing score={score} size={40} />}
                  {isActive && <div style={{ width: 7, height: 7, borderRadius: '50%', background: INK, flexShrink: 0 }} />}
                  <button onClick={e => { e.stopPropagation(); handleDeleteDomain(d); }}
                    style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: 0.3 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}>
                    <Trash2 size={12} color="#EF4444" />
                  </button>
                </div>
              );
            })}
            {/* Add row */}
            <div onClick={() => setShowAddModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer', background: WHITE, borderTop: `1px solid ${BORDER}`, transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = SURFACE}
              onMouseLeave={e => e.currentTarget.style.background = WHITE}>
              <div style={{ width: 28, height: 28, borderRadius: 7, border: `1.5px dashed ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={12} color={INK3} />
              </div>
              <span style={{ fontSize: 13, color: INK3, fontWeight: 500 }}>Surveiller un nouveau domaine</span>
            </div>
          </div>
        </div>
      </div>

      <AddDomainModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddDomain} />
    </div>
  );
}