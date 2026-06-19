/**
 * QuickInserts — chips to quickly add auth / link snippets into the chat input
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const INSERTS = [
  {
    group: 'Auth',
    emoji: '🔐',
    items: [
      { label: 'Ajouter login', text: 'Ajoute un système de connexion : bouton de login, gestion de session utilisateur avec base44.auth.me(), et redirection si non connecté.' },
      { label: 'Page protégée', text: 'Protège cette page : si l\'utilisateur n\'est pas connecté, redirige vers la page de login avec base44.auth.redirectToLogin().' },
      { label: 'Afficher user', text: 'Affiche le nom et l\'email de l\'utilisateur connecté en récupérant les données via base44.auth.me().' },
      { label: 'Bouton logout', text: 'Ajoute un bouton de déconnexion qui appelle base44.auth.logout().' },
      { label: 'Rôle admin', text: 'Restreins cette fonctionnalité aux utilisateurs avec le rôle admin (user.role === "admin").' },
    ],
  },
  {
    group: 'Navigation',
    emoji: '🔗',
    items: [
      { label: 'Lien page', text: 'Ajoute un lien de navigation vers une autre page en utilisant react-router-dom <Link to="/ma-page">.' },
      { label: 'Bouton retour', text: 'Ajoute un bouton retour qui utilise useNavigate() de react-router-dom pour revenir à la page précédente.' },
      { label: 'Redirection auto', text: 'Ajoute une redirection automatique vers /dashboard après 2 secondes en utilisant useNavigate() de react-router-dom.' },
      { label: 'Menu navigation', text: 'Ajoute une barre de navigation avec des liens vers les principales pages de l\'app en utilisant <NavLink> de react-router-dom.' },
    ],
  },
];

export default function QuickInserts({ onInsert }) {
  const [openGroup, setOpenGroup] = useState(null);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px 6px', flexWrap: 'wrap' }}>
      {INSERTS.map((group) => {
        const isOpen = openGroup === group.group;
        return (
          <div key={group.group} style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenGroup(isOpen ? null : group.group)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                height: 26, padding: '0 9px',
                borderRadius: 999,
                border: isOpen ? '1px solid rgba(0,0,0,0.28)' : '1px solid rgba(0,0,0,0.15)',
                background: isOpen ? 'rgba(0,0,0,0.06)' : 'transparent',
                cursor: 'pointer', fontSize: 12, fontWeight: 500, color: '#333',
                fontFamily: 'Inter, sans-serif', transition: 'all 100ms',
              }}
              onMouseEnter={e => { if (!isOpen) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.28)'; }}
              onMouseLeave={e => { if (!isOpen) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; }}
            >
              <span>{group.emoji}</span>
              <span>{group.group}</span>
              <ChevronDown style={{ width: 10, height: 10, opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
                    background: '#fff', border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 10, boxShadow: '0 6px 20px rgba(0,0,0,0.10)',
                    minWidth: 220, padding: '4px', zIndex: 9999,
                  }}
                >
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => { onInsert(item.text); setOpenGroup(null); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 10px', background: 'none', border: 'none',
                        borderRadius: 6, cursor: 'pointer', textAlign: 'left',
                        fontSize: 12.5, fontWeight: 500, color: '#111',
                        fontFamily: 'Inter, sans-serif', transition: 'background 100ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}