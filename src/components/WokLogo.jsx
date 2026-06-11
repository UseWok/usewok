/**
 * WokLogo — canonical WOK brand mark
 * The logo is a double orange chevron/arrow pointing left,
 * built from the reference image (img 4): two horizontal orange arrow shapes.
 * Use size prop to control dimensions. Never use text "W" as a logo.
 */
import React from 'react';

export default function WokLogo({ size = 28, className = '' }) {
  // Two stacked left-pointing chevron arrows in WOK coral orange (#F95738)
  // Matches the reference image exactly: flat rectangle body + left arrow cutout
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      fill="none"
      className={className}
      aria-label="WOK"
    >
      {/* Top arrow bar */}
      <path
        d="M100 0 L45 0 L0 15 L45 30 L100 30 Z"
        fill="#F95738"
      />
      {/* Bottom arrow bar */}
      <path
        d="M100 32 L45 32 L0 47 L45 62 L100 62 Z"
        fill="#F95738"
      />
      {/* White slit between the two bars (the negative space cutout) */}
      <path
        d="M45 28 L6 15 L45 2 L100 2 L100 0 L45 0 L0 15 L45 30 L100 30 L100 28 Z"
        fill="none"
      />
    </svg>
  );
}

/** Compact square badge version for tight spaces (sidebar collapsed, favicon etc.) */
export function WokLogoBadge({ size = 28 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: Math.round(size * 0.22),
      background: '#F95738',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      {/* Minimal double-chevron mark in white */}
      <svg width={size * 0.6} height={size * 0.5} viewBox="0 0 60 50" fill="none">
        <path d="M55 0 L25 0 L0 12.5 L25 25 L55 25 Z" fill="white"/>
        <path d="M55 27 L25 27 L0 39.5 L25 52 L55 52 Z" fill="white"/>
      </svg>
    </div>
  );
}