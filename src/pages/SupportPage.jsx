import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MessageSquare, Book, ChevronRight, X, FileText,
  Bug, Zap, Users, ExternalLink, Check, Upload, AlertCircle, Hash
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
    await new Promise(r => setTimeout(r, 2800));
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let file_urls = [];
    for (const f of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        file_urls.push(file_url);
      } catch {}
    }
    await base44.entities.SupportTicket.create({
      description,
      category,
      discussion_id: selectedDiscussion?.id || '',
      file_urls,
      status: 'open',
      user_email: user?.email || '',
      user_plan: user?.subscription_plan || 'free',
    });
    await base44.entities.Notification.create({
      title: `Nouveau ticket — ${user?.email || 'utilisateur'}`,
      message: `Plan: ${user?.subscription_plan || 'free'} | Catégorie: ${category} | ${description.slice(0, 200)}`,
    });
    setSubmitting(false);
    setStep(4);
  };

  const progressPct = [0, 25, 50, 75, 100][step] || 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => { if (e.target === e.currentTarget && step !== 1) onClose(); }}>
      <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        className="w-full max-w-lg bg-white overflow-hidden"
        style={{ borderRadius: '8px', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}>

        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: FG, borderRadius: '4px' }}>
              <MessageSquare className="w-3.5 h-3.5" style={{ color: YUZU }} />
            </div>
            <div>
              <p className="text-sm font-black" style={{ color: FG }}>Ouvrir un ticket</p>
              <p className="text-[10px]" style={{ color: '#999' }}>
                {['Description', 'Analyse', 'Catégorie', 'Discussion', 'Confirmé'][step]}
              </p>
            </div>
          </div>
          {step !== 1 && step !== 4 && (
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
              <X className="w-4 h-4" style={{ color: '#bbb' }} />
            </button>
          )}
        </div>

        <div className="w-full h-1" style={{ background: 'rgba(0,0,0,0.05)' }}>
          <motion.div animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full" style={{ background: YUZU }} />
        </div>

        <div className="p-5">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider mb-1.5 block" style={{ color: '#aaa' }}>Décrivez votre problème *</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Expliquez le problème : quand il survient, ce que vous attendiez, ce qui s'est passé..."
                  rows={5} className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                  style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px' }} />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-wider mb-1.5 block" style={{ color: '#aaa' }}>Fichiers (optionnel)</label>
                <input ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={e => setFiles(p => [...p, ...Array.from(e.target.files || [])])} />
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm transition-all hover:bg-black/2"
                  style={{ border: '1px dashed rgba(0,0,0,0.15)', borderRadius: '4px', color: '#888' }}>
                  <Upload className="w-4 h-4" />
                  Joindre des fichiers (captures d'écran, logs...)
                </button>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-1"
                        style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '3px', border: '1px solid rgba(0,0,0,0.07)' }}>
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
                className="w-full py-3 text-sm font-bold transition-all disabled:opacity-40"
                style={{ background: description.trim() ? FG : 'rgba(0,0,0,0.05)', color: description.trim() ? 'white' : '#bbb', borderRadius: '4px' }}>
                Analyser →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-10 h-10 rounded-full"
                style={{ border: '3px solid rgba(0,0,0,0.08)', borderTopColor: FG }} />
              <div className="text-center">
                <p className="font-black text-sm" style={{ color: FG }}>Analysing...</p>
                <p className="text-xs mt-1" style={{ color: '#999' }}>Analyse de votre problème en cours</p>
              </div>
              {['Lecture de la description', 'Identification du problème', 'Préparation du formulaire'].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.8 }}
                  className="flex items-center gap-2 text-xs" style={{ color: '#888' }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.8 + 0.4 }}
                    className="w-4 h-4 flex items-center justify-center flex-shrink-0" style={{ background: YUZU, borderRadius: '50%' }}>
                    <Check className="w-2.5 h-2.5" style={{ color: FG }} />
                  </motion.div>
                  {t}
                </motion.div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold mb-4" style={{ color: FG }}>De quel type de problème s'agit-il ?</p>
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const sel = category === cat.id;
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all"
                    style={{ border: `1px solid ${sel ? FG : 'rgba(0,0,0,0.08)'}`, background: sel ? FG : 'white', borderRadius: '5px' }}>
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                      style={{ background: sel ? YUZU : 'rgba(0,0,0,0.05)', borderRadius: '3px' }}>
                      <Icon className="w-4 h-4" style={{ color: sel ? FG : '#666' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: sel ? 'white' : FG }}>{cat.label}</p>
                      <p className="text-xs" style={{ color: sel ? 'rgba(255,255,255,0.6)' : '#999' }}>{cat.desc}</p>
                    </div>
                    {sel && <Check className="w-4 h-4" style={{ color: YUZU }} />}
                  </button>
                );
              })}
              <button onClick={() => setStep(3)} disabled={!category}
                className="w-full py-3 text-sm font-bold transition-all disabled:opacity-40 mt-2"
                style={{ background: category ? FG : 'rgba(0,0,0,0.05)', color: category ? 'white' : '#bbb', borderRadius: '4px' }}>
                Continuer →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: FG }}>Discussion concernée</p>
                <p className="text-xs mb-3" style={{ color: '#999' }}>Optionnel — sélectionnez la discussion où le problème a eu lieu</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {discussions.length === 0 && <p className="text-xs py-4 text-center" style={{ color: '#bbb' }}>Aucune discussion disponible</p>}
                  {discussions.slice(0, 10).map(d => {
                    const sel = selectedDiscussion?.id === d.id;
                    return (
                      <button key={d.id} onClick={() => setSelectedDiscussion(sel ? null : d)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all"
                        style={{ border: `1px solid ${sel ? FG : 'rgba(0,0,0,0.08)'}`, background: sel ? FG : 'white', borderRadius: '4px' }}>
                        <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" style={{ color: sel ? YUZU : '#bbb' }} />
                        <span className="text-xs truncate flex-1" style={{ color: sel ? 'white' : '#555' }}>{d.title || d.id}</span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: sel ? 'rgba(255,255,255,0.4)' : '#ccc' }}>{d.date}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3 text-sm font-bold transition-all disabled:opacity-60"
                style={{ background: FG, color: 'white', borderRadius: '4px' }}>
                {submitting ? 'Envoi...' : 'Soumettre le ticket →'}
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-2 text-sm transition-colors hover:opacity-60"
                style={{ color: '#999' }}>
                Passer cette étape
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-14 h-14 flex items-center justify-center" style={{ background: YUZU, borderRadius: '50%' }}>
                <Check className="w-7 h-7" style={{ color: FG }} />
              </div>
              <div>
                <p className="text-base font-black mb-2" style={{ color: FG }}>Ticket ouvert !</p>
                <p className="text-sm" style={{ color: '#666' }}>Votre ticket a été transmis. L'équipe Stensor vous répondra par email.</p>
              </div>
              <button onClick={onClose}
                className="mt-2 px-6 py-2.5 text-sm font-bold"
                style={{ background: FG, color: 'white', borderRadius: '4px' }}>
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
  const [communityUrl, setCommunityUrl] = useState('');

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.AppSettings.filter({ key: 'community_urls' }).then(results => {
      if (results.length > 0) {
        try {
          const urls = JSON.parse(results[0].value);
          setDiscordUrl(urls.discord || '');
          setCommunityUrl(urls.community || '');
        } catch {}
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white font-be">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-10">
          <button onClick={() => navigate('/')} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors" style={{ borderRadius: '4px' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#888' }} />
          </button>
          <div>
            <h1 className="text-2xl font-black" style={{ color: FG }}>Centre d'aide</h1>
            <p className="text-sm" style={{ color: '#999' }}>Documentation, communauté et support technique</p>
          </div>
        </div>

        {/* 3 action cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <button onClick={() => document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center gap-3 p-6 text-center transition-all hover:opacity-90"
            style={{ background: YUZU, borderRadius: '8px' }}>
            <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.08)', borderRadius: '50%' }}>
              <Book className="w-6 h-6" style={{ color: FG }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: FG }}>Documentation</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(0,0,0,0.5)' }}>FAQ et guides</p>
            </div>
          </button>

          <button onClick={() => discordUrl ? window.open(discordUrl, '_blank') : null}
            className="flex flex-col items-center gap-3 p-6 text-center transition-all hover:opacity-90"
            style={{ background: '#5865F2', borderRadius: '8px', cursor: discordUrl ? 'pointer' : 'default' }}>
            <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '50%' }}>
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-black text-sm text-white">Communauté Discord</p>
              <p className="text-xs mt-0.5 text-white/60">{discordUrl ? 'Rejoindre le serveur' : 'Lien non configuré'}</p>
            </div>
          </button>

          <button onClick={() => setShowTicket(true)}
            className="flex flex-col items-center gap-3 p-6 text-center transition-all hover:opacity-90"
            style={{ background: FG, borderRadius: '8px' }}>
            <div className="w-12 h-12 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
              <AlertCircle className="w-6 h-6" style={{ color: YUZU }} />
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: YUZU }}>Support Ticket</p>
              <p className="text-xs mt-0.5 text-white/50">Ouvrir un ticket</p>
            </div>
          </button>
        </div>

        {/* Community link */}
        {communityUrl && (
          <div className="mb-8 flex items-center justify-between px-5 py-4"
            style={{ background: 'rgba(0,0,0,0.03)', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" style={{ color: '#888' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: FG }}>Rejoindre la communauté</p>
                <p className="text-xs" style={{ color: '#999' }}>Échangez avec d'autres utilisateurs Stensor</p>
              </div>
            </div>
            <button onClick={() => window.open(communityUrl, '_blank')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all hover:opacity-90"
              style={{ background: FG, color: 'white', borderRadius: '4px' }}>
              Rejoindre <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* FAQ */}
        <div id="faq-section">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 flex items-center justify-center" style={{ background: YUZU, borderRadius: '4px' }}>
              <Book className="w-3.5 h-3.5" style={{ color: FG }} />
            </div>
            <h2 className="text-base font-black" style={{ color: FG }}>Questions fréquentes</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} style={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-black/2 transition-colors">
                  <span className="text-sm font-semibold" style={{ color: FG }}>{faq.q}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: '#bbb', transform: openFaq === i ? 'rotate(90deg)' : 'none' }} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                      <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: '#666' }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTicket && <TicketWizard onClose={() => setShowTicket(false)} user={user} />}
      </AnimatePresence>
    </div>
  );
}