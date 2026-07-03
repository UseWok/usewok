import React from "react";

/**
 * AuthRightPanel — Panneau visuel droit partagé entre toutes les pages d'auth.
 * Dégradé orange, pills flottants, prompt card au caret clignotant.
 */
export default function AuthRightPanel({ pill1 = "AI Visibility Score", pill2 = "8 engines analyzed", prompt = "Analyze your brand on ChatGPT" }) {
  return (
    <div className="auth-right" style={{
      position: "relative", overflow: "hidden", borderRadius: 20,
      background: `
        radial-gradient(90% 70% at 20% 15%, #FFB98F 0%, transparent 60%),
        radial-gradient(90% 80% at 85% 90%, #FF8A4C 0%, transparent 55%),
        linear-gradient(160deg, #FFF3E9 0%, #FFE0C7 55%, #FFC79B 100%)
      `,
    }}>
      {/* Dot pattern overlay — 10% plus foncé */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(196,62,20,0.20) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        maskImage: "radial-gradient(circle at 60% 50%, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle at 60% 50%, black 0%, transparent 70%)",
      }} />

      <div style={{
        position: "relative", zIndex: 2, height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 56,
      }}>
        {/* Floating pills */}
        <div style={{
          position: "absolute", top: 64, left: 56,
          display: "flex", alignItems: "center", gap: 7,
          fontSize: 12, fontWeight: 600, color: "#C43E14",
          background: "rgba(255,255,255,0.65)",
          border: "1px solid rgba(255,255,255,0.8)",
          padding: "7px 13px", borderRadius: 100,
          backdropFilter: "blur(10px)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF5A1F" }} />
          {pill1}
        </div>
        <div style={{
          position: "absolute", bottom: 70, right: 64,
          display: "flex", alignItems: "center", gap: 7,
          fontSize: 12, fontWeight: 600, color: "#C43E14",
          background: "rgba(255,255,255,0.65)",
          border: "1px solid rgba(255,255,255,0.8)",
          padding: "7px 13px", borderRadius: 100,
          backdropFilter: "blur(10px)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF5A1F" }} />
          {pill2}
        </div>

        {/* Prompt card */}
        <div style={{
          width: "100%", maxWidth: 440,
          background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(255,255,255,0.7)",
          borderRadius: 18, padding: "16px 16px 16px 22px",
          display: "flex", alignItems: "center", gap: 14,
          backdropFilter: "blur(14px)",
        }}>
          <span style={{
            flex: 1, fontSize: 17, color: "rgba(21,19,15,0.4)",
            whiteSpace: "nowrap", overflow: "hidden",
          }}>
            {prompt}
            <span style={{
              display: "inline-block", width: 1, height: 20,
              background: "#C43E14", verticalAlign: -4, marginLeft: 2,
              animation: "blink 1s step-end infinite",
            }} />
          </span>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#15130F",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FBF8F2" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}