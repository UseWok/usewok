import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/components/ui/use-toast";
import AuthRightPanel from "@/components/AuthRightPanel";

const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#15130F">
    <path d="M16.365 1.43c0 1.14-.474 2.223-1.246 2.994-.79.79-2.08 1.394-3.13 1.31a3.4 3.4 0 0 1-.02-.44c.05-1.11.62-2.19 1.32-2.88.79-.79 2.14-1.37 3.05-1.4.02.14.03.28.03.42zM20.4 17.3c-.44 1.02-.97 2.03-1.72 3.02-.98 1.29-1.99 2.58-3.59 2.6-1.57.03-2.08-.93-3.87-.93-1.8 0-2.35.9-3.85.96-1.54.06-2.71-1.39-3.7-2.68-2.01-2.63-3.55-7.44-1.48-10.7 1.03-1.62 2.87-2.65 4.87-2.68 1.5-.03 2.92.99 3.87.99.94 0 2.68-1.22 4.52-1.04.77.03 2.93.31 4.32 2.34-.11.07-2.58 1.5-2.55 4.48.03 3.56 3.13 4.75 3.18 4.77-.03.09-.5 1.7-1.65 3.4z"/>
  </svg>
);

const GoogleLogo = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.11A12 12 0 0 0 12 24z"/>
    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.39l4.01-3.11z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.26 6.61l4.01 3.11C6.22 6.86 8.87 4.75 12 4.75z"/>
  </svg>
);

export default function Register() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      window.location.href = "/app";
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code sent", description: "Check your inbox." });
    } catch (err) {
      setError(err.message || "Error resending code");
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/app");
  const handleApple = () => base44.auth.loginWithProvider("apple", "/app");

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
          {showOtp ? (
            <>
              <h1 style={{
                fontWeight: 800, fontSize: 38, letterSpacing: "-0.03em",
                lineHeight: 1.08, marginBottom: 12,
              }}>Verify<br />your email</h1>
              <p style={{
                fontSize: 14.5, color: "#4A453B", lineHeight: 1.6, marginBottom: 28,
              }}>
                We've sent a code to <strong style={{ color: "#15130F" }}>{email}</strong>
              </p>

              {error && (
                <div style={{
                  marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  color: "#DC2626", fontSize: 13, textAlign: "center",
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map(i => (
                      <InputOTPSlot key={i} index={i} className="h-12 w-11 text-lg border-gray-200" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <button onClick={handleVerify} disabled={loading || otpCode.length < 6} style={{
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
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : "Verify"}
              </button>

              <p style={{ textAlign: "center", fontSize: 13, color: "#4A453B", marginTop: 20 }}>
                Didn't get a code?{" "}
                <button onClick={handleResend} style={{
                 color: "#C43E14", fontWeight: 600,
                 textDecoration: "underline", textUnderlineOffset: 2,
                 background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                }}>
                 Resend
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 style={{
                fontWeight: 800, fontSize: 38, letterSpacing: "-0.03em",
                lineHeight: 1.08, marginBottom: 12,
              }}>Create<br />account</h1>
              <p style={{
                fontSize: 14.5, color: "#4A453B", lineHeight: 1.6, marginBottom: 22,
              }}>Free · No credit card · No commitment</p>

              {error && (
                <div style={{
                  marginBottom: 16, padding: "10px 14px", borderRadius: 10,
                  background: "#FEF2F2", border: "1px solid #FECACA",
                  color: "#DC2626", fontSize: 13, textAlign: "center",
                }}>
                  {error}
                </div>
              )}

              {/* OAuth */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                <button onClick={handleGoogle} style={{
                  height: 48, borderRadius: 12,
                  border: "1px solid rgba(21,19,15,0.16)", background: "#fff",
                  fontFamily: "inherit", fontSize: 14.5, fontWeight: 500, color: "#15130F",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  cursor: "pointer", transition: "border-color .15s ease, transform .1s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#15130F"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(21,19,15,0.16)"}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <GoogleLogo /> Continue with Google
                </button>
                <button onClick={handleApple} style={{
                  height: 48, borderRadius: 12,
                  border: "1px solid rgba(21,19,15,0.16)", background: "#fff",
                  fontFamily: "inherit", fontSize: 14.5, fontWeight: 500, color: "#15130F",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  cursor: "pointer", transition: "border-color .15s ease, transform .1s ease",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#15130F"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(21,19,15,0.16)"}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
                >
                  <AppleIcon /> Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(21,19,15,0.10)" }} />
                <span style={{
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.05em",
                  textTransform: "uppercase", color: "rgba(21,19,15,0.35)",
                }}>Or</span>
                <div style={{ flex: 1, height: 1, background: "rgba(21,19,15,0.10)" }} />
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ position: "relative", marginBottom: 12 }}>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="Password (minimum 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? <><Loader2 size={16} className="animate-spin" /> Creating…</> : "Create my account"}
                </button>
              </form>

              <p style={{ textAlign: "center", fontSize: 12, color: "rgba(21,19,15,0.4)", marginTop: 16, lineHeight: 1.5 }}>
                By creating an account, you agree to our{" "}
                <Link to="/terms" style={{ color: "rgba(21,19,15,0.6)", textDecoration: "underline", textUnderlineOffset: 2 }}>Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" style={{ color: "rgba(21,19,15,0.6)", textDecoration: "underline", textUnderlineOffset: 2 }}>Privacy Policy</Link>.
              </p>

              <p style={{ textAlign: "center", fontSize: 14, color: "#4A453B", marginTop: 16 }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "#15130F", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 2 }}>
                  Sign in
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