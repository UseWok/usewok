// Scrollable message list — chat left panel body
import { useRef, useEffect } from 'react';
import AssistantMessage from './AssistantMessage';
import UserMessageBubble from './UserMessageBubble';

export default function MessageList({ messages, isLoading, currentQuery, setFicheContent, setViewMode }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: '4px 0 0 0' }}>
      <div className="flex flex-col gap-3 px-4 pb-2">
        {messages?.map((msg, idx) => (
          <div key={idx}>
            {msg.role === 'assistant' ? (
              <AssistantMessage
                content={msg.content}
                isGenerating={false}
                query={msg.content}
                rawContent={msg.rawContent}
                onPreviewClick={() => {
                  if (msg.rawContent) {
                    setFicheContent(msg.rawContent);
                    setViewMode('preview');
                  }
                }}
              />
            ) : (
              <UserMessageBubble msg={msg} />
            )}
          </div>
        ))}
        {isLoading && <AssistantMessage content={null} isGenerating={true} query={currentQuery} />}
      </div>
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}