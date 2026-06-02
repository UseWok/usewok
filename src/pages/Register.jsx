import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Key, ArrowUp } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import GoogleIcon from "@/components/GoogleIcon";
import { useToast } from "@/components/ui/use-toast";

const AppleIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.805 3.06 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.62-1.516 3.6-2.98 1.15-1.682 1.623-3.313 1.645-3.396-.035-.013-3.176-1.22-3.21-4.86-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.56 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.2.048-2.671.805-3.536 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.564-1.702z"/>
  </svg>
);

const Base44Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="#F26522"/>
    <path d="M1 16H31" stroke="white" strokeWidth="2.5"/>
    <path d="M4 21.5H28" stroke="white" strokeWidth="2.5"/>
    <path d="M8.5 27H23.5" stroke="white" strokeWidth="2.5"/>
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

  const handleGoogle = () => { base44.auth.loginWithProvider("google", "/"); };
  const handleApple = () => { base44.auth.loginWithProvider("apple", "/"); };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-[#1A1A1A]">
      {/* Left column: form */}
      <div className="w-full lg:w-[55%] flex flex-col p-8 sm:px-12 sm:py-10">
        <div className="flex items-center gap-2.5 mb-16 sm:mb-20">
          <Base44Logo />
          <span className="text-[20px] font-bold tracking-tight">Base 44</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto flex-1 flex flex-col">
          <h1 className="text-[34px] font-semibold text-center mb-8">
            {showOtp ? "Verify your email" : "Welcome to Base44"}
          </h1>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-50/50 text-red-500 text-sm border border-red-100 text-center">
              {error}
            </div>
          )}

          {showOtp ? (
            <div className="flex flex-col animate-in fade-in duration-300">
              <p className="text-center text-gray-500 mb-8">
                We sent a code to <span className="font-medium text-gray-900">{email}</span>
              </p>
              <div className="flex justify-center mb-8">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-11 text-lg border-gray-200" />
                    <InputOTPSlot index={1} className="h-12 w-11 text-lg border-gray-200" />
                    <InputOTPSlot index={2} className="h-12 w-11 text-lg border-gray-200" />
                    <InputOTPSlot index={3} className="h-12 w-11 text-lg border-gray-200" />
                    <InputOTPSlot index={4} className="h-12 w-11 text-lg border-gray-200" />
                    <InputOTPSlot index={5} className="h-12 w-11 text-lg border-gray-200" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                className="w-full h-11 bg-[#7a7a7a] hover:bg-[#666666] text-white rounded-md font-medium text-[15px] transition-colors"
                onClick={handleVerify}
                disabled={loading || otpCode.length < 6}
              >
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Verify"}
              </Button>
              <p className="text-center text-[13px] text-gray-500 mt-6">
                Didn't receive the code?{" "}
                <button onClick={handleResend} className="text-gray-900 font-medium hover:underline underline-offset-2">
                  Resend
                </button>
              </p>
            </div>
          ) : (
            <div className="flex flex-col animate-in fade-in duration-300">
              <div className="space-y-3 mb-7">
                <Button variant="outline" className="w-full h-10 bg-white border border-gray-200 hover:bg-gray-50 text-[14px] text-gray-700 font-normal rounded-[6px] shadow-sm flex items-center justify-center gap-3 transition-colors" onClick={handleGoogle}>
                  <GoogleIcon className="w-4 h-4" />
                  Log in with Google
                </Button>
                <Button variant="outline" className="w-full h-10 bg-white border border-gray-200 hover:bg-gray-50 text-[14px] text-gray-700 font-normal rounded-[6px] shadow-sm flex items-center justify-center gap-3 transition-colors" onClick={handleApple}>
                  <AppleIcon className="w-4 h-4" />
                  Log in with Apple
                </Button>
              </div>

              <div className="relative mb-7">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-3 text-[#A0A0A0] font-medium tracking-wide">or</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email" className="text-[13px] font-medium text-gray-900">Email</Label>
                    <span className="bg-[#F26522] text-white text-[10px] font-medium px-2 py-0.5 rounded-[4px]">Last Used</span>
                  </div>
                  <Input id="email" type="email" autoComplete="email" autoFocus placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[42px] border border-gray-200 text-[14px] text-gray-900 placeholder:text-[#A0A0A0] placeholder:font-light rounded-[6px] focus:ring-0 focus:border-gray-300 shadow-sm" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[13px] font-medium text-gray-900">Password</Label>
                  <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-[42px] border border-gray-200 text-[14px] text-gray-900 placeholder:text-[#A0A0A0] rounded-[6px] focus:ring-0 focus:border-gray-300 shadow-sm" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-[13px] font-medium text-gray-900">Confirm Password</Label>
                  <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-[42px] border border-gray-200 text-[14px] text-gray-900 placeholder:text-[#A0A0A0] rounded-[6px] focus:ring-0 focus:border-gray-300 shadow-sm" required />
                </div>

                <Button type="submit" className="w-full h-[42px] mt-2 bg-[#7a7a7a] hover:bg-[#666666] text-white rounded-[6px] font-normal text-[15px] shadow-sm transition-colors" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Continuing...</> : "Continue"}
                </Button>
              </form>

              <div className="mt-5 flex flex-col items-center space-y-4">
                <button className="flex items-center text-[13px] text-[#707070] hover:text-gray-900 transition-colors">
                  <Key className="w-3.5 h-3.5 mr-2" />
                  Log in with SSO
                </button>
                <p className="text-[13px] text-[#707070]">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-gray-900 font-medium hover:underline underline-offset-2">Sign up</Link>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-8 flex justify-center text-[12px] text-[#A0A0A0]">
          <p>
            <a href="/terms" className="hover:text-gray-700 underline underline-offset-2">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="hover:text-gray-700 underline underline-offset-2">Privacy Policy</a>.
          </p>
        </div>
      </div>

      {/* Right column: decorative */}
      <div className="hidden lg:flex w-[45%] p-4 pl-0 pb-4">
        <div className="w-full h-full rounded-[24px] overflow-hidden relative" style={{ background: 'linear-gradient(145deg, #EBF3FF 0%, #F5F9FF 45%, #E6F0FF 100%)' }}>
          <div className="absolute -top-10 -right-20 w-[600px] h-[600px] bg-[#C1D8FF] rounded-full mix-blend-multiply filter blur-[90px] opacity-70"></div>
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-[#B0CDFF] rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-full max-w-[400px] bg-white/80 backdrop-blur-md pl-6 pr-2 py-2 rounded-[16px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-white flex items-center justify-between group">
              <span className="text-[#A4B3CB] text-[16px] font-light">
                Turn your ideas into apps <span className="animate-pulse opacity-50">|</span>
              </span>
              <button className="w-9 h-9 rounded-[10px] bg-[#B6C2D6] group-hover:bg-[#A3B2C9] flex items-center justify-center transition-colors">
                <ArrowUp className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}