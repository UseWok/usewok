import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MessageSquare, Book, ChevronRight, X, FileText,
  Bug, Zap, ExternalLink, Check, Upload, Hash, Clock, ChevronDown
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FG = '#0A0A0A';
const YUZU = '#DDFF00';

const FAQS = [
  { q: 'Comment fonctionne les Tensors ?', a: '1 Tensor = 1 réponse IA. Votre quota se renouvelle chaque mois selon votre plan.' },
  { q: 'Comment changer mon abonnement ?', a: 'Allez dans Paramètres > Plan & Facturation, puis cliquez sur "Mettre à niveau".' },
  { q: "Comment utiliser un code d'activation ?", a: "Rendez-vous sur la page des abonnements. Entrez votre code dans le champ prévu en bas de page." },
  { q: 'La recherche Internet est-elle incluse ?', a: "La recherche web est disponible à partir du plan Advanced." },
  { q: "Comment annuler mon abonnement ?", a: "Allez dans Paramètres > Plan & Facturation > Gérer le plan." },
  { q: 'Mes données sont-elles confidentielles ?', a: 'Oui, toutes vos conversations sont privées et ne sont jamais partagées.' },
];

const CATEGORIES = [
  { id: 'bug_report', label: 'Bug Report', desc: 'Quelque chose ne fonctionne pas', icon: Bug },
  { id: 'chat_issue', label: 'Problème de Chat', desc: 'Problème avec une conversation IA', icon: MessageSquare },
  { id: 'other', label: 'Autre', desc: 'Autre demande ou question', icon: Zap },
];

const STORAGE_KEY = 'discussions_v1';

