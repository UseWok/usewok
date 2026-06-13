/**
 * HomeInputWrapper
 * Wraps ChatInputBar for the Home page, adding a file attachment button
 * positioned at the TOP-LEFT corner of the text area container.
 * The textarea has left padding to avoid text overlapping the button.
 */
import { useRef, useState } from 'react';
import { Paperclip, X, FileText } from 'lucide-react';
import ChatInputBar from '@/components/chat/ChatInputBar';

export default function HomeInputWrapper({ input, setInput, onSend, buildMode, files, setFiles }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const dropped = Array.from(e.target.files || []);
    if (!dropped.length) return;
    setFiles(prev => [
      ...(prev || []),
      ...dropped.map(f => ({ file: f, name: f.name, url: URL.createObjectURL(f), type: f.type })),
    ]);
    e.target.value = '';
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* ── File attachment button — top-left of the input card ── */}
      <div style={{
        position: 'absolute',
        // Align with the textarea area: top of card + card padding
        top: 12,
        left: 14,
        zIndex: 10,
        pointerEvents: 'auto',
      }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.txt,.csv,.json,.md"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          title="Attach a file"
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 26, height: 26, borderRadius: 8, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.09)',
            transition: 'background 120ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
        >
          <Paperclip style={{ width: 13, height: 13, color: '#aaa' }} />
        </button>
      </div>

      {/* Attached file chips — shown above the input bar */}
      {(files || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 12px 6px', marginBottom: 2 }}>
          {files.map((file, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#2A2A2A', border: '1px solid #3A3A3A',
              borderRadius: 8, padding: '4px 8px', fontSize: 11, color: '#ccc',
            }}>
              {file.type?.startsWith('image/')
                ? <img src={file.url} style={{ width: 16, height: 16, objectFit: 'cover', borderRadius: 3 }} alt="" />
                : <FileText style={{ width: 12, height: 12, color: '#888' }} />
              }
              <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
              <button
                onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: 0, display: 'flex' }}
              >
                <X style={{ width: 10, height: 10 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ChatInputBar — textarea gets extra left padding so text clears the attach button */}
      <div style={{ '--home-input-pl': '44px' }}>
        <ChatInputBar
          input={input}
          setInput={setInput}
          onSend={onSend}
          isLoading={false}
          files={files}
          setFiles={setFiles}
          buildMode={buildMode}
          _extraTextareaPaddingLeft={44}
        />
      </div>
    </div>
  );
}