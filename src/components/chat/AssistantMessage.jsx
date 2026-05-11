import { useState } from 'react';
import { LOGO_URL } from '@/lib/chat-constants'; // Assure-toi que ce lien est correct

export default function AssistantMessage({ content, agent, meta, onClick, discussMode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex justify-start items-start gap-3 group w-full mb-3">
      
      {/* GROS LOGO STENSOR AVEC OPACITÉ */}
      <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
        <img src={LOGO_URL} alt="Stensor" className="w-full h-full object-contain opacity-70" />
      </div>

      <div className="relative flex flex-col w-full max-w-[85%]">
        <div className="flex items-center justify-between pl-1 mb-1 relative">
          <span className="text-[12px] font-bold text-slate-800">Stensor</span>

          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-1 text-gray-400 hover:text-gray-800 rounded-md transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1.5 font-open">
                  <button onClick={() => { navigator.clipboard.writeText(content); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Copy message
                  </button>
                  <button className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    Copy message link
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MESSAGE SANS FOND (bg-transparent) ET AFFICHAGE DIRECT */}
        <div onClick={onClick} className="bg-transparent px-1 py-0.5 text-sm leading-relaxed text-slate-800 font-normal cursor-pointer">
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
      </div>
    </div>
  );
}