import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Zap, Globe, Trash2, Plus, Sparkles, Loader, Check } from 'lucide-react';
import { getCachedProfiles, invalidateProfiles } from '@/lib/data-cache';
import { setActiveDomain, getActiveDomain } from '@/lib/active-domain';

const F = "'Wix Madefor Text','Wix Madefor Display',system-ui,sans-serif";
const INK = '#1A1814';
const INK2 = '#857E6E';
const INK3 = '#A8A49F';
const BORDER = 'rgba(21,19,15,0.12)';
const WHITE = '#FFFFFF';
const CARD_BG = '#15130F';
const CORAL = '#FF5A1F';
const BG = '#F7F5F0';

const getDomain = (url) => (url || '').replace(/https?:\/\//, '').split('/')[0];

const AV_COLORS = ['#9CA3AF', CORAL, '#4B83DB', '#22A87A', '#8B5CF6', '#D97706'];
function avatarBg(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AV_COLORS[Math.abs(h) % AV_COLORS.length];
}
function initials(name) {
  const p = (name || '').trim().split(/[\s\-\.]+/);
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase();
  return (name || '??').slice(0, 2).toUpperCase();
}

/**
 * Playful, modern domain manager.
 * Two friendly actions at the top of the settings popover:
 *  - "Add a website" → type a link, it scans automatically (based on plan)
 *  - "My websites" → switch active site or remove one
 */
export default function DomainManagerModal({ open, onClose, tab = 'add', user, maxDomains = 1, scanningUrls = {} }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState(getActiveDomain()?.url || null);

  useEffect(() => { setActiveTab(tab); }, [tab, open]);

  const loadProfiles = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const list = await getCachedProfiles(user.id);
      setProfiles(list || []);
    } catch { setProfiles([]); }
    setLoading(false);
  };

  useEffect(() => { if (open) { loadProfiles(); setUrl(''); setActiveUrl(getActiveDomain()?.url || null); } }, [open, user?.id]);

  const atLimit = profiles.length >= maxDomains;

  const handleAdd = () => {
    const raw = url.trim();
    if (!raw) return;
    const clean = raw.startsWith('http') ? raw : `https://${raw}`;
    setUrl('');
    onClose();
    // Home knows how to auto-scan from this navigation state (based on the user's plan).
    navigate('/app', { state: { autoScan: clean } });
  };

  const handleSwitch = (p) => {
    setActiveUrl(p.site_url);
    setActiveDomain({ url: p.site_url, name: p.identity_name || getDomain(p.site_url) });
    onClose();
    navigate('/app');
    setTimeout(() => window.location.reload(), 50);
  };

  const handleDelete = async (p, e) => {
    e.stopPropagation();
    try {
      if (p.id) await base44.entities.BusinessProfile.delete(p.id);
      invalidateProfiles(user?.id);
      setProfiles(prev => prev.filter(x => x.site_url !== p.site_url));
    } catch {}
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setActiveTab(id)}
      style={{
        flex: 1, padding: '10px 12px', border: 'none', cursor: 'pointer', fontFamily: F,
        fontSize: 13, fontWeight: 700, borderRadius: 10,
        background: activeTab === id ? WHITE : 'transparent',
        color: activeTab === id ? INK : INK2,
        boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
        transition: 'all 140ms',
      }}>
      {label}
    </button>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(21,19,15,0.45)', backdropFilter: 'blur(8px)' }} />
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 10001, width: '100%', maxWidth: 440, padding: '0 16px', fontFamily: F }}>
            <div style={{ background: WHITE, borderRadius: 24, overflow: 'hidden' }}>

              {/* Header */}
              <div style={{ background: CARD_BG, padding: '24px 24px 20px', position: 'relative' }}>
                <button onClick={onClose}
                  style={{ position: 'absolute', top: 18, right: 18, width: 30, height: 30, borderRadius: 9, border: 'none', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <X size={15} color="rgba(255,255,255,0.6)" />
                </button>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: `${CORAL}22`, border: `1px solid ${CORAL}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Globe size={20} color={CORAL} strokeWidth={1.9} />
                </div>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: WHITE, margin: '0 0 5px', letterSpacing: '-0.03em' }}>Your websites</h2>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
                  Add a site and we'll check how AI sees it — automatically.
                </p>
              </div>

              {/* Tabs */}
              <div style={{ padding: '14px 16px 0' }}>
                <div style={{ display: 'flex', gap: 4, padding: 4, background: BG, borderRadius: 13 }}>
                  {tabBtn('add', '＋ Add a website')}
                  {tabBtn('manage', `My websites · ${profiles.length}`)}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '18px 20px 22px' }}>
                {activeTab === 'add' ? (
                  <div>
                    {atLimit ? (
                      <div style={{ textAlign: 'center', padding: '10px 0 4px' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 6px' }}>You've reached your limit</p>
                        <p style={{ fontSize: 13, color: INK2, margin: '0 0 14px', lineHeight: 1.5 }}>
                          Your plan allows {maxDomains} website{maxDomains > 1 ? 's' : ''}. Remove one or upgrade to add more.
                        </p>
                        <button onClick={() => setActiveTab('manage')}
                          style={{ padding: '10px 18px', background: INK, color: WHITE, border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                          Manage my websites
                        </button>
                      </div>
                    ) : (
                      <>
                        <label style={{ fontSize: 12, fontWeight: 700, color: INK2, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Website address</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '4px 4px 4px 14px', marginBottom: 12 }}>
                          <Globe size={15} color={INK3} style={{ flexShrink: 0 }} />
                          <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} autoFocus
                            placeholder="yourwebsite.com"
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14, color: INK, fontFamily: F, minWidth: 0 }} />
                          <button onClick={handleAdd} disabled={!url.trim()}
                            style={{ width: 38, height: 38, borderRadius: 10, background: url.trim() ? CORAL : '#D8D3C7', border: 'none', cursor: url.trim() ? 'pointer' : 'default', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <Zap size={15} color={WHITE} strokeWidth={2.2} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '11px 13px', background: '#F0F9F4', border: '1px solid #C6EAD5', borderRadius: 11 }}>
                          <Sparkles size={14} color="#22A87A" style={{ flexShrink: 0, marginTop: 1 }} />
                          <span style={{ fontSize: 12.5, color: '#166B44', lineHeight: 1.5 }}>
                            We'll instantly scan it across the AI engines. No setup needed.
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    {loading ? (
                      <p style={{ fontSize: 13, color: INK3, textAlign: 'center', padding: '20px 0' }}>Loading…</p>
                    ) : profiles.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 6px' }}>No website yet</p>
                        <p style={{ fontSize: 13, color: INK2, margin: '0 0 14px' }}>Add your first website to get started.</p>
                        <button onClick={() => setActiveTab('add')}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: CORAL, color: WHITE, border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: F }}>
                          <Plus size={13} /> Add a website
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {profiles.map(p => {
                          const lbl = getDomain(p.site_url);
                          const name = p.identity_name || lbl;
                          const isActive = activeUrl === p.site_url;
                          const isScanning = !!scanningUrls[p.site_url];
                          return (
                            <div key={p.site_url} onClick={() => handleSwitch(p)}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, cursor: 'pointer', background: isActive ? '#F2EBD9' : BG, border: `1px solid ${isActive ? CORAL : BORDER}`, transition: 'all 120ms' }}>
                              <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarBg(lbl), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: WHITE }}>{initials(name)}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: INK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                                <div style={{ fontSize: 12, color: INK3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lbl}</div>
                              </div>
                              {isScanning ? (
                                <Loader size={15} color={CORAL} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                              ) : isActive ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', background: CORAL, borderRadius: 20, flexShrink: 0 }}>
                                  <Check size={10} color={WHITE} strokeWidth={3} />
                                  <span style={{ fontSize: 10.5, fontWeight: 700, color: WHITE }}>Active</span>
                                </div>
                              ) : (
                                <button onClick={(e) => handleDelete(p, e)}
                                  style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', display: 'grid', placeItems: 'center', borderRadius: 8, flexShrink: 0 }}
                                  onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                  <Trash2 size={13} color="#EF4444" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        {!atLimit && (
                          <button onClick={() => setActiveTab('add')}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px', background: 'transparent', border: `1.5px dashed ${BORDER}`, borderRadius: 14, cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 700, color: INK2, marginTop: 2 }}>
                            <Plus size={14} /> Add another website
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AnimatePresence>
  );
}