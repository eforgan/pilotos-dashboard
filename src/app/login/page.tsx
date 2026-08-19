"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Credenciales inválidas");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-sky-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-10">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative w-40 h-16"
            >
              {!logoError ? (
                <Image 
                    src="/logo.png" 
                    alt="Modena Logo" 
                    fill
                    priority
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
          <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter text-white mb-1">Portal de Tripulación</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Aviation Excellence</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border border-white/5 shadow-blue-500/10">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Correo Electrónico
              </label>
              <input 
                type="email" 
                className="input-field h-14 w-full !bg-slate-900/50 !border-white/10 focus:!bg-slate-900 !text-white rounded-xl px-4"
                placeholder="ej: piloto@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-widest mb-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Contraseña
              </label>
              <input 
                type="password" 
                className="input-field h-14 w-full !bg-slate-900/50 !border-white/10 focus:!bg-slate-900 !text-white rounded-xl px-4"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 group"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "INGRESAR AL PANEL"}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-400 font-medium">
            ¿No tienes cuenta? <a href="mailto:admin@empresa.com" className="text-blue-500 font-bold hover:text-blue-400 transition-colors cursor-pointer">Contacta al Administrador</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
