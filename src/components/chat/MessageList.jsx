// Scrollable message list — chat left panel body
import { useRef, useEffect } from 'react';
import AssistantMessage from './AssistantMessage';
import UserMessageBubble from './UserMessageBubble';
import InsufficientPromptBubble from './InsufficientPromptBubble';

export default function MessageList({ messages, isLoading, currentQuery, setFicheContent, setViewMode, streamingThinking }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: '4px 0 0 0' }}>
      <div className="flex flex-col gap-3 px-4 pb-2">
        {messages?.map((msg, idx) => {
          if (msg.role === 'assistant') {
            // Elegant insufficient prompt state
            const content = msg.content || '';
            if (content === '__INSUFFICIENT__' || content.startsWith('__INSUFFICIENT__:')) {
              const hint = content.startsWith('__INSUFFICIENT__:') ? content.slice('__INSUFFICIENT__:'.length).trim() : '';
              return <InsufficientPromptBubble key={idx} hint={hint} />;
            }
            return (
              <AssistantMessage
                key={idx}
                content={content}
                isGenerating={false}
                query={content}
                rawContent={msg.rawContent}
                onPreviewClick={() => {
                  if (msg.rawContent) {
                    setFicheContent(msg.rawContent);
                    setViewMode('preview');
                  }
                }}
              />
            );
          }
          return <UserMessageBubble key={idx} msg={msg} />;
        })}
        {isLoading && <AssistantMessage content={null} isGenerating={true} query={currentQuery} streamingThinking={streamingThinking} />}
      </div>
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}