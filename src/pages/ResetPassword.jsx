import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import AuthBrand from "@/components/AuthBrand";

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
    if (newPassword !== confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    if (newPassword.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Erreur lors de la réinitialisation");
    } finally {
      setLoading(false);
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

          {!resetToken ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h1 className="text-[26px] font-bold text-gray-900 mb-2">Lien invalide</h1>
              <p className="text-[14px] text-gray-500 mb-6 leading-relaxed">
                Ce lien de réinitialisation est manquant ou invalide.<br />Veuillez en demander un nouveau.
              </p>
              <Link to="/forgot-password" className="text-[#F95738] font-semibold text-[14px] hover:underline">
                Demander un nouveau lien →
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-[28px] font-bold text-gray-900 mb-1">Nouveau mot de passe</h1>
              <p className="text-[14px] text-gray-500 mb-8">Choisissez un mot de passe sécurisé.</p>

              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-[13px] border border-red-100 text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[13px] font-medium text-gray-800">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    autoFocus
                    placeholder="Minimum 8 caractères"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-[44px] border-gray-200 text-[14px] rounded-[8px] focus:ring-1 focus:ring-[#F95738] focus:border-[#F95738]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-[13px] font-medium text-gray-800">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Réinitialisation...</> : "Réinitialiser le mot de passe →"}
                </Button>
              </form>

              <p className="text-center text-[13px] text-gray-500 mt-6">
                <Link to="/forgot-password" className="text-[#F95738] font-semibold hover:underline">
                  Retour au mot de passe oublié
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