import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

const inputStyle = {
  width: "100%",
  height: 42,
  background: "#2A2A2A",
  border: "1px solid #383838",
  borderRadius: 8,
  padding: "0 14px",
  fontSize: 14,
  color: "#E5E5E5",
  outline: "none",
  fontFamily: "Inter, sans-serif",
  boxSizing: "border-box",
  transition: "border-color 150ms",
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {}
    finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Reset password"
      subtitle="We'll send you a link to reset your password"
      footer={
        <Link to="/login" style={{ color: "#888", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}>
          <ArrowLeft style={{ width: 12, height: 12 }} /> Back to log in
        </Link>
      }
    >
      {sent ? (
        <div style={{ padding: "16px", borderRadius: 8, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", color: "#86efac", fontSize: 14, lineHeight: 1.6 }}>
          If an account exists with that email, you'll receive a reset link shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#888", marginBottom: 6 }}>Email address</label>
            <input type="email" autoComplete="email" autoFocus placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputStyle} required
              onFocus={e => e.target.style.borderColor = "#555"}
              onBlur={e => e.target.style.borderColor = "#383838"} />
          </div>
          <button type="submit" disabled={loading}
            style={{ width: "100%", height: 42, background: "#fff", color: "#111", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "Inter, sans-serif", transition: "opacity 150ms", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 0.6s linear infinite" }} />Sending…</> : "Send reset link"}
          </button>
          <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </form>
      )}
    </AuthLayout>
  );
}