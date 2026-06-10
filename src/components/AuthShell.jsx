import React, { useEffect, useRef } from "react";

function LightCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const lights = [
      { x: 0.15, y: 0.25, r: 0.55, color: "255,180,60",   speed: 0.00018, phase: 0 },
      { x: 0.75, y: 0.15, r: 0.50, color: "200,100,255",  speed: 0.00024, phase: 2.1 },
      { x: 0.50, y: 0.80, r: 0.45, color: "60,160,255",   speed: 0.00020, phase: 4.3 },
      { x: 0.85, y: 0.65, r: 0.38, color: "255,80,120",   speed: 0.00016, phase: 1.1 },
      { x: 0.30, y: 0.70, r: 0.40, color: "80,255,200",   speed: 0.00022, phase: 3.0 },
    ];

    const draw = (ts) => {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, w, h);

      lights.forEach((l) => {
        const ox = Math.sin(ts * l.speed + l.phase) * 0.12;
        const oy = Math.cos(ts * l.speed * 0.7 + l.phase) * 0.10;
        const cx = (l.x + ox) * w;
        const cy = (l.y + oy) * h;
        const radius = l.r * Math.max(w, h);

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0,   `rgba(${l.color},0.55)`);
        grad.addColorStop(0.3, `rgba(${l.color},0.18)`);
        grad.addColorStop(0.7, `rgba(${l.color},0.04)`);
        grad.addColorStop(1,   `rgba(${l.color},0)`);

        ctx.globalCompositeOperation = "screen";
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      });

      ctx.globalCompositeOperation = "source-over";
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
  );
}

const WokLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
      <path d="M16 4C10 4 6 8 6 14C6 18 8 21 12 23L16 28L20 23C24 21 26 18 26 14C26 8 22 4 16 4Z" fill="url(#wokAuthGrad)"/>
      <defs>
        <linearGradient id="wokAuthGrad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B6B"/>
          <stop offset="50%" stopColor="#FF9A3C"/>
          <stop offset="100%" stopColor="#A855F7"/>
        </linearGradient>
      </defs>
    </svg>
    <span style={{
      fontFamily: "'Space Grotesk', system-ui, sans-serif",
      fontWeight: 300,
      fontSize: 22,
      color: "#fff",
      letterSpacing: "-0.02em",
    }}>Wok</span>
  </div>
);

export default function AuthShell({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#1F1F1F",
      display: "flex",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      {/* Left: form */}
      <div style={{
        width: "100%",
        maxWidth: 520,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        padding: "32px 48px 32px",
        background: "#1F1F1F",
      }}>
        <div style={{ marginBottom: 56 }}>
          <WokLogo />
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ maxWidth: 360, width: "100%" }}>
            {children}
          </div>
        </div>

        <div style={{ paddingTop: 24, fontSize: 11, color: "#555", display: "flex", gap: 12 }}>
          <a href="/terms" style={{ color: "#555", textDecoration: "none" }}>Terms of Service</a>
          <span>·</span>
          <a href="/privacy" style={{ color: "#555", textDecoration: "none" }}>Privacy Policy</a>
        </div>
      </div>

      {/* Right: light art (desktop only) */}
      <div style={{ flex: 1, padding: "12px 12px 12px 0", display: "none" }} className="auth-right-panel">
        <div style={{ width: "100%", height: "100%", borderRadius: 12, overflow: "hidden", position: "relative" }}>
          <LightCanvas />
          <div style={{ position: "absolute", bottom: 32, left: 32, right: 32 }}>
            <p style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 300, fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.04em",
              margin: 0,
            }}>
              Turn your ideas into apps
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&display=swap');
        @media (min-width: 1024px) { .auth-right-panel { display: flex !important; } }
      `}</style>
    </div>
  );
}