import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle, KeyRound } from "lucide-react";
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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout icon={AlertTriangle} title="Invalid reset link" subtitle="This link is missing or expired.">
        <Link to="/forgot-password" style={{ color: "#ccc", fontSize: 14, textDecoration: "none" }}>
          Request a new link →
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={KeyRound}
      title="New password"
      subtitle="Enter your new password below"
      footer={
        <Link to="/forgot-password" style={{ color: "#555", fontSize: 13, textDecoration: "none" }}>
          Back to forgot password
        </Link>
      }
    >
      {error && (
        <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 8, background: "rgba(232,24,74,0.08)", border: "1px solid rgba(232,24,74,0.2)", color: "#E8184A", fontSize: 13 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#888", marginBottom: 6 }}>New Password</label>
          <input type="password" autoComplete="new-password" autoFocus placeholder="••••••••"
            value={newPassword} onChange={e => setNewPassword(e.target.value)}
            style={inputStyle} required
            onFocus={e => e.target.style.borderColor = "#555"}
            onBlur={e => e.target.style.borderColor = "#383838"} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#888", marginBottom: 6 }}>Confirm Password</label>
          <input type="password" autoComplete="new-password" placeholder="••••••••"
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            style={inputStyle} required
            onFocus={e => e.target.style.borderColor = "#555"}
            onBlur={e => e.target.style.borderColor = "#383838"} />
        </div>

        <button type="submit" disabled={loading}
          style={{ width: "100%", height: 42, background: "#fff", color: "#111", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "Inter, sans-serif", transition: "opacity 150ms", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? <><Loader2 style={{ width: 15, height: 15, animation: "spin 0.6s linear infinite" }} />Resetting…</> : "Reset password"}
        </button>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
      </form>
    </AuthLayout>
  );
}