import { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Lightbulb, Info, Wand2 } from 'lucide-react';
import { TextInput, TextArea } from '@/components/brand/BrandField';
import TagListEditor from '@/components/brand/TagListEditor';
import ChoiceChips from '@/components/brand/ChoiceChips';
import { BK_QUESTIONS } from '@/lib/brand-knowledge-questions';

const F = "'Wix Madefor Text', 'Wix Madefor Display', 'Inter var', 'Inter', system-ui, sans-serif";
const INK = '#111827';
const INK3 = '#6B7280';
const BORDER = '#E5E7EB';
const VIOLET = '#7B4FE0';
const VIOLET_SOFT = '#F5F3FF';

function filled(v) {
  if (Array.isArray(v)) return v.length > 0;
  return !!(v && String(v).trim());
}

/**
 * Onboarding conversationnel : une question à la fois.
 * - values / setValue : l'état de brand-knowledge partagé avec la page.
 * - prefilling : true pendant que l'IA analyse le site.
 * - onFinish : appelé quand l'utilisateur valide la dernière question.
 */
export default function BrandOnboarding({ values, setValue, prefilling, onFinish, saving, onAIFillQuestion, aiQuestionLoading }) {
  const [idx, setIdx] = useState(0);
  const total = BK_QUESTIONS.length;
  const q = BK_QUESTIONS[idx];
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [idx]);

  const val = values[q.key];
  const canContinue = filled(val) || q.optional;
  const isLast = idx === total - 1;

  const next = () => {
    if (isLast) { onFinish?.(); return; }
    setIdx(i => Math.min(i + 1, total - 1));
  };
  const back = () => setIdx(i => Math.max(i - 1, 0));

  const answered = BK_QUESTIONS.filter(qq => filled(values[qq.key])).length;
  const pct = Math.round((answered / total) * 100);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && (q.type === 'text') && canContinue) { e.preventDefault(); next(); }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px 100px', fontFamily: F }}>

      {/* ── Progression gamifiée ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: VIOLET }}>
            {answered}/{total} sections complétées
          </span>
          <span style={{ fontSize: 12, color: INK3 }}>Question {idx + 1} sur {total}</span>
        </div>
        <div style={{ height: 6, background: '#EDEAF7', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: VIOLET, borderRadius: 999, transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)' }} />
        </div>
      </div>

      {/* ── Bandeau pré-remplissage IA ── */}
      {prefilling && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: VIOLET_SOFT, border: `1px solid #E0D8FA`, borderRadius: 12, padding: '12px 14px', marginBottom: 24 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2.5px solid #D9CDF7', borderTopColor: VIOLET, animation: 'bkspin 0.8s linear infinite', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#5B3BB0', fontWeight: 600 }}>UseWok lit ton site pour te faire gagner du temps…</span>
          <style>{`@keyframes bkspin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {/* Per-question AI fill — button moved inline next to each question */}

      {/* ── La question ── */}
      <div key={idx} style={{ animation: 'bkfade 0.3s ease both' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sparkles size={16} color={VIOLET} />
          <span style={{ fontSize: 12, fontWeight: 700, color: VIOLET, textTransform: 'uppercase', letterSpacing: '0.05em' }}>UseWok te demande</span>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 800, color: INK, margin: '0 0 20px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
          {q.question}
        </h1>

        {/* Champ */}
        <div style={{ marginBottom: 12 }}>
          {q.type === 'text' && (
            <input
              ref={inputRef}
              type="text"
              value={val || ''}
              onChange={e => setValue(q.key, e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={q.example}
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', fontSize: 16, color: INK, background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 12, outline: 'none', fontFamily: F }}
              onFocus={e => e.currentTarget.style.borderColor = VIOLET}
              onBlur={e => e.currentTarget.style.borderColor = BORDER}
            />
          )}
          {q.type === 'textarea' && (
            <textarea
              ref={inputRef}
              value={val || ''}
              onChange={e => setValue(q.key, e.target.value)}
              placeholder={q.example}
              rows={q.rows || 3}
              style={{ width: '100%', boxSizing: 'border-box', padding: '14px 16px', fontSize: 16, color: INK, background: '#fff', border: `1.5px solid ${BORDER}`, borderRadius: 12, outline: 'none', fontFamily: F, resize: 'vertical', lineHeight: 1.6 }}
              onFocus={e => e.currentTarget.style.borderColor = VIOLET}
              onBlur={e => e.currentTarget.style.borderColor = BORDER}
            />
          )}
          {q.type === 'choice' && (
            <ChoiceChips value={val} onChange={v => setValue(q.key, v)} options={q.options} />
          )}
          {q.type === 'tags' && (
            <TagListEditor items={val || []} onChange={v => setValue(q.key, v)} placeholder="Ajoute le tien…" chipOptions={q.chipOptions} />
          )}
        </div>

        {/* Exemple inline (pour text/textarea l'exemple est déjà le placeholder → on le montre en dessous aussi pour tags/choice) */}
        {q.example && (q.type === 'tags' || q.type === 'choice') && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 12 }}>
            <Lightbulb size={13} color="#B08A00" style={{ marginTop: 2, flexShrink: 0 }} />
            <span style={{ fontSize: 12.5, color: INK3, lineHeight: 1.5 }}>{q.example}</span>
          </div>
        )}

        {/* ── L'IA répond à cette question ── */}
        {onAIFillQuestion && (
          <button
            onClick={() => onAIFillQuestion(q.key)}
            disabled={aiQuestionLoading || saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', marginBottom: 12,
              border: `1.5px solid ${aiQuestionLoading ? '#E0D8FA' : VIOLET}`,
              background: aiQuestionLoading ? '#F5F3FF' : '#fff',
              color: aiQuestionLoading ? '#A99FD0' : VIOLET,
              borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: aiQuestionLoading || saving ? 'default' : 'pointer',
              fontFamily: F, transition: 'all 150ms',
            }}
          >
            {aiQuestionLoading ? (
              <>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2.5px solid #E0D8FA', borderTopColor: VIOLET, animation: 'bkspin 0.8s linear infinite' }} />
                L'IA réfléchit…
              </>
            ) : (
              <>
                <Wand2 size={14} />
                L'IA répond à cette question
              </>
            )}
          </button>
        )}

        {/* Pourquoi ça compte */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: '#F9FAFB', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '11px 13px', marginTop: 6 }}>
          <Info size={14} color={VIOLET} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: INK3, lineHeight: 1.55 }}>{q.why}</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28 }}>
        <button onClick={back} disabled={idx === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', border: 'none', background: 'transparent', fontSize: 14, fontWeight: 600, color: idx === 0 ? '#D1D5DB' : INK3, cursor: idx === 0 ? 'default' : 'pointer', fontFamily: F }}>
          <ArrowLeft size={15} /> Retour
        </button>

        <button onClick={next} disabled={!canContinue || saving}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 24px', border: 'none', background: canContinue ? VIOLET : '#E5E1F0', borderRadius: 12, fontSize: 15, fontWeight: 700, color: canContinue ? '#fff' : '#A99FD0', cursor: canContinue && !saving ? 'pointer' : 'default', fontFamily: F, transition: 'background 150ms' }}>
          {isLast ? (saving ? 'Enregistrement…' : <>Terminer <Check size={16} /></>) : <>Continuer <ArrowRight size={16} /></>}
        </button>
      </div>

      {!canContinue && !q.optional && (
        <p style={{ fontSize: 12, color: INK3, textAlign: 'right', margin: '8px 0 0' }}>Réponds pour continuer — ou reviens plus tard.</p>
      )}

      <style>{`@keyframes bkfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}