const STATUS_CONFIG = {
  open: { label: 'Ouvert', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  in_progress: { label: 'En cours', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  closed: { label: 'Résolu', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
};

function TicketWizard({ onClose, user }) {
  const [step, setStep] = useState(0);
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [discussions] = useState(() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } });
  const fileInputRef = useRef(null);

  const handleAnalyse = async () => {
    if (!description.trim()) return;
    setStep(1);
    await new Promise(r => setTimeout(r, 2200));
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let file_urls = [];
    for (const f of files) {
      try { const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); file_urls.push(file_url); } catch {}
    }
    await base44.entities.SupportTicket.create({
      description, category,
      discussion_id: selectedDiscussion?.id || '',
      file_urls, status: 'open',
      user_email: user?.email || '',
      user_plan: user?.subscription_plan || 'free',
    });
    setSubmitting(false);
    setStep(4);
  };

  const steps = ['Description', 'Analyse', 'Catégorie', 'Discussion', 'Confirmé'];
  const progressPct = [0, 33, 55, 77, 100][step] || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget && step !== 1) onClose(); }}>
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full bg-white overflow-hidden sm:max-w-md"
        style={{ borderRadius: '20px 20px 0 0', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.15)' }} />
        </div>

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between sticky top-0 bg-white z-10" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: FG, borderRadius: '6px' }}>
              <MessageSquare className="w-3.5 h-3.5" style={{ color: YUZU }} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: FG }}>Ouvrir un ticket</p>
              <p className="text-[10px]" style={{ color: '#bbb' }}>{steps[step]}</p>
            </div>
          </div>
          {step !== 1 && step !== 4 && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '6px' }}>
              <X className="w-4 h-4" style={{ color: '#999' }} />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="w-full h-0.5" style={{ background: 'rgba(0,0,0,0.05)' }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }}
            className="h-full" style={{ background: FG }} />
        </div>

        <div className="p-5">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider mb-2 block" style={{ color: '#aaa' }}>Décrivez votre problème *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Expliquez le problème en détail..."
                  rows={4} className="w-full px-3.5 py-3 text-sm focus:outline-none resize-none"
                  style={{ border: `1.5px solid ${description ? FG : 'rgba(0,0,0,0.1)'}`, borderRadius: '10px', transition: 'border-color 0.15s' }} />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider mb-2 block" style={{ color: '#aaa' }}>Fichiers (optionnel)</label>
                <input ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm transition-all"
                  style={{ border: '1.5px dashed rgba(0,0,0,0.12)', borderRadius: '10px', color: '#999' }}>
                  <Upload className="w-4 h-4" /> Joindre des fichiers
                </button>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5"
                        style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '6px' }}>
                        <FileText className="w-3 h-3" style={{ color: '#888' }} />
                        <span className="text-[11px] max-w-[80px] truncate" style={{ color: '#555' }}>{f.name}</span>
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}>
                          <X className="w-2.5 h-2.5" style={{ color: '#bbb' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleAnalyse} disabled={!description.trim()}
                className="w-full py-3.5 text-sm font-black transition-all disabled:opacity-30"
                style={{ background: FG, color: 'white', borderRadius: '10px' }}>
                Continuer →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                className="w-10 h-10 rounded-full"
                style={{ border: '3px solid rgba(0,0,0,0.08)', borderTopColor: FG }} />
              <div className="text-center">
                <p className="font-black text-sm" style={{ color: FG }}>Analyse en cours…</p>
                <p className="text-xs mt-1" style={{ color: '#aaa' }}>Traitement de votre demande</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold mb-4" style={{ color: FG }}>Type de problème</p>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const sel = category === cat.id;
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all"
                    style={{ border: `1.5px solid ${sel ? FG : 'rgba(0,0,0,0.08)'}`, background: sel ? FG : 'white', borderRadius: '12px' }}>
                    <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                      style={{ background: sel ? YUZU : 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                      <Icon className="w-4 h-4" style={{ color: sel ? FG : '#666' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: sel ? 'white' : FG }}>{cat.label}</p>
                      <p className="text-xs" style={{ color: sel ? 'rgba(255,255,255,0.55)' : '#aaa' }}>{cat.desc}</p>
                    </div>
                    {sel && <Check className="w-4 h-4 flex-shrink-0" style={{ color: YUZU }} />}
                  </button>
                );
              })}
              <button onClick={() => setStep(3)} disabled={!category}
                className="w-full py-3.5 text-sm font-black transition-all disabled:opacity-30 mt-2"
                style={{ background: FG, color: 'white', borderRadius: '10px' }}>
                Continuer →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: FG }}>Discussion concernée</p>
                <p className="text-xs mb-3" style={{ color: '#aaa' }}>Optionnel — sélectionnez si applicable</p>
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {discussions.length === 0 && <p className="text-xs py-4 text-center" style={{ color: '#ccc' }}>Aucune discussion</p>}
                  {discussions.slice(0, 10).map(d => {
                    const sel = selectedDiscussion?.id === d.id;
                    return (
                      <button key={d.id} onClick={() => setSelectedDiscussion(sel ? null : d)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all"
                        style={{ border: `1.5px solid ${sel ? FG : 'rgba(0,0,0,0.08)'}`, background: sel ? FG : 'white', borderRadius: '8px' }}>
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: sel ? YUZU : '#ccc' }} />
                        <span className="text-xs truncate flex-1" style={{ color: sel ? 'white' : '#555' }}>{d.title || d.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3.5 text-sm font-black transition-all disabled:opacity-60"
                style={{ background: FG, color: 'white', borderRadius: '10px' }}>
                {submitting ? 'Envoi…' : 'Soumettre le ticket →'}
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-2 text-sm" style={{ color: '#bbb' }}>
                Passer cette étape
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-16 h-16 flex items-center justify-center" style={{ background: YUZU, borderRadius: '50%' }}>
                <Check className="w-8 h-8" style={{ color: FG }} />
              </div>
              <div>
                <p className="text-base font-black mb-2" style={{ color: FG }}>Ticket ouvert !</p>
                <p className="text-sm" style={{ color: '#777' }}>L'équipe Stensor vous répondra par email dans les plus brefs délais.</p>
              </div>
              <button onClick={onClose}
                className="mt-2 px-8 py-3 text-sm font-black"
                style={{ background: FG, color: 'white', borderRadius: '10px' }}>
                Fermer
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SupportPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [user, setUser] = useState(null);
  const [discordUrl, setDiscordUrl] = useState('');
  const [myTickets, setMyTickets] = useState([]);

  const loadTickets = (u) => {
    if (u) base44.entities.SupportTicket.filter({ user_email: u.email })
      .then(t => setMyTickets(t.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))))
      .catch(() => {});
  };

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); loadTickets(u); }).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'community_urls' }).then(results => {
      if (results.length > 0) { try { const urls = JSON.parse(results[0].value); setDiscordUrl(urls.discord || ''); } catch {} }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen font-be" style={{ background: '#fafafa' }}>
      <div className="max-w-2xl mx-auto px-4 py-6 pb-16">

        {/* Header */}
        <div className="relative overflow-hidden mb-8 px-5 py-6"
          style={{ background: FG, borderRadius: '14px' }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(221,255,0,0.1) 0%, transparent 55%)'
          }} />
          <div className="relative flex items-center gap-4">
            <button onClick={() => navigate('/')}
              className="w-9 h-9 flex items-center justify-center flex-shrink-0 transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black text-white">Centre d'aide</h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Support · Documentation · Community</p>
            </div>
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0"
              style={{ background: YUZU, borderRadius: '10px' }}>
              <MessageSquare className="w-5 h-5" style={{ color: FG }} />
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="mb-6 space-y-3">
          {/* Primary CTA */}
          <button onClick={() => setShowTicket(true)}
            className="w-full flex items-center gap-4 p-5 text-left transition-all"
            style={{ background: FG, borderRadius: '14px' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0"
              style={{ background: YUZU, borderRadius: '12px' }}>
              <MessageSquare className="w-6 h-6" style={{ color: FG }} />
            </div>
            <div className="flex-1">
              <p className="text-base font-black text-white">Ouvrir un ticket</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Notre équipe vous répond rapidement</p>
            </div>
            <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} />
          </button>
          {/* Secondary */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-3 p-4 text-left transition-all"
              style={{ background: YUZU, borderRadius: '12px' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '8px' }}>
                <Book className="w-4 h-4" style={{ color: FG }} />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: FG }}>FAQ</p>
                <p className="text-[10px]" style={{ color: 'rgba(0,0,0,0.45)' }}>Réponses rapides</p>
              </div>
            </button>
            <button onClick={() => discordUrl ? window.open(discordUrl, '_blank') : null}
              className="flex items-center gap-3 p-4 text-left transition-all"
              style={{ background: '#5865F2', borderRadius: '12px' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <div className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px' }}>
                <Hash className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-black text-white">Discord</p>
                <p className="text-[10px] text-white/50">Communauté</p>
              </div>
            </button>
          </div>
        </div>

        {/* My Tickets — always shown */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: '#aaa' }} />
              <h2 className="text-sm font-black" style={{ color: FG }}>Mes tickets</h2>
              {myTickets.length > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5" style={{ background: 'rgba(0,0,0,0.07)', color: '#666', borderRadius: '4px' }}>
                  {myTickets.length}
                </span>
              )}
            </div>
            <button onClick={() => setShowTicket(true)}
              className="text-xs font-bold flex items-center gap-1 px-3 py-1.5 transition-all"
              style={{ background: FG, color: 'white', borderRadius: '6px' }}>
              + Nouveau
            </button>
          </div>

          {myTickets.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-3"
              style={{ background: 'white', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.07)' }}>
              <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '12px' }}>
                <MessageSquare className="w-6 h-6" style={{ color: '#ccc' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: '#aaa' }}>Aucun ticket pour l'instant</p>
                <p className="text-xs mt-0.5" style={{ color: '#ccc' }}>Ouvrez un ticket si vous avez un problème</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {myTickets.map(ticket => {
                const s = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                return (
                  <div key={ticket.id} className="p-4"
                    style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-2" style={{ color: FG }}>
                          {ticket.description?.slice(0, 100)}{ticket.description?.length > 100 ? '…' : ''}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: '#ccc' }}>
                          {new Date(ticket.created_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-1 flex-shrink-0"
                        style={{ background: s.bg, color: s.color, borderRadius: '6px' }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FAQ */}
        <div id="faq-section">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 flex items-center justify-center" style={{ background: YUZU, borderRadius: '6px' }}>
                <Book className="w-3.5 h-3.5" style={{ color: FG }} />
              </div>
              <h2 className="text-sm font-black" style={{ color: FG }}>Questions fréquentes</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-1" style={{ background: 'rgba(0,0,0,0.05)', color: '#aaa', borderRadius: '5px' }}>
              {FAQS.length} questions
            </span>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span className="text-sm font-semibold pr-3" style={{ color: FG }}>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform"
                    style={{ color: '#bbb', transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      transition={{ duration: 0.18 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: '#666', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTicket && (
          <TicketWizard
            onClose={() => { setShowTicket(false); loadTickets(user); }}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
}