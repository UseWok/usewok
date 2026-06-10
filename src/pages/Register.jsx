import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import GoogleIcon from "@/components/GoogleIcon";
import { useToast } from "@/components/ui/use-toast";
import AuthShell from "@/components/AuthShell.jsx";

const AppleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.805 3.06 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.62-1.516 3.6-2.98 1.15-1.682 1.623-3.313 1.645-3.396-.035-.013-3.176-1.22-3.21-4.86-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.56 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.2.048-2.671.805-3.536 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.564-1.702z"/>
  </svg>
);

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

const oauthBtn = {
  width: "100%",
  height: 42,
  background: "#242424",
  border: "1px solid #383838",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  fontSize: 14,
  color: "#D0D0D0",
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  transition: "background 150ms, border-color 150ms",
};

const primaryBtn = {
  width: "100%",
  height: 42,
  background: "#fff",
  color: "#111",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "Inter, sans-serif",
  transition: "opacity 150ms",
};

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
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
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
      window.location.href = "/";
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
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/");
  const handleApple  = () => base44.auth.loginWithProvider("apple", "/");

  return (
    <AuthShell>
      {showOtp ? (
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Verify your email
          </h1>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 32px", lineHeight: 1.6 }}>
            We sent a 6-digit code to <span style={{ color: "#ccc" }}>{email}</span>
          </p>

          {error && (
            <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 8, background: "rgba(232,24,74,0.08)", border: "1px solid rgba(232,24,74,0.2)", color: "#E8184A", fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
              <InputOTPGroup>
                {[0,1,2,3,4,5].map(i => (
                  <InputOTPSlot key={i} index={i} style={{ height: 48, width: 44, fontSize: 18, background: "#2A2A2A", border: "1px solid #383838", color: "#fff", borderRadius: 8 }} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <button onClick={handleVerify} disabled={loading || otpCode.length < 6}
            style={{ ...primaryBtn, opacity: loading || otpCode.length < 6 ? 0.45 : 1 }}>
            {loading ? "Verifying…" : "Verify"}
          </button>

          <p style={{ textAlign: "center", fontSize: 13, color: "#555", marginTop: 20 }}>
            Didn't receive the code?{" "}
            <button onClick={handleResend} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 13, fontFamily: "inherit" }}>
              Resend
            </button>
          </p>
        </div>
      ) : (
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
            Welcome to Wok
          </h1>
          <p style={{ fontSize: 14, color: "#555", margin: "0 0 32px" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#ccc", textDecoration: "none" }}>Log in</Link>
          </p>

          {error && (
            <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 8, background: "rgba(232,24,74,0.08)", border: "1px solid rgba(232,24,74,0.2)", color: "#E8184A", fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* OAuth */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            <button style={oauthBtn} onClick={handleGoogle}
              onMouseEnter={e => { e.currentTarget.style.background = "#2E2E2E"; e.currentTarget.style.borderColor = "#484848"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#242424"; e.currentTarget.style.borderColor = "#383838"; }}>
              <GoogleIcon className="w-4 h-4" />
              Continue with Google
            </button>
            <button style={oauthBtn} onClick={handleApple}
              onMouseEnter={e => { e.currentTarget.style.background = "#2E2E2E"; e.currentTarget.style.borderColor = "#484848"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#242424"; e.currentTarget.style.borderColor = "#383838"; }}>
              <AppleIcon className="w-4 h-4" />
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: "#2A2A2A" }} />
            <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#2A2A2A" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#888", marginBottom: 6 }}>Email</label>
              <input type="email" autoComplete="email" autoFocus placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                style={inputStyle} required
                onFocus={e => e.target.style.borderColor = "#555"}
                onBlur={e => e.target.style.borderColor = "#383838"} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#888", marginBottom: 6 }}>Password</label>
              <input type="password" autoComplete="new-password" placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
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
              style={{ ...primaryBtn, marginTop: 4, opacity: loading ? 0.6 : 1 }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = loading ? "0.6" : "1"; }}>
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>
      )}
    </AuthShell>
  );
}