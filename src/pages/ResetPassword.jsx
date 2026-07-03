import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertTriangle } from "lucide-react";
import AuthRightPanel from "@/components/AuthRightPanel";

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
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen" style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh", padding: 16, gap: 16,
      background: "#FBF8F2", fontFamily: "'Inter', sans-serif", color: "#15130F",
    }}>
      {/* ── LEFT ── */}
      <div className="auth-left" style={{
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "44px 64px",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: "#FF5A1F",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L21 20H3L12 3Z" fill="#FBF8F2"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em" }}>UseWok</span>
        </div>

        {/* Form */}
        <div style={{ width: "100%", maxWidth: 400, margin: "0 auto" }}>
          {!resetToken ? (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#FEF2F2", border: "1px solid #FECACA",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <AlertTriangle size={28} style={{ color: "#EF4444" }} />
              </div>
              <h1 style={{
                fontWeight: 800, fontSize: 26, letterSpacing: "-0.03em", marginBottom: 8,
              }}>Invalid link</h1>
              <p style={{
                fontSize: 14, color: "#4A453B", lineHeight: 1.6, marginBottom: 24,
              }}>
                This reset link is missing or invalid.<br />Please request a new one.
              </p>
              <Link to="/forgot-password" style={{
                color: "#15130F", fontWeight: 600, fontSize: 14,
                textDecoration: "underline", textUnderlineOffset: 2,
              }}>
                Request a new link →
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{
                fontWeight: 800, fontSize: 38, letterSpacing: "-0.03em",
                lineHeight: 1.08, marginBottom: 12,
              }}>New<br />password</h1>
              <p style={{
                fontSize: 14.5, color: "#4A453B", lineHeight: 1.6, marginBottom: 28,
              }}>Choose a secure password.</p>

              {error && (
                <div style={{
                  marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  color: "#DC2626", fontSize: 13, textAlign: "center",
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoFocus
                    required
                    style={{
                      width: "100%", height: 50, borderRadius: 12,
                      border: "1px solid rgba(21,19,15,0.16)", background: "#fff",
                      padding: "0 16px", fontFamily: "inherit", fontSize: 14.5,
                      color: "#15130F", outline: "none",
                      transition: "border-color .15s ease, box-shadow .15s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "#FF5A1F";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,90,31,0.14)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "rgba(21,19,15,0.16)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: "100%", height: 50, borderRadius: 12,
                      border: "1px solid rgba(21,19,15,0.16)", background: "#fff",
                      padding: "0 16px", fontFamily: "inherit", fontSize: 14.5,
                      color: "#15130F", outline: "none",
                      transition: "border-color .15s ease, box-shadow .15s ease",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "#FF5A1F";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,90,31,0.14)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "rgba(21,19,15,0.16)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                <button type="submit" disabled={loading} style={{
                  width: "100%", height: 50, border: "none", borderRadius: 12,
                  background: loading ? "rgba(21,19,15,0.5)" : "#15130F",
                  color: "#FBF8F2", fontFamily: "inherit",
                  fontSize: 14.5, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "background .15s ease, transform .1s ease",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#C43E14"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#15130F"; }}
                onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.98)"; }}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting…</> : "Reset password"}
                </button>
              </form>

              <p style={{ textAlign: "center", fontSize: 14, color: "#4A453B", marginTop: 24 }}>
                <Link to="/forgot-password" style={{
                  color: "#15130F", fontWeight: 600,
                  textDecoration: "underline", textUnderlineOffset: 2,
                }}>
                  Back to forgot password
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Legal */}
        <p style={{ fontSize: 12, color: "rgba(21,19,15,0.4)" }}>
          <Link to="/terms" style={{ color: "rgba(21,19,15,0.6)", textDecoration: "underline", textUnderlineOffset: 2 }}>Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" style={{ color: "rgba(21,19,15,0.6)", textDecoration: "underline", textUnderlineOffset: 2 }}>Privacy Policy</Link>.
        </p>
      </div>

      {/* ── RIGHT ── */}
      <AuthRightPanel className="auth-right" />
    </div>
  );
}