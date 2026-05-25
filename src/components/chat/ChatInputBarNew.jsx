import React, { useState, useRef, useEffect } from 'react';
import { Plus, Share2, Mic, ArrowUp } from 'lucide-react';

export default function ChatInputBarNew({ input, setInput, onSend, isLoading, onStop }) {
  const textareaRef = useRef(null);
  const charLimit = 300;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!isLoading && input.trim()) onSend(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = !!input.trim();

  return (
    <div style={{ padding: '16px 0' }}>
      {/* Main pill container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#F5F5F5',
          border: '1px solid #E5E5E5',
          borderRadius: 28,
          padding: '12px 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Plus icon */}
        <button
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid #D0D0D0',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F0F0F0';
            e.currentTarget.style.borderColor = '#B0B0B0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#D0D0D0';
          }}
        >
          <Plus style={{ width: 18, height: 18 }} />
        </button>

        {/* Share icon */}
        <button
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid #D0D0D0',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F0F0F0';
            e.currentTarget.style.borderColor = '#B0B0B0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#D0D0D0';
          }}
        >
          <Share2 style={{ width: 16, height: 16 }} />
        </button>

        {/* Build dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#333' }}>Build</span>
          <span style={{ color: '#999', fontSize: 12 }}>▼</span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Mic icon */}
        <button
          style={{
            flexShrink: 0,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid #D0D0D0',
            background: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F0F0F0';
            e.currentTarget.style.borderColor = '#B0B0B0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFFFFF';
            e.currentTarget.style.borderColor = '#D0D0D0';
          }}
        >
          <Mic style={{ width: 16, height: 16 }} />
        </button>

        {/* Send button */}
        {isLoading ? (
          <button
            onClick={onStop}
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#888888',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#707070')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#888888')}
          >
            <div style={{ width: 12, height: 12, background: '#FFF', borderRadius: 2 }} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!hasContent}
            style={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: hasContent ? '#888888' : '#CCC',
              border: 'none',
              cursor: hasContent ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => {
              if (hasContent) e.currentTarget.style.background = '#707070';
            }}
            onMouseLeave={(e) => {
              if (hasContent) e.currentTarget.style.background = '#888888';
            }}
          >
            <ArrowUp style={{ width: 18, height: 18, color: '#FFF' }} />
          </button>
        )}
      </div>

      {/* Placeholder text below */}
      <p
        style={{
          fontSize: 15,
          color: '#999',
          margin: '8px 0 0 16px',
          fontWeight: 400,
          lineHeight: 1.4,
        }}
      >
        Tell Lovable what to do instead...
      </p>
    </div>
  );
}