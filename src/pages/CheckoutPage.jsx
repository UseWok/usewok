import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Mail, ShieldCheck, ExternalLink, Key, ArrowRight, CheckCircle2 } from 'lucide-react';

export function saveCart(data) { localStorage.setItem('wok_cart', JSON.stringify(data)); }
export function clearCart() { localStorage.removeItem('wok_cart'); }
export function getCart() { try { return JSON.parse(localStorage.getItem('wok_cart')); } catch { return null; } }

const REDIRECT_TIMEOUT = 30; // seconds before showing "check your email" screen

export default function CheckoutPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const checkoutUrl = urlParams.get('url');
  const planName = urlParams.get('plan') || 'Plan';

  const [phase, setPhase] = useState('redirecting'); // 'redirecting' | 'waiting' | 'code'
  const [countdown, setCountdown] = useState(REDIRECT_TIMEOUT);
  const [code, setCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!checkoutUrl) { navigate('/pricing', { replace: true }); return; }

    // Open checkout URL in new tab
    window.open(checkoutUrl, '_blank');

    // Start countdown
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setPhase('waiting');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const handleRedeemCode = async () => {
    if (!code.trim()) return;
    setRedeeming(true);
    try {
      const results = await base44.entities.ActivationCode.filter({ code: code.trim() });
      if (results.length === 0) {
        toast.error('Code invalide. Vérifiez votre e-mail ou vos spams.');
        setRedeeming(false);
        return;
      }
      const rec = results[0];
      if (rec.used) {
        toast.error('Ce code a déjà été utilisé.');
        setRedeeming(false);
        return;
      }
      // Mark used
      const me = await base44.auth.me();
      await base44.entities.ActivationCode.update(rec.id, { used: true, used_by: me?.email || '' });
      // Update user plan
      if (me?.id) {
        await base44.entities.User.update(me.id, { subscription_plan: rec.plan_id });
      }
      setRedeemed(true);
      toast.success('Accès activé ! Bienvenue 🎉');
      setTimeout(() => navigate('/app', { replace: true }), 2000);
    } catch {
      toast.error('Erreur lors de la vérification. Réessayez.');
    }
    setRedeeming(false);
  };

  if (redeemed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Accès activé !</h2>
          <p className="text-sm text-white/40">Redirection en cours…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-be">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Abonnement {planName}</h1>
          <p className="text-sm text-white/40">Votre paiement est en cours de traitement</p>
        </div>

        {phase === 'redirecting' && (
          <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-7 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-5 h-5 text-white/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Page de paiement ouverte</p>
                <p className="text-xs text-white/40 mt-0.5">Completez votre paiement dans l'onglet ouvert</p>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center space-y-2">
              <div
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white"
                style={{
                  background: `conic-gradient(#eab308 ${(countdown / REDIRECT_TIMEOUT) * 360}deg, rgba(255,255,255,0.05) 0deg)`,
                  padding: '3px',
                }}
              >
                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center text-2xl font-bold text-white">
                  {countdown}
                </div>
              </div>
              <p className="text-xs text-white/30">secondes restantes…</p>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex items-start gap-3">
              <Mail className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-white/40 leading-relaxed">
                Une fois le paiement effectué, vous recevrez votre <strong className="text-white/60">code d'activation</strong> par e-mail. Pensez à vérifier vos spams.
              </p>
            </div>

            <button
              onClick={() => setPhase('waiting')}
              className="w-full py-3 text-sm font-semibold text-white/40 hover:text-white transition-colors text-center"
            >
              J'ai déjà payé →
            </button>
          </div>
        )}

        {phase === 'waiting' && (
          <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-7 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Vérifiez votre e-mail</h2>
              <p className="text-sm text-white/40 leading-relaxed">
                Votre code d'accès a été envoyé à votre adresse e-mail.<br />
                <span className="text-amber-400/80">⚠ Pensez à vérifier vos spams / courriers indésirables.</span>
              </p>
            </div>

            <div className="h-px bg-white/[0.06]" />

            <button
              onClick={() => setPhase('code')}
              className="w-full py-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
            >
              <Key className="w-4 h-4" />
              J'ai reçu mon code
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === 'code' && (
          <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-7 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
                <Key className="w-7 h-7 text-violet-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Entrez votre code</h2>
              <p className="text-xs text-white/40">Copiez le code reçu par e-mail et collez-le ici</p>
            </div>

            <div className="space-y-3">
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRedeemCode()}
                placeholder="Votre code d'activation…"
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-violet-500/50 transition-colors font-mono tracking-wider text-center"
                autoFocus
              />

              <button
                onClick={handleRedeemCode}
                disabled={!code.trim() || redeeming}
                className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              >
                {redeeming ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Activer mon accès
                  </>
                )}
              </button>
            </div>

            <button onClick={() => setPhase('waiting')} className="w-full text-xs text-white/25 hover:text-white/50 transition-colors text-center">
              ← Je n'ai pas encore reçu mon code
            </button>
          </div>
        )}

        <button onClick={() => navigate('/pricing')} className="w-full text-xs text-white/20 hover:text-white/40 text-center transition-colors">
          Retour aux forfaits
        </button>
      </div>
    </div>
  );
}