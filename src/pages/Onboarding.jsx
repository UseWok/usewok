import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Check, Globe, Building2, Users2, MapPin } from 'lucide-react';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#15130F';
const INK2 = '#4A453B';
const INK3 = '#857E6E';
const ORANGE = '#FF5A1F';
const BG = '#FBF8F2';

const INDUSTRIES = [
  'E-commerce', 'SaaS / Software', 'Agency / Marketing', 'Consulting',
  'Restaurant / Hospitality', 'Health & Wellness', 'Real Estate', 'Education',
  'Legal / Finance', 'Construction / Trades', 'Manufacturing', 'Other',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    business_name: '', website: '', industry: '', city: '', target_audience: '',
  });

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  const canNext = () => {
    if (step === 0) return data.business_name.trim().length > 1 && data.website.trim().length > 2;
    if (step === 1) return data.industry.trim().length > 0 && data.city.trim().length > 0;
    if (step === 2) return data.target_audience.trim().length > 4;
    return false;
  };

  const finish = async () => {
    setSaving(true);
    try {
      const cleanUrl = data.website.startsWith('http') ? data.website : `https://${data.website}`;
      const u = await base44.auth.me().catch(() => null);
      await base44.auth.updateMe({
        quiz_profile: JSON.stringify({
          business_name: data.business_name, industry: data.industry,
          city: data.city, target_audience: data.target_audience,
        }),
      });
      if (u?.id) {
        const existing = await base44.entities.BusinessProfile.filter({ created_by_id: u.id, site_url: cleanUrl }).catch(() => []);
        const fields = {
          site_url: cleanUrl,
          identity_name: data.business_name,
          identity_industry: data.industry,
          identity_city: data.city,
          identity_target: data.target_audience,
          active: true,
        };
        if (existing[0]) await base44.entities.BusinessProfile.update(existing[0].id, fields);
        else await base44.entities.BusinessProfile.create({ ...fields, created_by_id: u.id });
      }
    } catch {}
    setSaving(false);
    window.location.href = '/app';
  };

  const steps = [
    {
      icon: Building2,
      title: "What's your business?",
      sub: 'Tell us your business name and website — UseWok will scan it right away.',
      content: (
        <>
          <Input label="Business name" value={data.business_name} onChange={v => set('business_name', v)} placeholder="Acme Corp" autoFocus />
          <Input label="Website" value={data.website} onChange={v => set('website', v)} placeholder="acme.com" icon={Globe} />
        </>
      ),
    },
    {
      icon: MapPin,
      title: 'Where do you operate?',
      sub: 'Your industry and location help AI engines recommend you to the right people.',
      content: (
        <>
          <div>
            <label style={labelStyle}>Industry</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 6 }}>
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => set('industry', ind)}
                  style={{ padding: '8px 14px', borderRadius: 100, border: `1.5px solid ${data.industry === ind ? ORANGE : 'rgba(21,19,15,0.14)'}`, background: data.industry === ind ? 'rgba(255,90,31,0.08)' : '#fff', color: data.industry === ind ? '#C43E14' : INK2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>
                  {ind}
                </button>
              ))}
            </div>
          </div>
          <Input label="City" value={data.city} onChange={v => set('city', v)} placeholder="Paris" autoFocus />
        </>
      ),
    },
    {
      icon: Users2,
      title: 'Who is your ideal customer?',
      sub: 'Describe the people you want to reach. This shapes your entire AI visibility plan.',
      content: (
        <div>
          <label style={labelStyle}>Your target audience</label>
          <textarea
            value={data.target_audience}
            onChange={e => set('target_audience', e.target.value)}
            placeholder="e.g. Small business owners in France who need accounting software, aged 30-50, looking for a simple alternative to Excel."
            autoFocus
            rows={4}
            style={{ width: '100%', padding: '12px 14px', fontSize: 14, border: '1.5px solid rgba(21,19,15,0.14)', borderRadius: 12, fontFamily: F, color: INK, outline: 'none', boxSizing: 'border-box', resize: 'none', lineHeight: 1.5, background: '#fff' }}
            onFocus={e => { e.currentTarget.style.borderColor = ORANGE; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(21,19,15,0.14)'; }}
          />
        </div>
      ),
    },
  ];

  const cur = steps[step];
  const Icon = cur.icon;

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 28 : 7, height: 7, borderRadius: 20, background: i <= step ? ORANGE : 'rgba(21,19,15,0.12)', transition: 'all 0.3s' }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fff', border: '1px solid rgba(21,19,15,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Icon size={24} color={ORANGE} strokeWidth={1.8} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: INK, margin: '0 0 6px', letterSpacing: '-0.02em' }}>{cur.title}</h1>
          <p style={{ fontSize: 14, color: INK2, margin: 0, lineHeight: 1.55, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>{cur.sub}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {cur.content}
        </div>

        <button
          onClick={() => step < 2 ? setStep(step + 1) : finish()}
          disabled={!canNext() || saving}
          style={{
            width: '100%', height: 50, border: 'none', borderRadius: 12,
            background: canNext() && !saving ? INK : 'rgba(21,19,15,0.12)',
            color: '#FBF8F2', fontSize: 14.5, fontWeight: 600, cursor: canNext() && !saving ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 22, fontFamily: F, transition: 'background 0.15s',
          }}>
          {saving ? 'Saving…' : step < 2 ? <>Continue <ArrowRight size={16} /></> : <>Start my scan <Check size={16} /></>}
        </button>

        {step > 0 && !saving && (
          <button onClick={() => setStep(step - 1)} style={{ width: '100%', background: 'none', border: 'none', color: INK3, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: F, marginTop: 10, padding: '8px 0' }}>
            Back
          </button>
        )}
      </div>
    </div>
  );
}

const labelStyle = { fontSize: 12.5, fontWeight: 700, color: INK2, display: 'block', marginBottom: 5 };

function Input({ label, value, onChange, placeholder, autoFocus, icon: Icon }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={16} color={INK3} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        )}
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            width: '100%', height: 48, borderRadius: 12,
            border: '1.5px solid rgba(21,19,15,0.14)', background: '#fff',
            padding: `0 14px ${Icon ? '0 14px 0 40px' : '0 14px'}`,
            fontFamily: F, fontSize: 14, color: INK, outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = ORANGE; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(21,19,15,0.14)'; }}
        />
      </div>
    </div>
  );
}