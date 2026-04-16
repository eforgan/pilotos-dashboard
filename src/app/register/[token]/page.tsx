"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Shield, Lock, Mail, User, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const { token } = useParams();
  const router = useRouter();
  const [pilot, setPilot] = useState<{ PILOTO: string, DNI: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Verify, 2: Set Password, 3: Success

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      try {
        const res = await fetch(`/api/auth/verify-token?token=${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setPilot(data.pilot);
          setEmail(data.pilot.PILOTO.split(',')[0].toLowerCase().trim().replace(/ /g, '.') + "@empresa.com");
        } else {
          setError(data.error || "Token inválido o expirado.");
        }
      } catch (err) {
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      
      if (res.ok) {
        setStep(3);
      } else {
        const data = await res.json();
        setError(data.error || "Error al registrar el usuario.");
      }
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="font-bold text-slate-500 uppercase tracking-widest">Verificando invitación...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 font-bold text-sm"
            >
              <AlertCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}

          {step === 1 && pilot && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800 text-center"
            >
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-black uppercase mb-2">Bienvenido, {pilot.PILOTO.split(',')[1] || pilot.PILOTO}</h1>
              <p className="text-muted-foreground font-medium mb-8">Has sido invitado a unirte al Panel de Pilotos. Comencemos con tu registro.</p>
              
              <button 
                onClick={() => setStep(2)}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
              >
                CONTINUAR REGISTRO
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl shadow-blue-500/10 border border-slate-100 dark:border-slate-800"
            >
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
                <Lock className="w-6 h-6 text-blue-600" />
                Configurar Cuenta
              </h2>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-muted-foreground uppercase">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      className="input-field pl-12"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-muted-foreground uppercase">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      className="input-field pl-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-muted-foreground uppercase">Confirmar Contraseña</label>
                  <div className="relative">
                    <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="password" 
                      className="input-field pl-12"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                  {submitting ? "PROCESANDO..." : "FINALIZAR REGISTRO"}
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-2xl text-center border-t-8 border-green-500"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-black uppercase mb-2">¡Registro Exitoso!</h1>
              <p className="text-muted-foreground font-medium mb-8">Tu cuenta ha sido creada. Ahora puedes iniciar sesión y actualizar tus datos.</p>
              
              <Link href="/login" className="btn-primary w-full py-4 block">
                IR AL INICIO DE SESIÓN
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
