import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

export default function AIVisibilityReport() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) { navigate('/'); return; }
      const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: u.id }).catch(() => []);
      if (profiles.length > 0) {
        const p = profiles[0];
        let extra = {};
        try { extra = JSON.parse(p.brand_keywords || '{}'); } catch {}
        setProfile({ ...p, ...extra });
      }
      setLoading(false);
    }).catch(() => { navigate('/'); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-violet rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <p className="text-lg font-semibold text-slate-700">No scan data found.</p>
        <p className="text-sm text-slate-500">Go back and scan your website first.</p>
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft size={14} /> Back to Scanner
        </button>
      </div>
    );
  }

  const score = profile.score_overall || profile.overall_score || 0;
  const aiScore = profile.score_ai_visibility || profile.ai_visibility_score || 0;
  const clarityScore = profile.score_message_clarity || profile.message_clarity_score || 0;
  const commercialScore = profile.score_commercial_signal || profile.commercial_presence_score || 0;
  const issues = profile.issues || [];
  const competitors = profile.competitors || [];
  const topKeywords = profile.top_keywords || [];

  const ScoreCircle = ({ value, label, color }) => (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#F3F4F6" strokeWidth="8" />
          <circle cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 32}`}
            strokeDashoffset={`${2 * Math.PI * 32 * (1 - value / 100)}`}
            strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-slate-800">{value}</span>
      </div>
      <span className="text-xs text-slate-500 text-center font-medium">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">AI Visibility Report</h1>
            <p className="text-sm text-slate-500">{profile.site_url || profile.identity_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/app')}
            className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <RefreshCw size={13} /> Re-scan
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            <Download size={13} /> Export PDF
          </button>
        </div>
      </div>

      {/* Scores */}
      <div className="bg-slate-50 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">Overall Scores</h2>
        <div className="flex flex-wrap justify-around gap-6">
          <ScoreCircle value={Math.round(score)} label="Overall Score" color="#7C3AED" />
          <ScoreCircle value={Math.round(aiScore)} label="AI Visibility" color="#3B82F6" />
          <ScoreCircle value={Math.round(clarityScore)} label="Message Clarity" color="#10B981" />
          <ScoreCircle value={Math.round(commercialScore)} label="Commercial Signal" color="#F59E0B" />
        </div>
      </div>

      {/* Shock insight */}
      {profile.shock_insight && (
        <div className="border-l-4 border-[#7C3AED] bg-purple-50 rounded-r-xl p-4 mb-6">
          <p className="text-sm font-semibold text-purple-900">{profile.shock_insight}</p>
        </div>
      )}

      {/* Issues */}
      {issues.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Issues Found</h2>
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <span className="text-red-500 font-bold text-sm mt-0.5">✕</span>
                <p className="text-sm text-red-800">{issue.problem || issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top keywords */}
      {topKeywords.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Top Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                {typeof kw === 'string' ? kw : kw.keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Competitors */}
      {competitors.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Competitors</h2>
          <div className="space-y-2">
            {competitors.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700">{typeof c === 'string' ? c : c.domain}</span>
                {c.score !== undefined && (
                  <span className="text-sm font-bold text-slate-500">{c.score}/100</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical signals */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">Technical Signals</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Schema Markup', value: profile.has_schema_markup },
            { label: 'Google Business', value: profile.has_google_business },
            { label: 'SSL Certificate', value: profile.has_ssl },
            { label: 'Mobile Friendly', value: profile.has_mobile_friendly },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className={`text-sm font-bold ${item.value ? 'text-green-600' : 'text-red-500'}`}>
                {item.value ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}