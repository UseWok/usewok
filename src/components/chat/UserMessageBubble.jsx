import { useState } from 'react';
import { FileText, Image, FileCode, Copy, Pencil, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserColor } from '@/lib/user-color';

const FG = '#0A0A0A';
const MAX_INLINE = 3;

function getFileIcon(name = '') {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return Image;
  if (['js','ts','jsx','tsx','py','java','json','html','css'].includes(ext)) return FileCode;
  return FileText;
}

export default function UserMessageBubble({ msg, userName, user, onCopy, onEdit }) {
  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';
  const fileNames = msg.files || [];
  const inlineFiles = fileNames.slice(0, MAX_INLINE);
  const extraFiles = fileNames.slice(MAX_INLINE);
  const [showExtra, setShowExtra] = useState(false);

  return (
    <div className="flex gap-3 group justify-end">
      <div className="flex flex-col gap-1 items-end max-w-[72%]">
        <p className="text-[10px] font-semibold px-1" style={{ color: '#bbb' }}>{userName}</p>

        {/* File tags */}
        {fileNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end mb-1">
            {inlineFiles.map((name, i) => {
              const Icon = getFileIcon(name);
              return (
                <div key={i} className="flex items-center gap-1 px-2 py-1"
                  style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.09)', borderRadius: '4px', maxWidth: '140px' }}>
                  <Icon className="w-3 h-3 flex-shrink-0" style={{ color: '#888' }} />
                  <span className="text-[10px] font-medium truncate" style={{ color: '#555' }}>{name}</span>
                </div>
              );
            })}
            {extraFiles.length > 0 && (
              <button onClick={() => setShowExtra(true)}
                className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold"
                style={{ background: FG, color: '#DDFF00', borderRadius: '4px' }}>
                +{extraFiles.length} fichiers
              </button>
            )}
          </div>
        )}

        <div className="text-sm leading-relaxed px-3 py-2"
          style={{ background: 'rgba(0,0,0,0.05)', color: FG, borderRadius: '4px', borderTopRightRadius: '2px', fontWeight: 300 }}>
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        </div>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onCopy(msg.content)}
            className="w-6 h-6 rounded-sm flex items-center justify-center transition-colors hover:bg-black/6">
            <Copy className="w-3 h-3" style={{ color: '#bbb' }} />
          </button>
          <button onClick={onEdit}
            className="w-6 h-6 rounded-sm flex items-center justify-center transition-colors hover:bg-black/6">
            <Pencil className="w-3 h-3" style={{ color: '#bbb' }} />
          </button>
        </div>
      </div>
      <div className="w-5 h-5 rounded-sm flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 mt-5"
        style={{ background: getUserColor(user) }}>
        {userInitial}
      </div>

      {/* Extra files mini window */}
      <AnimatePresence>
        {showExtra && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40" onClick={() => setShowExtra(false)}
              style={{ background: 'rgba(0,0,0,0.3)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="fixed z-50 bg-white shadow-2xl"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(360px,90vw)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.09)' }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#aaa' }}>
                  {fileNames.length} fichiers joints
                </p>
                <button onClick={() => setShowExtra(false)} className="w-6 h-6 flex items-center justify-center hover:bg-black/5"
                  style={{ borderRadius: '3px' }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#999' }} />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {fileNames.map((name, i) => {
                  const Icon = getFileIcon(name);
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '3px' }}>
                        <Icon className="w-4 h-4" style={{ color: FG }} />
                      </div>
                      <p className="text-xs font-semibold truncate flex-1" style={{ color: FG }}>{name}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}