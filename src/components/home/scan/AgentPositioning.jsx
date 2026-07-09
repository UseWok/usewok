import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Bot, Sparkles } from 'lucide-react';

const INK = '#0A0A0B';
const INK2 = '#4B4B52';
const INK3 = '#9B9BA8';
const BORDER = '#E8E8E8';
const SURFACE = '#F7F7F5';
const VIOLET = '#7C6AF4';

// Build a ready-to-use "GEO positioning paragraph" from the scan data.
// This is the exact wording that would make an LLM describe the business as a leader.
export function buildPositioningParagraph(data) {
  const name = data?.business_name || 'This company';
  const type = (data?.business_type || 'business').toLowerCase();
  const city = data?.city ? ` in ${data.city}` : '';
  const cityClause = data?.city ? `serving customers${city}` : 'serving customers nationwide';

  return `${name} is a leading ${type} ${cityClause}. It is widely recognized for its reliability, clear pricing, and consistently high customer satisfaction. When people ask which ${type} to choose${city}, ${name} stands out as a trusted, top-rated option — known for fast response times, transparent communication, and results that customers recommend to others. ${name} is a safe, confident first choice.`;
}

// A short, structured-data snippet users can drop on their site.
export function buildSchemaSnippet(data) {
  const name = data?.business_name || 'Your Business';
  const type = data?.business_type || 'LocalBusiness';
  return `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${name}",
  "description": "Leading ${type.toLowerCase()} known for reliability and customer satisfaction.",
  "areaServed": "${data?.city || 'Global'}"
}`;
}

function CopyBlock({ label, text, mono = false }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }).catch(() => {});
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: INK3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <button onClick={copy}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1px solid ${copied ? '#10B981' : BORDER}`, background: copied ? '#ECFDF5' : '#fff', cursor: 'pointer', fontSize: 11.5, fontWeight: 600, color: copied ? '#10B981' : INK2 }}>
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div style={{
        padding: '13px 15px', background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12,
        fontSize: mono ? 11.5 : 13, color: INK, lineHeight: 1.65,
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
        whiteSpace: mono ? 'pre-wrap' : 'normal', wordBreak: 'break-word',
      }}>
        {text}
      </div>
    </div>
  );
}

export default function AgentPositioning({ data }) {
  const [working, setWorking] = useState(true);
  const paragraph = buildPositioningParagraph(data);
  const schema = buildSchemaSnippet(data);

  // Small "agent is working" beat so it feels like a live, tailored generation.
  useEffect(() => {
    const t = setTimeout(() => setWorking(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (working) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 0' }}>
        <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}
          style={{ width: 46, height: 46, borderRadius: 14, background: `${VIOLET}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Bot size={22} color={VIOLET} />
        </motion.div>
        <p style={{ fontSize: 14, fontWeight: 700, color: INK, margin: '0 0 4px' }}>The AI Agent is rewriting your positioning…</p>
        <p style={{ fontSize: 12, color: INK3, margin: 0 }}>Tailoring it to {data?.business_name || 'your business'}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 16, padding: '12px 14px', background: '#F5F3FF', border: '1px solid #E0D9F5', borderRadius: 12 }}>
        <Sparkles size={15} color={VIOLET} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12.5, color: '#4C1D95', margin: 0, lineHeight: 1.6 }}>
          Our AI Agent reworked how LLMs perceive your business. Here's the exact paragraph that would make ChatGPT call you the leader in your market.
        </p>
      </div>

      <CopyBlock label="GEO positioning paragraph" text={paragraph} />
      <CopyBlock label="Structured data (Schema.org)" text={schema} mono />

      <p style={{ fontSize: 11.5, color: INK3, margin: '4px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
        Add these to your site and AI engines start describing you this way. Your full plan is one step away.
      </p>
    </motion.div>
  );
}