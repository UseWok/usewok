import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, Book, ChevronRight, Send, Check, Zap, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const FAQS = [
  { q: 'Comment fonctionne les Tensors ?', a: '1 Tensor = 1 réponse IA. Votre quota se renouvelle chaque mois selon votre plan.' },
  { q: 'Comment changer mon abonnement ?', a: 'Allez dans Paramètres > Plan & Facturation, puis cliquez sur "Mettre à niveau" pour accéder à tous les plans.' },
  { q: 'Comment utiliser un code d\'activation ?', a: 'Rendez-vous sur la page des abonnements ou dans Paramètres > Usage Tensors. Entrez votre code de 12 caractères dans le champ prévu.' },
  { q: 'La recherche Internet est-elle incluse dans mon plan ?', a: 'La recherche web est disponible à partir du plan Advanced. Elle permet à l\'IA d\'accéder à des informations en temps réel.' },
  { q: 'Comment annuler mon abonnement ?', a: 'Allez dans Paramètres > Plan & Facturation > Gérer le plan, puis cliquez sur "Annuler l\'abonnement". Un questionnaire rapide vous sera proposé.' },
  { q: 'Mes données sont-elles confidentielles ?', a: 'Oui, toutes vos conversations sont privées et ne sont jamais partagées avec des tiers.' },
];

export default function SupportPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const send = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    const user = await base44.auth.me().catch(() => null);
    await base44.integrations.Core.SendEmail({
      to: user?.email || 'support@stensor.app',
      subject: `[Support] ${subject}`,
      body: `De: ${user?.full_name || 'Utilisateur'} (${user?.email})\n\n${message}`,
    });
    setSending(false);
    setSent(true);
    setSubject('');
    setMessage('');
    toast.success('Message envoyé');
  };

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
          </button>
          <div>
            <h1 className="text-2xl font-black" style={{ color: FG }}>Centre d'aide</h1>
            <p className="text-sm" style={{ color: '#999' }}>Trouvez des réponses ou contactez l'équipe Stensor</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* FAQ */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center" style={{ background: YUZU, borderRadius: '4px' }}>
                <Book className="w-3.5 h-3.5" style={{ color: FG }} />
              </div>
              <h2 className="text-base font-black" style={{ color: FG }}>Questions fréquentes</h2>
            </div>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={i} className="border overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '5px' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-black/2">
                    <span className="text-sm font-semibold" style={{ color: FG }}>{faq.q}</span>
                    <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: '#bbb', transform: openFaq === i ? 'rotate(90deg)' : 'none' }} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                        <p className="px-4 pb-3 text-sm leading-relaxed" style={{ color: '#666' }}>{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center" style={{ background: FG, borderRadius: '4px' }}>
                <MessageSquare className="w-3.5 h-3.5" style={{ color: YUZU }} />
              </div>
              <h2 className="text-base font-black" style={{ color: FG }}>Contacter le support</h2>
            </div>

            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="p-6 text-center" style={{ border: '1px solid rgba(22,163,74,0.2)', borderRadius: '6px', background: 'rgba(22,163,74,0.05)' }}>
                <div className="w-10 h-10 flex items-center justify-center mx-auto mb-3" style={{ background: '#16a34a', borderRadius: '50%' }}>
                  <Check className="w-5 h-5 text-white" />
                </div>
                <p className="font-black text-base mb-1" style={{ color: FG }}>Message envoyé</p>
                <p className="text-sm" style={{ color: '#666' }}>L'équipe Stensor vous répondra dans les plus brefs délais.</p>
                <button onClick={() => setSent(false)} className="mt-4 text-xs font-semibold" style={{ color: '#999' }}>Envoyer un autre message</button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: '#555' }}>Sujet</label>
                  <input value={subject} onChange={e => setSubject(e.target.value)}
                    placeholder="Ex: Problème avec mon abonnement"
                    className="w-full px-3 py-2.5 text-sm focus:outline-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: '#555' }}>Message</label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Décrivez votre problème en détail..."
                    rows={5}
                    className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
                </div>
                <button onClick={send} disabled={sending || !subject.trim() || !message.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all disabled:opacity-40"
                  style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                  <Send className="w-4 h-4" />
                  {sending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            )}

            <div className="mt-5 p-3" style={{ background: 'rgba(0,0,0,0.02)', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5" style={{ color: '#aaa' }} />
                <span className="text-xs font-semibold" style={{ color: '#555' }}>Temps de réponse</span>
              </div>
              <p className="text-xs" style={{ color: '#888' }}>Généralement moins de 24h en jours ouvrés.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}