"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Shield, ArrowRight, UserCheck, CreditCard, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { sanitizeDni } from "@/lib/dni";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
    setSuccessMsg(null);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const cleanDni = dni;

    if (!cleanDni || cleanDni.length < 6) {
      setError("Por favor ingrese un N° de DNI válido (mínimo 6 dígitos numéricos).");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (password.length < 4 || password.length > 8) {
      setError("La contraseña debe tener entre 4 y 8 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register-dni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dni: cleanDni,
          password,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Ocurrió un error al registrar la cuenta.");
      } else {
        setSuccessMsg("¡Registro exitoso! Iniciando sesión...");
        
        // Auto sign in after registration
        const loginRes = await signIn("credentials", {
          email: cleanDni,
          password,
          redirect: false,
        });

        if (!loginRes?.error) {
          router.push("/");
          router.refresh();
        } else {
          setActiveTab("login");
          setSuccessMsg("Cuenta creada. Por favor ingrese con su contraseña.");
        }
      }
    } catch {
      setError("Error de red al intentar registrarse.");
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
          
          {/* Tab Selection */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl mb-6 border border-white/10">
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === "login"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("register"); setError(null); setSuccessMsg(null); }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === "register"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Registrarse
            </button>
          </div>

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

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-xl mb-6 text-xs font-bold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* LOGIN FORM */}
          <AnimatePresence mode="wait">
            {activeTab === "login" ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] font-bold text-blue-300 leading-tight mb-2">
                  💡 <strong>Primer ingreso:</strong> Ingrese su N° de DNI sin puntos ni espacios como Usuario y Contraseña inicial. Luego definirá su clave propia de hasta 8 caracteres.
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
            ) : (
              /* REGISTER FORM */
              <motion.form
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[11px] font-bold text-blue-300 leading-tight mb-2">
                  💡 Ingrese su N° de DNI sin puntos ni espacios para vincular automáticamente su legajo de vuelo.
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-xs font-black text-slate-300 uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      Número de DNI *
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Sin puntos</span>
                  </label>
                  <input 
                    type="text" 
                    className="input-field h-13 w-full !bg-slate-950/70 !border-white/10 focus:!border-blue-500 !text-white rounded-xl px-4 font-mono text-base placeholder:text-slate-600"
                    placeholder="ej: 12572581"
                    value={dni}
                    onChange={(e) => handleDniChange(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-black text-slate-300 uppercase tracking-widest">
                    <Mail className="w-4 h-4 text-blue-400" />
                    Correo Electrónico (Opcional)
                  </label>
                  <input 
                    type="email" 
                    className="input-field h-13 w-full !bg-slate-950/70 !border-white/10 focus:!border-blue-500 !text-white rounded-xl px-4 text-sm placeholder:text-slate-600"
                    placeholder="ej: piloto@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-black text-slate-300 uppercase tracking-widest">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      className="input-field h-13 w-full !bg-slate-950/70 !border-white/10 focus:!border-blue-500 !text-white rounded-xl px-4 text-sm"
                      placeholder="4 a 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-xs font-black text-slate-300 uppercase tracking-widest">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      Confirmar *
                    </label>
                    <input
                      type="password"
                      maxLength={8}
                      className="input-field h-13 w-full !bg-slate-950/70 !border-white/10 focus:!border-blue-500 !text-white rounded-xl px-4 text-sm"
                      placeholder="Repetir clave"
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "CREAR CUENTA Y ACCEDER"}
                  {!loading && <UserCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

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
