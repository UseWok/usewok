import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowUp, AlertTriangle } from "lucide-react";

const Base44Logo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="#F26522"/>
    <path d="M1 16H31" stroke="white" strokeWidth="2.5"/>
    <path d="M4 21.5H28" stroke="white" strokeWidth="2.5"/>
    <path d="M8.5 27H23.5" stroke="white" strokeWidth="2.5"/>
  </svg>
);

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

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-[#1A1A1A]">
      {/* Left column: form */}
      <div className="w-full lg:w-[55%] flex flex-col p-8 sm:px-12 sm:py-10">
        <div className="flex items-center gap-2.5 mb-16 sm:mb-20">
          <Base44Logo />
          <span className="text-[20px] font-bold tracking-tight">Base 44</span>
        </div>

        <div className="max-w-[400px] w-full mx-auto flex-1 flex flex-col">
          {!resetToken ? (
            <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h1 className="text-[28px] font-semibold mb-3">Invalid reset link</h1>
              <p className="text-gray-500 text-[14px] mb-8 leading-relaxed">
                This password reset link is missing or invalid.<br />
                Please request a new one.
              </p>
              <Link to="/forgot-password" className="text-gray-900 font-medium text-[14px] hover:underline underline-offset-2">
                Request a new link →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[34px] font-semibold text-center mb-2">New password</h1>
              <p className="text-center text-gray-500 text-[14px] mb-8">Enter your new password below</p>

              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50/50 text-red-500 text-sm border border-red-100 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[13px] font-medium text-gray-900">New Password</Label>
                  <Input id="password" type="password" autoComplete="new-password" autoFocus placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-[42px] border border-gray-200 text-[14px] text-gray-900 placeholder:text-[#A0A0A0] rounded-[6px] focus:ring-0 focus:border-gray-300 shadow-sm" required />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-[13px] font-medium text-gray-900">Confirm Password</Label>
                  <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-[42px] border border-gray-200 text-[14px] text-gray-900 placeholder:text-[#A0A0A0] rounded-[6px] focus:ring-0 focus:border-gray-300 shadow-sm" required />
                </div>

                <Button type="submit" className="w-full h-[42px] mt-2 bg-[#7a7a7a] hover:bg-[#666666] text-white rounded-[6px] font-normal text-[15px] shadow-sm transition-colors" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</> : "Reset password"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/forgot-password" className="text-[13px] text-[#707070] hover:text-gray-900 transition-colors hover:underline underline-offset-2">
                  Back to forgot password
                </Link>
              </div>
            </>
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