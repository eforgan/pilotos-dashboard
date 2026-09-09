"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Lock, Shield, Loader2, CheckCircle2, ArrowRight, KeyRound, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChangePasswordModal() {
  const { data: session, update } = useSession();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const user = session?.user as { mustChangePassword?: boolean; name?: string | null } | undefined;
  const mustChange = Boolean(user?.mustChangePassword);

  if (!mustChange) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (cleanPass.length === 0) {
      setError("Por favor ingrese su nueva contraseña.");
      setLoading(false);
      return;
    }

    if (cleanPass.length > 8) {
      setError("La contraseña no debe superar los 8 caracteres.");
      setLoading(false);
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: cleanPass }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Error al cambiar la contraseña.");
      } else {
        setSuccess(true);
        // Refresh session or window location after a brief delay
        setTimeout(async () => {
          if (update) {
            await update({ mustChangePassword: false });
          }
          window.location.reload();
        }, 1200);
      }
    } catch {
      setError("Error de conexión al guardar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md bg-slate-900 border border-blue-500/30 rounded-[2.5rem] p-8 shadow-2xl shadow-blue-500/20 text-white relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-[-30%] right-[-30%] w-48 h-48 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400">
              <KeyRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight font-outfit text-white">
              Primer Ingreso Detectado
            </h2>
            <p className="text-slate-400 font-semibold text-xs mt-1">
              Por razones de seguridad, configure una clave secreta propia para su legajo.
            </p>
          </div>

          {/* Instruction Box */}
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl mb-6 text-xs text-blue-300 font-semibold flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              La nueva clave debe ser personal, secreta y de <strong>hasta 8 caracteres</strong> como máximo.
            </span>
          </div>

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl mb-5">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>¡Contraseña actualizada! Ingresando a su legajo...</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-black text-slate-300 uppercase tracking-wider">
                  <span>Nueva Contraseña Secreta *</span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    {newPassword.length}/8 caracteres
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={8}
                    className="input-field pl-12 h-14 w-full !bg-slate-950 !border-white/10 focus:!border-blue-500 !text-white rounded-xl text-base font-mono"
                    placeholder="Máx 8 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between text-xs font-black text-slate-300 uppercase tracking-wider">
                  <span>Confirmar Contraseña *</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {confirmPassword.length}/8
                  </span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={8}
                    className="input-field pl-12 h-14 w-full !bg-slate-950 !border-white/10 focus:!border-blue-500 !text-white rounded-xl text-base font-mono"
                    placeholder="Repita la clave"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-sm font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 group uppercase tracking-wider mt-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "GUARDAR NUEVA CLAVE Y ACCEDER"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}

          {!success && (
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full flex items-center justify-center gap-2 mt-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          )}

          <p className="text-center mt-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
            desarrollo @eforgan
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
