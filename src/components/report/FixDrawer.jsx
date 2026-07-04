import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Check, Copy, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  F, INK, INK2, INK3, BORDER, SURFACE, WHITE, CORAL, CARD_DARK,
  GREEN, GREEN_SOFT, CREAM_DEEP, ORANGE_DEEP, ORANGE_SOFT, FIX_MEM, normalizeIssueKey
} from '@/lib/report-constants';

export default function FixDrawer({ issue, profile, user, isFree, onClose, onUpgrade, onVerified }) {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [codeExpanded, setCodeExpanded] = useState(false);

  const techLevel = (() => {
    try {
      const prefs = typeof profile?.user_preferences === 'string'
        ? JSON.parse(profile.user_preferences)
        : profile?.user_preferences || {};
      return prefs.tech_level || 'no_code';
    } catch { return 'no_code'; }
  })();

  const issueKey = normalizeIssueKey(issue?.text || '');
  const cacheKey = `${issueKey}__${techLevel}`;
  const [content, setContent] = useState(() => FIX_MEM[cacheKey] || null);
  const [loading, setLoading] = useState(!FIX_MEM[cacheKey] && !isFree);

  useEffect(() => {
    if (!issue) return;
    if (isFree) { setLoading(false); return; }
    if (FIX_MEM[cacheKey]) { setContent(FIX_MEM[cacheKey]); setLoading(false); return; }

    setLoading(true);
    setContent(null);

    const checkDB = user?.id
      ? base44.entities.UserFixCache.filter({ user_id: user.id, issue_key: cacheKey }).catch(() => [])
      : Promise.resolve([]);

    checkDB.then(async (cached) => {
      if (cached.length > 0) {
        const c = cached[0];
        let steps = [];
        try { steps = JSON.parse(c.steps || '[]'); } catch {}
        const data = {
          summary: c.summary, steps,
          prompt: c.prompt || null,
          explanation: c.explanation || null,
          time_estimate: c.time_estimate, type: c.fix_type,
          profile_type: c.profile_type || techLevel,
          from_cache: true
        };
        FIX_MEM[cacheKey] = data;
        setContent(data);
        setLoading(false);
        return;
      }

      const res = await base44.functions.invoke('generateFixInstruction', {
        issue: issue.text,
        businessProfile: {
          site_url: profile?.site_url,
          identity_name: profile?.identity_name,
          identity_industry: profile?.identity_industry,
          user_preferences: profile?.user_preferences,
        },
      }).catch(() => null);

      if (res?.data && !res.data.error) {
        FIX_MEM[cacheKey] = res.data;
        setContent(res.data);
      }
      setLoading(false);
    });
  }, [cacheKey, isFree]);

  if (!issue) return null;
  const steps = content?.steps || [];
  const summary = content?.summary || '';
  const prompt = content?.prompt || '';
  const explanation = content?.explanation || '';
  const timeEstimate = content?.time_estimate || '';
  const fixType = content?.type || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt || explanation || summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await base44.functions.invoke('verifyFix', {
        issue: issue.text,
        taskTitle: issue.text,
        fixData: content,
        businessProfile: {
          site_url: profile?.site_url,
          identity_name: profile?.identity_name,
          identity_industry: profile?.identity_industry,
          identity_city: profile?.identity_city,
          identity_target: profile?.identity_target,
          brand_keywords: profile?.brand_keywords,
          products: profile?.products,
        },
      });
      const r = res?.data;
      if (r && !r.error) {
        setVerifyResult(r);
        if (r.verified && onVerified) {
          setTimeout(() => { onVerified(); }, 2500);
        }
      } else {
        setVerifyResult({ verified: false, feedback: 'Unable to verify. Try again in a moment.', confidence: 0 });
      }
    } catch {
      setVerifyResult({ verified: false, feedback: 'Verification error. Please retry.', confidence: 0 });
    }
    setVerifying(false);
  };

  const displayContent = prompt || explanation;

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)' }} />
      <motion.div key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 420, background: WHITE, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', fontFamily: F }}>

        <style>{`
          .fd-panel *{box-sizing:border-box;font-family:${F};}
          .fd-close:hover{background:${CREAM_DEEP}!important;}
          .fd-code-box{position:relative;}
          .fd-code-box .fade{position:absolute;left:0;right:0;bottom:0;height:36px;background:linear-gradient(to bottom,rgba(243,238,227,0),${CREAM_DEEP});pointer-events:none;transition:opacity .2s;}
          .fd-code-box.expanded .fade{opacity:0;}
          .fd-step:hover{border-color:${INK}!important;}
          .fd-btn-copy:hover{background:${ORANGE_DEEP}!important;}
          .fd-btn-verify:hover{background:${ORANGE_DEEP}!important;}
          @keyframes fdSpin{to{transform:rotate(360deg);}}
          @keyframes fdPulse{0%,100%{opacity:1;}50%{opacity:.45;}}
          .fd-skel{animation:fdPulse 1.4s ease-in-out infinite;}
        `}</style>

        {/* ── Header ── */}
        <div style={{ padding: '20px 22px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: ORANGE_DEEP }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL }} />
              Correction
            </span>
            <button onClick={onClose} className="fd-close"
              style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: WHITE, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={12} color={INK2} />
            </button>
          </div>
          <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.35, margin: '0 0 16px', color: INK, overflowWrap: 'anywhere' }}>{issue.text}</h2>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 22px 22px' }}>
          {isFree ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${CORAL}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={22} color={CORAL} />
              </div>
              <p style={{ fontSize: 17, fontWeight: 800, color: INK, letterSpacing: '-0.03em', marginBottom: 8 }}>Starter fix guide</p>
              <p style={{ fontSize: 13, color: INK3, lineHeight: 1.7, marginBottom: 28, maxWidth: 280, margin: '0 auto 28px' }}>
                Each fix generates a step-by-step guide tailored to your business. Available from the Starter plan.
              </p>
              <button onClick={() => { onClose(); onUpgrade(); }}
                style={{ width: '100%', padding: 14, background: INK, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, color: WHITE, cursor: 'pointer', fontFamily: F }}>
                Unlock guides — Starter
              </button>
            </div>
          ) : loading ? (
            <div>
              <div style={{ background: CREAM_DEEP, borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <svg width="28" height="28" viewBox="0 0 64 64" style={{ flexShrink: 0, animation: 'fdSpin .9s linear infinite', transformOrigin: '32px 32px' }}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(21,19,15,0.12)" strokeWidth="7" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke={CORAL} strokeWidth="7" strokeLinecap="round" strokeDasharray="40 123" />
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: INK }}>AI is preparing your guide…</div>
                  <div style={{ fontSize: 11.5, color: INK2, marginTop: 2 }}>Tailored to your industry and site</div>
                </div>
              </div>
              <div className="fd-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '94%', marginBottom: 8 }} />
              <div className="fd-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '78%', marginBottom: 8, animationDelay: '.15s' }} />
              <div className="fd-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '68%', marginBottom: 16, animationDelay: '.3s' }} />
              <div className="fd-skel" style={{ height: 50, borderRadius: 12, background: CREAM_DEEP, marginBottom: 16, animationDelay: '.4s' }} />
              <div className="fd-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '60%', marginBottom: 12, animationDelay: '.5s' }} />
              <div className="fd-skel" style={{ height: 48, borderRadius: 12, background: CREAM_DEEP, marginBottom: 8, animationDelay: '.6s' }} />
              <div className="fd-skel" style={{ height: 48, borderRadius: 12, background: CREAM_DEEP, marginBottom: 8, animationDelay: '.7s' }} />
            </div>
          ) : content ? (
            <div>
              {/* ── Meta pills ── */}
              {(timeEstimate || fixType) && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                  {timeEstimate && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 100, background: WHITE, border: `1px solid ${BORDER}`, color: INK2 }}>
                      <Clock size={13} /> {timeEstimate}
                    </span>
                  )}
                  {fixType && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 100, background: ORANGE_SOFT, color: ORANGE_DEEP }}>
                      <Check size={13} /> {fixType === 'solo' || fixType === 'seul' ? 'Do it yourself' : 'With help'}
                    </span>
                  )}
                </div>
              )}

              <div style={{ height: 1, background: BORDER, marginBottom: 18 }} />

              {/* ── Prompt section ── */}
              {displayContent && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: ORANGE_DEEP, marginBottom: 12 }}>
                    <ArrowRight size={13} />
                    Copy into ChatGPT or Claude
                  </div>
                  <div className={`fd-code-box ${codeExpanded ? 'expanded' : ''}`}
                    style={{ background: CREAM_DEEP, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, fontFamily: 'SF Mono, Menlo, monospace', fontSize: 12, lineHeight: 1.65, color: INK2, maxHeight: codeExpanded ? 'none' : 150, overflow: codeExpanded ? 'visible' : 'hidden', position: 'relative', marginBottom: 8 }}>
                    <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{displayContent}</div>
                    {!codeExpanded && <div className="fade" />}
                  </div>
                  {displayContent.length > 600 && (
                    <button onClick={() => setCodeExpanded(v => !v)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: INK2, padding: '4px 0 0', fontFamily: F, marginBottom: 12 }}>
                      {codeExpanded ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show full prompt</>}
                    </button>
                  )}
                  <button onClick={handleCopy} className="fd-btn-copy"
                    style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: copied ? GREEN : INK, color: WHITE, fontFamily: F, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 22, transition: 'background .15s ease' }}>
                    {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy prompt</>}
                  </button>
                </>
              )}

              {/* ── Steps ── */}
              {steps.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: INK3, marginBottom: 12 }}>What to do now</div>
                  {steps.map((step, i) => {
                    const stepText = typeof step === 'string' ? step : step.description || step.text || '';
                    const arrowIdx = stepText.indexOf('→');
                    const action = arrowIdx >= 0 ? stepText.slice(0, arrowIdx).trim() : stepText.trim();
                    const result = arrowIdx >= 0 ? stepText.slice(arrowIdx + 1).trim() : (step.result || step.expected_result || null);
                    return (
                      <div key={i} className="fd-step"
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, transition: 'border-color .15s ease' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: '#fff', background: i === 0 ? CORAL : CARD_DARK }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, lineHeight: 1.5, color: INK2, margin: 0, overflowWrap: 'anywhere' }} dangerouslySetInnerHTML={{ __html: action.replace(/\*\*(.+?)\*\*/g, '<b style="color:' + INK + ';font-weight:600">$1</b>') }} />
                          {result && (
                            <div style={{ fontSize: 11.5, color: GREEN, marginTop: 5, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                              <ArrowRight size={12} style={{ marginTop: 1, flexShrink: 0 }} />
                              <span>Expected: {result}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* ── Verify button ── */}
              <button onClick={handleVerify} disabled={verifying} className="fd-btn-verify"
                style={{ width: '100%', height: 50, borderRadius: 12, border: 'none', background: verifying ? SURFACE : verifyResult?.verified ? GREEN : INK, color: WHITE, fontFamily: F, fontSize: 14, fontWeight: 700, cursor: verifying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6, transition: 'background .15s ease' }}>
                {verifying ? (
                  <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: WHITE, borderRadius: '50%', animation: 'fdSpin 0.7s linear infinite' }} /> Analyzing your site…</>
                ) : verifyResult?.verified ? (
                  <><CheckCircle2 size={15} /> Verified by AI ✓</>
                ) : (
                  <><Sparkles size={15} color={CORAL} /> Verify with AI</>
                )}
              </button>
              {verifyResult && (
                <div style={{ marginTop: 10, padding: 13, background: verifyResult.verified ? GREEN_SOFT : '#FFFBEB', border: `1px solid ${verifyResult.verified ? `${GREEN}40` : '#FEF3C7'}`, borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    {verifyResult.verified ? <CheckCircle2 size={14} color={GREEN} /> : <AlertTriangle size={14} color="#D97706" />}
                    <span style={{ fontSize: 11, fontWeight: 600, color: verifyResult.verified ? GREEN : '#D97706', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {verifyResult.verified ? 'Fix verified' : 'Not verified yet'}
                    </span>
                    {verifyResult.confidence > 0 && (
                      <span style={{ fontSize: 11, color: INK2, marginLeft: 'auto' }}>{verifyResult.confidence}% confidence</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: verifyResult.verified ? '#15803D' : '#92400E', margin: '0 0 8px', lineHeight: 1.6, fontWeight: 500 }}>{verifyResult.feedback}</p>
                  {verifyResult.what_was_found && (
                    <p style={{ fontSize: 12, color: INK2, margin: '0 0 6px', lineHeight: 1.5 }}><strong>Found:</strong> {verifyResult.what_was_found}</p>
                  )}
                  {verifyResult.what_is_missing && !verifyResult.verified && (
                    <p style={{ fontSize: 12, color: INK2, margin: 0, lineHeight: 1.5 }}><strong>Missing:</strong> {verifyResult.what_is_missing}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px 18px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: INK2 }}>An error occurred. Please retry in a few seconds.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}