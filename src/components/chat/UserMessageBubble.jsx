// Standalone user message bubble component
const renderUserText = (text) => {
  if (!text) return null;
  return text.split(/(hovering)/g).map((part, i) =>
    part === 'hovering'
      ? <span key={i} style={{ textDecoration: 'underline' }}>hovering</span>
      : part
  );
};

export default function UserMessageBubble({ msg }) {
  return (
    <div className="flex flex-col items-end w-full gap-1">
      {(msg.images?.length || 0) > 0 && (
        <div className="flex flex-wrap gap-2 max-w-[75%] justify-end">
          {msg.images.map((imgUrl, i) => (
            <img key={i} src={imgUrl} alt="attachment"
              className="max-w-[160px] max-h-[120px] rounded-2xl object-cover" />
          ))}
        </div>
      )}
      {msg.content && (
        <div
          className="inline-block max-w-[75%] text-left whitespace-pre-wrap"
          style={{ background: '#F0F0F0', borderRadius: 14, padding: '10px 13px', fontSize: 13, color: '#222222', lineHeight: 1.5 }}>
          {renderUserText(msg.content)}
        </div>
      )}
      <span style={{ fontSize: 11, color: '#AAAAAA', marginRight: 2 }}>
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}