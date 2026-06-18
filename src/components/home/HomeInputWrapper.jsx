/**
 * HomeInputWrapper
 * Wraps ChatInputBar. Files attached are shown as compact chips inside the textarea area,
 * replacing the old top-left button. No separate attach button — files come from ChatInputBar's + menu.
 */
import { useRef } from 'react';
import { X, FileText } from 'lucide-react';
import ChatInputBar from '@/components/chat/ChatInputBar';

export default function HomeInputWrapper({ input, setInput, onSend, buildMode, files, setFiles, user }) {
  return (
    <div style={{ width: '100%' }}>
      {/* Compact file chips — shown above input bar when files are attached */}
      {(files || []).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '0 14px 6px' }}>
          {files.map((file, i) => (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#F0F0EE', border: '1px solid #DDDDD9',
              borderRadius: 6, padding: '3px 7px', fontSize: 11, color: '#555',
              maxWidth: 140,
            }}>
              {file.type?.startsWith('image/')
                ? <img src={file.url} style={{ width: 14, height: 14, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }} alt="" />
                : <FileText style={{ width: 11, height: 11, color: '#777', flexShrink: 0 }} />
              }
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
              <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, display: 'flex', flexShrink: 0, lineHeight: 1 }}>
                <X style={{ width: 9, height: 9 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      <ChatInputBar
        input={input}
        setInput={setInput}
        onSend={onSend}
        isLoading={false}
        files={files}
        setFiles={setFiles}
        buildMode={buildMode}
        user={user}
      />
    </div>
  );
}