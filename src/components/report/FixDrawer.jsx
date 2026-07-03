import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Lock, Check, Copy, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  F, INK, INK2, INK3, BORDER, SURFACE, WHITE, CORAL, CARD_DARK,
  GREEN, GREEN_SOFT, CREAM_DEEP, ORANGE_DEEP, ORANGE_SOFT, FIX_MEM, normalizeIssueKey
} from '@/lib/report-constants';

export default function FixDrawer({ issue, profile, user, isFree, onClose, onUpgrade, onVerified }) {
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

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

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)' }} />
      <motion.div key="dr" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        style={{ position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 101, width: '100%', maxWidth: 420, background: WHITE, boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', fontFamily: F }}>

        {/* ── Header ── */}
        <div style={{ padding: '18px', borderBottom: `0.5px solid ${BORDER}`, background: WHITE, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: CORAL, flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: CORAL, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {issue.type === 'plan' ? 'Action plan' : 'Fix'}
                </span>
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, color: INK, lineHeight: 1.4, margin: 0, overflowWrap: 'anywhere' }}>{issue.text}</p>
            </div>
            <button onClick={onClose} className="lrsm-close"
              style={{ width: 26, height: 26, borderRadius: '50%', border: `0.5px solid ${BORDER}`, background: 'none', color: INK2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={13} />
            </button>
          </div>

          {(timeEstimate || fixType) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {timeEstimate && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: INK2, border: `0.5px solid ${BORDER}`, borderRadius: 999, padding: '5px 11px' }}>
                  <Clock size={12} /> {timeEstimate}
                </span>
              )}
              {fixType && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 500, color: ORANGE_DEEP, background: ORANGE_SOFT, borderRadius: 999, padding: '5px 11px' }}>
                  <Check size={12} /> {fixType === 'solo' || fixType === 'seul' ? 'Do it yourself' : 'With help'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', background: WHITE }}>
          {isFree ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: `${CORAL}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Lock size={22} color={CORAL} />
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
            <div style={{ padding: '18px' }}>
              <div style={{ background: CREAM_DEEP, borderRadius: 10, padding: 13, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <svg width="30" height="30" viewBox="0 0 64 64" style={{ flexShrink: 0, animation: 'lrsmSpin .9s linear infinite', transformOrigin: '32px 32px' }}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(21,19,15,0.12)" strokeWidth="7" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke={CORAL} strokeWidth="7" strokeLinecap="round" strokeDasharray="40 123" />
                </svg>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: INK }}>AI is preparing your personalized guide…</div>
                  <div style={{ fontSize: 11.5, color: INK2, marginTop: 2 }}>Tailored to your industry and site</div>
                </div>
              </div>
              <div className="lrsm-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '94%', marginBottom: 8 }} />
              <div className="lrsm-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '78%', marginBottom: 8, animationDelay: '.15s' }} />
              <div className="lrsm-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '68%', marginBottom: 8, animationDelay: '.3s' }} />
              <div className="lrsm-skel" style={{ height: 8, borderRadius: 4, background: CREAM_DEEP, width: '50%', animationDelay: '.45s' }} />
            </div>
          ) : content ? (
            <div style={{ padding: '18px' }}>
              <div style={{ height: '0.5px', background: BORDER, margin: '-18px -18px 14px' }} />

              {summary && (
                <div style={{ background: ORANGE_SOFT, borderRadius: 10, padding: 13, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Sparkles size={13} color={ORANGE_DEEP} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: ORANGE_DEEP, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Why it matters</span>
                  </div>
                  <p style={{ fontSize: 12.5, lineHeight: 1.6, color: INK, margin: 0 }}>{summary}</p>
                </div>
              )}

              {prompt && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ➡️ Copy this into ChatGPT or Claude:
                  </p>
                  <div style={{ background: SURFACE, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: 13, fontSize: 12.5, color: INK, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'monospace', maxHeight: 240, overflowY: 'auto' }}>
                    {prompt}
                  </div>
                  <button onClick={handleCopy}
                    style={{ marginTop: 10, width: '100%', padding: 12, background: copied ? GREEN : '#7C3AED', color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy prompt</>}
                  </button>
                </div>
              )}

              {explanation && !prompt && (
                <div style={{ marginBottom: 16, padding: 13, background: '#F3E8FF', borderRadius: 10 }}>
                  <p style={{ fontSize: 13, color: '#4B2A8C', margin: 0, lineHeight: 1.65 }}>{explanation}</p>
                </div>
              )}

              {steps.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: INK2, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>What to do now</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {steps.map((step, i) => {
                      const stepText = typeof step === 'string' ? step : step.description || step.text || '';
                      const arrowIdx = stepText.indexOf('→');
                      const action = arrowIdx >= 0 ? stepText.slice(0, arrowIdx).trim() : stepText.trim();
                      const result = arrowIdx >= 0 ? stepText.slice(arrowIdx + 1).trim() : (step.result || step.expected_result || null);

                      return (
                        <div key={i} className="lrsm-step" style={{ border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: 12, display: 'flex', gap: 10, transition: 'border-color .15s ease' }}>
                          <div style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? CORAL : CARD_DARK, color: i === 0 ? '#fff' : SURFACE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                            {i + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, color: INK, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{action}</div>
                            {result && (
                              <div style={{ fontSize: 11.5, color: GREEN, marginTop: 5, display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                                <ArrowRight size={12} style={{ marginTop: 1, flexShrink: 0 }} />
                                <span>Expected result: {result}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isFree && (
                <div style={{ marginTop: 16 }}>
                  <button onClick={handleVerify} disabled={verifying}
                    style={{ width: '100%', padding: 13, background: verifying ? SURFACE : verifyResult?.verified ? GREEN : CARD_DARK, color: WHITE, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: verifying ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: F, transition: 'background 0.2s' }}>
                    {verifying ? (
                      <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: WHITE, borderRadius: '50%', animation: 'lrsmSpin 0.7s linear infinite' }} /> Analyzing your site…</>
                    ) : verifyResult?.verified ? (
                      <><CheckCircle2 size={14} /> Task verified by AI ✓</>
                    ) : (
                      <><Sparkles size={14} color={CORAL} /> Verify with AI</>
                    )}
                  </button>
                  {verifyResult && (
                    <div style={{ marginTop: 10, padding: 13, background: verifyResult.verified ? GREEN_SOFT : '#FFFBEB', border: `0.5px solid ${verifyResult.verified ? `${GREEN}40` : '#FEF3C7'}`, borderRadius: 10 }}>
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