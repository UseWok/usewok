import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, AlertCircle } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const VIOLET = '#7C3AED';

function IssueRow({ text, severity }) {
  const isError = severity === 'error';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderBottom: `1px solid #F9FAFB` }}>
      {isError
        ? <AlertCircle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
        : <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />}
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, color: T1, lineHeight: 1.5 }}>{text}</span>
      </div>
      <div style={{ width: 56, height: 8, borderRadius: 2, background: '#F3F4F6', filter: 'blur(2px)', alignSelf: 'center', flexShrink: 0 }} />
    </div>
  );
}

export default function IssuesWidget({ issues = [] }) {
  const errors = issues.slice(0, Math.ceil(issues.length / 2));
  const warnings = issues.slice(Math.ceil(issues.length / 2));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BD}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Issues Detected</span>
          {errors.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#FEF2F2', color: '#DC2626' }}>
              {errors.length} Errors
            </span>
          )}
          {warnings.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#FFF7ED', color: '#D97706' }}>
              {warnings.length} Warnings
            </span>
          )}
        </div>
        <button onClick={() => window.location.href = '/pricing'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: VIOLET, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
          Fix issues <ArrowRight size={10} />
        </button>
      </div>
      <div style={{ padding: '4px 20px 8px' }}>
        {issues.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0', gap: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 20 }}>✓</span>
            </div>
            <span style={{ fontSize: 12, color: T3, textAlign: 'center', maxWidth: 200, lineHeight: 1.5 }}>No issues detected yet. Keep monitoring after repeated analyses.</span>
          </div>
        ) : (
          <>
            {errors.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '10px 0 4px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} /> Errors
                </div>
                {errors.map((iss, i) => <IssueRow key={i} text={iss.problem || iss} severity="error" />)}
              </>
            )}
            {warnings.length > 0 && (
              <>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '10px 0 4px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} /> Warnings
                </div>
                {warnings.map((iss, i) => <IssueRow key={i} text={iss.problem || iss} severity="warning" />)}
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}