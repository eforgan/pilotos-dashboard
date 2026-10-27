"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Shield, ArrowRight, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { sanitizeDni } from "@/lib/dni";

export default function LoginPage() {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const router = useRouter();

  const handleDniChange = (val: string) => {
    // Sanitize in real time: remove dots and spaces
    setDni(sanitizeDni(val));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // dni is already sanitized on every keystroke by handleDniChange
    const cleanDni = dni;

    try {
      const result = await signIn("credentials", {
        email: cleanDni,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("N° de DNI o contraseña incorrectos. Verifique sus datos.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-6 relative overflow-hidden">
      {/* Dynamic Glow Background */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-sky-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-44 h-16"
            >
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
            </motion.div>
          </div>
          <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter text-white mb-1">
            Portal de Tripulación
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">
            Acceso a Legajos y Operaciones
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/10 shadow-blue-500/10">

          {/* Feedback Messages */}
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

          {/* LOGIN FORM */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] font-bold text-blue-300 leading-tight mb-2">
              💡 <strong>Primer ingreso:</strong> Ingrese su N° de DNI sin puntos ni espacios como Usuario y Contraseña inicial. Luego definirá su clave propia de 6 caracteres.
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-black text-slate-300 uppercase tracking-widest mb-1">
                <span className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Número de DNI
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Sin puntos ni espacios</span>
              </label>
              <input
                type="text"
                className="input-field h-14 w-full !bg-slate-950/70 !border-white/10 focus:!border-blue-500 !text-white rounded-xl px-4 font-mono tracking-wider text-base placeholder:text-slate-600"
                placeholder="ej: 12572581"
                value={dni}
                onChange={(e) => handleDniChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-widest mb-1">
                <Lock className="w-4 h-4 text-blue-400" />
                Contraseña
              </label>
              <input
                type="password"
                className="input-field h-14 w-full !bg-slate-950/70 !border-white/10 focus:!border-blue-500 !text-white rounded-xl px-4 text-base"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-sm font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 group uppercase tracking-wider mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "INGRESAR A MI LEGAJO"}
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </motion.form>

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
