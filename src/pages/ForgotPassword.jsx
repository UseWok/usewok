import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import AuthBrand from "@/components/AuthBrand";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show success
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

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

          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(249,87,56,0.1)' }}>
                <CheckCircle className="w-7 h-7" style={{ color: '#F95738' }} />
              </div>
              <h1 className="text-[26px] font-bold text-gray-900 mb-2">Email envoyé !</h1>
              <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
                Si un compte existe avec cette adresse, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-[13px] text-[#F95738] font-semibold hover:underline">
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[28px] font-bold text-gray-900 mb-1">Mot de passe oublié ?</h1>
              <p className="text-[14px] text-gray-500 mb-8">
                Entrez votre email et nous vous enverrons un lien de réinitialisation.
              </p>

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

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[44px] rounded-[8px] text-[14px] font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #F95738 0%, #e8401f 100%)', border: 'none' }}
                >
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi en cours...</> : "Envoyer le lien →"}
                </Button>
              </form>

              <p className="text-center text-[13px] text-gray-500 mt-6">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-[#F95738] font-semibold hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right: brand panel */}
      <AuthBrand />
    </div>
  );
}