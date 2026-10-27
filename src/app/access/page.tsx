"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, ArrowRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

function AccessGateForm() {
  const [accessKey, setAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/access-gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: accessKey }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Clave de acceso incorrecta.");
        setLoading(false);
        return;
      }

      const from = searchParams.get("from") || "/";
      router.push(from);
      router.refresh();
    } catch {
      setError("Error de conexión con el servidor.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-44 h-16">
              {!logoError ? (
                <Image
                  src="/logo.png"
                  alt="Modena Air Service"
                  fill
                  priority
                  sizes="176px"
                  className="object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-4xl font-black italic text-blue-500 tracking-tighter leading-none">MODENA</span>
                  <span className="text-[10px] font-bold tracking-[0.4em] text-slate-500 mt-1">AIR SERVICE</span>
                </div>
              )}
            </div>
          </div>
          <h1 className="text-2xl font-black font-outfit uppercase tracking-tighter text-white mb-1">
            Acceso Restringido
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">
            Ingrese la Clave de Acceso
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 shadow-blue-500/10">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl mb-6 text-xs font-bold flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-widest mb-1">
                <KeyRound className="w-4 h-4 text-blue-400" />
                Clave de Acceso
              </label>
              <input
                type="password"
                autoFocus
                className="input-field h-14 w-full !bg-slate-950/70 !border-white/10 focus:!border-blue-500 !text-white rounded-xl px-4 text-base"
                placeholder="Ingrese la clave"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 group uppercase tracking-wider mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONTINUAR"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              desarrollo @eforgan
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function AccessGatePage() {
  return (
    <Suspense fallback={null}>
      <AccessGateForm />
    </Suspense>
  );
}
