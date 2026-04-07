import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Image, FileCode } from 'lucide-react';

const FG = '#0A0A0A';

function getFileIcon(name) {
  const ext = name?.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return Image;
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'json', 'html', 'css'].includes(ext)) return FileCode;
  return FileText;
}

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1048576).toFixed(1)}MB`;
}

export default function FilePreviewPanel({ files, onRemove, open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.3)' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 bg-white shadow-2xl"
            style={{
              bottom: '120px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'min(420px, 90vw)',
              borderRadius: '8px',
              border: '1px solid rgba(0,0,0,0.09)',
            }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: '#aaa' }}>
                {files.length} fichier{files.length > 1 ? 's' : ''}
              </p>
              <button onClick={onClose}
                className="w-6 h-6 flex items-center justify-center hover:bg-black/5 transition-colors"
                style={{ borderRadius: '3px' }}>
                <X className="w-3.5 h-3.5" style={{ color: '#999' }} />
              </button>
            </div>

            {/* File list */}
            <div className="max-h-72 overflow-y-auto p-2">
              {files.map((file, idx) => {
                const Icon = getFileIcon(file.name);
                return (
                  <div key={idx}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,0,0,0.04)', borderRadius: '3px' }}>
                      <Icon className="w-4 h-4" style={{ color: FG }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: FG }}>{file.name}</p>
                      <p className="text-[10px]" style={{ color: '#bbb' }}>{formatSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => onRemove(idx)}
                      className="w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: 'rgba(239,68,68,0.1)', borderRadius: '3px' }}>
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}