import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import AuthBrand from "@/components/AuthBrand";

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.805 3.06 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.62-1.516 3.6-2.98 1.15-1.682 1.623-3.313 1.645-3.396-.035-.013-3.176-1.22-3.21-4.86-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.56 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.2.048-2.671.805-3.536 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.564-1.702z"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = "/app";
    } catch (err) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => base44.auth.loginWithProvider("google", "/app");
  const handleApple = () => base44.auth.loginWithProvider("apple", "/app");

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Left: form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 py-12">
        <div className="max-w-[400px] w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F95738', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                <path d="M6 1L10.5 9H1.5L6 1Z" fill="white" />
              </svg>
            </div>
            <span className="text-[18px] font-bold tracking-tight text-gray-900">UseWok</span>
          </div>

          <h1 className="text-[28px] font-bold text-gray-900 mb-1">Connexion</h1>
          <p className="text-[14px] text-gray-500 mb-8">Bienvenue ! Connectez-vous à votre compte.</p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-[13px] border border-red-100 text-center">
              {error}
            </div>
          )}

          {/* Social buttons */}
          <div className="space-y-2.5 mb-6">
            <button
              onClick={handleGoogle}
              className="w-full h-[44px] flex items-center justify-center gap-3 border border-gray-200 rounded-[8px] bg-white hover:bg-gray-50 transition-colors text-[14px] font-medium text-gray-700 shadow-sm"
            >
              <GoogleIcon className="w-4 h-4" />
              Continuer avec Google
            </button>
            <button
              onClick={handleApple}
              className="w-full h-[44px] flex items-center justify-center gap-3 border border-gray-200 rounded-[8px] bg-white hover:bg-gray-50 transition-colors text-[14px] font-medium text-gray-700 shadow-sm"
            >
              <AppleIcon />
              Continuer avec Apple
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-[12px] text-gray-400 font-medium uppercase tracking-wide">ou par email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-gray-800">Adresse email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[44px] border-gray-200 text-[14px] rounded-[8px] focus:ring-1 focus:ring-[#F95738] focus:border-[#F95738]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px] font-medium text-gray-800">Mot de passe</Label>
                <Link to="/forgot-password" className="text-[12px] text-[#F95738] hover:underline font-medium">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[44px] border-gray-200 text-[14px] rounded-[8px] focus:ring-1 focus:ring-[#F95738] focus:border-[#F95738]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-[44px] rounded-[8px] text-[14px] font-semibold text-white mt-1"
              style={{ background: 'linear-gradient(135deg, #F95738 0%, #e8401f 100%)', border: 'none' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Connexion...</> : "Se connecter →"}
            </Button>
          </form>

          <p className="text-center text-[13px] text-gray-500 mt-6">
            Pas encore de compte ?{" "}
            <Link to="/register" className="text-[#F95738] font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>

      {/* Right: brand panel */}
      <AuthBrand />
    </div>
  );
}