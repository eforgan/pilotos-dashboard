"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { 
  Shield, Lock, Mail, CheckCircle, AlertCircle, Loader2, 
  ArrowRight, User, Phone, MapPin, CreditCard, GraduationCap, 
  Plane, Calendar, ShieldCheck, ChevronDown, Check, Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PhotoUpload from "@/components/PhotoUpload";
import { Pilot } from "@/lib/types";

export default function DynamicRegisterPage() {
  const { token } = useParams();
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Form & Autoverification, 2: Success
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Pilot>>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Accordion open states
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    personal: true,
    medical: true,
    aircraft: true,
    training: true,
    security: true,
  });

  const togglePanel = (key: string) => {
    setOpenPanels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    async function verifyToken() {
      if (!token) return;
      try {
        const res = await fetch(`/api/auth/verify-token?token=${token}`);
        const data = await res.json();
        
        if (res.ok && data.pilot) {
          setPilot(data.pilot);
          setFormData({
            ...data.pilot,
            EMAIL: data.pilot.EMAIL || "",
          });
        } else {
          setError(data.error || "Enlace de invitación no válido o expirado.");
        }
      } catch {
        setError("Error de conexión al verificar el enlace de invitación.");
      } finally {
        setLoading(false);
      }
    }
    verifyToken();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const fieldsToTrack: (keyof Pilot)[] = [
      "PILOTO", "DNI", "TELEFONO", "EMAIL", "BASE", "LICENCIA", 
      "CMA", "CONTROL_BIENAL", "SIMULADOR", "CRM_FFHH"
    ];
    let filled = 0;
    fieldsToTrack.forEach(f => {
      if (formData[f] && formData[f] !== "") filled++;
    });
    if (password && password.length >= 6 && password === confirmPassword) filled++;
    return Math.round((filled / (fieldsToTrack.length + 1)) * 100);
  }, [formData, password, confirmPassword]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.EMAIL || !formData.EMAIL.includes("@")) {
      setError("Por favor ingresa un correo electrónico válido.");
      setOpenPanels(prev => ({ ...prev, personal: true }));
      return;
    }

    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setOpenPanels(prev => ({ ...prev, security: true }));
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setOpenPanels(prev => ({ ...prev, security: true }));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          email: formData.EMAIL, 
          password,
          pilotData: formData,
        }),
      });
      
      if (res.ok) {
        setStep(2);
      } else {
        const data = await res.json();
        setError(data.error || "Error al registrar el legajo digital.");
      }
    } catch {
      setError("Error de conexión al enviar el formulario de registro.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="font-black text-sm uppercase tracking-widest text-slate-400">Verificando Invitación de Tripulación...</p>
      </div>
    );
  }

  if (error && !pilot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full bg-slate-900 border-2 border-red-800 p-8 rounded-3xl text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-950 border-2 border-red-700 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black uppercase text-red-200 mb-2">Enlace no Válido</h2>
          <p className="text-sm text-slate-400 font-bold mb-6">{error}</p>
          <Link href="/login" className="btn-primary w-full block py-3.5 text-center font-black">
            IR AL INICIO DE SESIÓN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 pb-24 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-950/80 border border-blue-700/60 rounded-full text-blue-300 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Portal de Autoverificación y Registro de Tripulantes
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-outfit uppercase tracking-tight text-white mb-2">
            Legajo Digital de Piloto
          </h1>
          <p className="text-slate-400 font-bold text-sm max-w-xl mx-auto">
            Por favor revise, complete y confirme sus datos personales, licencias y habilitaciones para activar su usuario.
          </p>
        </div>

        {/* Progress Bar */}
        {step === 1 && (
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl mb-8 shadow-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Progreso de Formulario</span>
              <span className="text-sm font-black text-blue-400">{completionPercentage}% Completado</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-950/90 border-2 border-red-800 text-red-200 p-4 rounded-2xl mb-6 flex items-center gap-3 font-bold text-sm shadow-lg"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {step === 1 && (
            <form onSubmit={handleRegister} className="space-y-6">
              
              {/* PANEL 1: DATOS PERSONALES Y FOTO */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <button
                  type="button"
                  onClick={() => togglePanel("personal")}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-700 flex items-center justify-center text-blue-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase text-white tracking-wide">1. Datos Personales y Foto de Perfil</h2>
                      <p className="text-xs font-bold text-slate-400">Información básica y foto oficial para legajo ANAC</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openPanels.personal ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {openPanels.personal && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 pt-2 border-t border-slate-800 space-y-6"
                    >
                      {/* Photo Upload Component */}
                      <PhotoUpload 
                        pilotId={pilot?.id || ""}
                        currentImage={formData.imageUrl}
                        onUploadComplete={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-slate-400">Nombre Completo del Piloto</label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                              type="text" 
                              name="PILOTO"
                              className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                              value={formData.PILOTO || ""}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-slate-400">DNI / Documento de Identidad</label>
                          <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                              type="text" 
                              name="DNI"
                              className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                              value={formData.DNI || ""}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-slate-400">Correo Electrónico (Para Avisos y Login)</label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                              type="email" 
                              name="EMAIL"
                              className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                              value={formData.EMAIL || ""}
                              onChange={handleInputChange}
                              placeholder="piloto@empresa.com"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-slate-400">Teléfono Celular de Contacto</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                              type="text" 
                              name="TELEFONO"
                              className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                              value={formData.TELEFONO || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-xs font-black uppercase text-slate-400">Base Principal de Operaciones</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                              type="text" 
                              name="BASE"
                              className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                              value={formData.BASE || ""}
                              onChange={handleInputChange}
                              placeholder="Ej: BUENOS AIRES, SAN FERNANDO, MENDOZA"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PANEL 2: LICENCIAS Y MEDICO */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <button
                  type="button"
                  onClick={() => togglePanel("medical")}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-700 flex items-center justify-center text-purple-400">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase text-white tracking-wide">2. Licencias y Certificado Médico</h2>
                      <p className="text-xs font-bold text-slate-400">Registro de Licencia ANAC, CMA y Control Bienal</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openPanels.medical ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {openPanels.medical && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                      <div className="space-y-1.5 sm:col-span-3">
                        <label className="text-xs font-black uppercase text-slate-400">Licencia ANAC (Tipo y Nro Puntuado)</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="text" 
                            name="LICENCIA"
                            className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                            value={formData.LICENCIA || ""}
                            onChange={handleInputChange}
                            placeholder="Ej: P.C.H. 21.524.146"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400">Vencimiento CMA (Médico)</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="text" 
                            name="CMA"
                            placeholder="DD/MM/AAAA"
                            className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                            value={formData.CMA || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400">Control Bienal</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="text" 
                            name="CONTROL_BIENAL"
                            placeholder="DD/MM/AAAA"
                            className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                            value={formData.CONTROL_BIENAL || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400">Inspección / Reconocimiento</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="text" 
                            name="INSP_RECONOC"
                            placeholder="DD/MM/AAAA"
                            className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                            value={formData.INSP_RECONOC || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PANEL 3: AERONAVES DE LA EMPRESA */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <button
                  type="button"
                  onClick={() => togglePanel("aircraft")}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
                      <Plane className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase text-white tracking-wide">3. Habilitaciones a Aeronaves de la Empresa</h2>
                      <p className="text-xs font-bold text-slate-400">Selecciona los modelos a los que estás habilitado operativamente</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openPanels.aircraft ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {openPanels.aircraft && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 pt-2 border-t border-slate-800"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { key: "AW109", label: "AW109", desc: "AgustaWestland AW109" },
                          { key: "BO105", label: "BO105", desc: "MBB BO 105" },
                          { key: "RH44", label: "RH44", desc: "Robinson R44 / RH44" },
                          { key: "BN2B", label: "BN2B", desc: "Britten-Norman Islander" },
                        ].map((ac) => {
                          const isEnabled = Boolean(formData[ac.key as keyof Pilot] && formData[ac.key as keyof Pilot] !== "N.A." && formData[ac.key as keyof Pilot] !== "0" && formData[ac.key as keyof Pilot] !== "");
                          return (
                            <button
                              key={ac.key}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  [ac.key]: isEnabled ? "" : ac.key,
                                }));
                              }}
                              className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                                isEnabled
                                  ? "bg-blue-950 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-2">
                                <span className="font-black text-base">{ac.label}</span>
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${isEnabled ? "bg-blue-600 border-blue-600 text-white" : "border-slate-700"}`}>
                                  {isEnabled && <Check className="w-3.5 h-3.5" />}
                                </div>
                              </div>
                              <span className="text-[11px] font-bold opacity-80">{ac.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PANEL 4: CURSOS Y OPERACIONAL */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <button
                  type="button"
                  onClick={() => togglePanel("training")}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase text-white tracking-wide">4. Cursos, Simulador y Evaluaciones</h2>
                      <p className="text-xs font-bold text-slate-400">Fechas de vencimiento de capacitaciones operacionales</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openPanels.training ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {openPanels.training && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                      {[
                        { id: "SIMULADOR", label: "Simulador de Vuelo" },
                        { id: "CTRL_IDONEIDAD", label: "Control Idoneidad" },
                        { id: "CTRL_RUTA", label: "Control de Ruta" },
                        { id: "CTRL_VLO_INST", label: "Control Instrumentos" },
                        { id: "CRM_FFHH", label: "CRM / Factores Humanos" },
                        { id: "MERC_PELIGROSAS", label: "Mercancías Peligrosas" },
                        { id: "INTERF_ILICITA", label: "Interferencia Ilícita" },
                        { id: "MOE", label: "MOE" },
                        { id: "SMS", label: "SMS" },
                        { id: "HUET", label: "HUET" },
                      ].map(field => (
                        <div key={field.id} className="space-y-1.5">
                          <label className="text-xs font-black uppercase text-slate-400">{field.label}</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                              type="text" 
                              name={field.id}
                              placeholder="DD/MM/AAAA"
                              className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                              value={(formData[field.id as keyof Pilot] as string) || ""}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* PANEL 5: SEGURIDAD Y CONTRASEÑA */}
              <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <button
                  type="button"
                  onClick={() => togglePanel("security")}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700 flex items-center justify-center text-red-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black uppercase text-white tracking-wide">5. Creación de Cuenta y Contraseña</h2>
                      <p className="text-xs font-bold text-slate-400">Configura tu clave personal para acceder al panel en el futuro</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openPanels.security ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {openPanels.security && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400">Nueva Contraseña (Mínimo 6 caracteres)</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="password" 
                            className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-400">Confirmar Contraseña</label>
                        <div className="relative">
                          <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input 
                            type="password" 
                            className="input-field pl-12 bg-slate-950 border-slate-800 text-white font-bold"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full py-5 text-lg font-black uppercase tracking-wider flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/40 rounded-2xl"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Shield className="w-6 h-6" />}
                  {submitting ? "REGISTRANDO LEGAJO Y CUENTA..." : "CONFIRMAR Y FINALIZAR REGISTRO"}
                </button>
              </div>

            </form>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 border-2 border-emerald-500 p-10 rounded-3xl shadow-2xl text-center max-w-xl mx-auto"
            >
              <div className="w-24 h-24 bg-emerald-950 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black uppercase text-white mb-2">¡Legajo y Cuenta Activados!</h1>
              <p className="text-slate-300 font-bold mb-8">
                Tus datos personales, licencias, fotos y habilitaciones han sido verificados y guardados con éxito en la base de datos.
              </p>
              
              <Link href="/login" className="btn-primary w-full py-4 block font-black text-center text-lg">
                INGRESAR AL PANEL DE PILOTOS
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
