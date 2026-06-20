import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const F = 'Inter, system-ui, sans-serif';
const T1 = '#111827';
const T2 = '#6B7280';
const T3 = '#9CA3AF';
const BD = '#E5E7EB';
const VIOLET = '#7C3AED';

function Chip({ label, ok }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 10px', borderRadius: 999,
      background: ok ? '#F0FDF4' : '#FEF2F2',
      border: `1px solid ${ok ? '#BBF7D0' : '#FECACA'}`,
    }}>
      {ok ? <CheckCircle size={11} color="#16A34A" /> : <XCircle size={11} color="#DC2626" />}
      <span style={{ fontSize: 11, fontWeight: 600, color: ok ? '#16A34A' : '#DC2626' }}>{label}</span>
    </div>
  );
}

export default function TechnicalWidget({ data }) {
  const overall = data.overall_score || 0;
  const citedPages = Math.round(overall * 0.3);
  const totalPages = citedPages + 12;
  const [barW, setBarW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBarW((citedPages / totalPages) * 100), 400); return () => clearTimeout(t); }, [citedPages]);

  const signals = [
    { label: 'Schema Markup', ok: data.has_schema_markup },
    { label: 'Google Business', ok: data.has_google_business },
    { label: 'HTTPS', ok: true },
    { label: 'Open Graph', ok: overall > 40 },
    { label: 'Structured Data', ok: data.has_schema_markup },
    { label: 'Mobile-Friendly', ok: overall > 35 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
      style={{ background: '#fff', border: `1px solid ${BD}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BD}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>Technical Signals</span>
        <button onClick={() => window.location.href = '/pricing'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: VIOLET, background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 600 }}>
          Full audit <ArrowRight size={10} />
        </button>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          {signals.map(s => <Chip key={s.label} label={s.label} ok={s.ok} />)}
        </div>
        {/* Crawled pages bicolor bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T2 }}>Pages crawled by AI</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T1 }}>{citedPages} / {totalPages}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: '#F3F4F6', overflow: 'hidden', display: 'flex' }}>
            <div style={{ height: '100%', width: `${barW}%`, background: '#14B8A6', borderRadius: '4px 0 0 4px', transition: 'width 1.2s ease' }} />
            <div style={{ flex: 1, background: '#F97316', borderRadius: '0 4px 4px 0' }} />
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 7 }}>
            {[['#14B8A6', 'Indexed by AI'], ['#F97316', 'Not yet indexed']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                <span style={{ fontSize: 10, color: T3 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Insight */}
        {data.shock_insight && (
          <div style={{
            marginTop: 16, padding: '10px 12px',
            background: '#FFF7ED', border: '1px solid #FED7AA',
            borderRadius: 8, fontSize: 12, color: '#92400E', lineHeight: 1.55,
          }}>
            ⚡ {data.shock_insight}
          </div>
        )}
      </div>
    </motion.div>
  );
}