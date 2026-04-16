"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPilotById, updatePilot, formatDate } from "@/lib/utils";
import { Pilot } from "@/lib/types";
import { 
  User, Phone, CreditCard, Calendar, Shield, Plane, 
  MapPin, Save, ArrowLeft, Loader2, CheckCircle, AlertTriangle, FileText
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import PhotoUpload from "@/components/PhotoUpload";
import DocumentManager from "@/components/DocumentManager";
import { PilotReport } from "@/components/PilotReport";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

export default function PilotProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
  });
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [formData, setFormData] = useState<Partial<Pilot>>({});

  useEffect(() => {
    async function loadPilot() {
      if (!id) return;
      try {
        const data = await getPilotById(id as string);
        if (data) {
          setPilot(data);
          setFormData(data);
        }
      } catch (err) {
        console.error("Load pilot error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPilot();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setSaveStatus("idle");
    
    try {
      const updated = await updatePilot(id as string, formData);
      if (updated) {
        setPilot(updated);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!pilot) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10">
        <AlertTriangle className="w-16 h-16 text-orange-500 mb-4" />
        <h1 className="text-2xl font-bold">Piloto no encontrado</h1>
        <p className="text-muted-foreground mb-6">No se pudo cargar la información del perfil.</p>
        <Link href="/" className="btn-primary">Volver al Panel</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto pb-20 mt-16 md:mt-0">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        VOLVER AL PANEL
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <PhotoUpload 
            pilotId={id as string} 
            currentImage={pilot.imageUrl} 
            onUploadComplete={(newUrl) => setPilot(prev => prev ? { ...prev, imageUrl: newUrl } : null)}
          />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter">{pilot.PILOTO}</h1>
            <p className="text-muted-foreground font-semibold flex items-center justify-center md:justify-start gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              LICENCIA: {pilot.LICENCIA || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <AnimatePresence>
                {saveStatus === "success" && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-lg border border-green-100"
                    >
                        <CheckCircle className="w-4 h-4" />
                        CAMBIOS GUARDADOS
                    </motion.div>
                )}
            </AnimatePresence>

            <button 
                onClick={handleSubmit}
                disabled={saving}
                className="btn-primary py-4 px-8 min-w-[200px] flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30"
            >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
            </button>
            <button 
                onClick={() => handlePrint()}
                className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                title="Generar Legajo PDF"
            >
                <FileText className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* Hidden Report for Printing */}
      <div className="hidden">
        <PilotReport ref={reportRef} pilot={pilot} />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Datos Personales */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b-2 border-slate-100 dark:border-slate-800 pb-2 mb-4">
            <User className="w-5 h-5 text-blue-500" />
            DATOS PERSONALES
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  name="PILOTO"
                  className="input-field pl-12"
                  value={formData.PILOTO || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase">DNI</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    name="DNI"
                    className="input-field pl-12"
                    value={formData.DNI || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-muted-foreground uppercase">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    name="TELEFONO"
                    className="input-field pl-12"
                    value={formData.TELEFONO || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-muted-foreground uppercase">Base de Operaciones</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  name="BASE"
                  className="input-field pl-12"
                  value={formData.BASE || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Certificaciones Críticas */}
        <section className="space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b-2 border-slate-100 dark:border-slate-800 pb-2 mb-4">
            <Shield className="w-5 h-5 text-orange-500" />
            VENCIMIENTOS CLAVE
          </h2>
          
          <div className="space-y-4">
            {[
              { id: 'CMA', label: 'CMA (Médico)', icon: Shield },
              { id: 'LICENCIA', label: 'Licencia Piloto', icon: Plane },
              { id: 'BO105', label: 'Habil. BO105', icon: Plane },
              { id: 'AW109', label: 'Habil. AW109', icon: Plane },
              { id: 'SIMULADOR', label: 'Simulador', icon: Calendar },
              { id: 'CONTROL_BIENAL', label: 'Control Bienal', icon: Calendar },
            ].map(field => (
              <div key={field.id} className="space-y-3 p-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-black text-muted-foreground uppercase">{field.label}</label>
                  <div className="relative">
                    <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="text" 
                      name={field.id}
                      placeholder="DD/MM/AAAA"
                      className="input-field pl-12"
                      value={(formData as any)[field.id] || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DocumentManager 
                  pilotId={id as string}
                  docType={field.id}
                  label="Documento de Respaldo"
                  initialDocuments={pilot.documents}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Cursos y Otros */}
        <section className="space-y-6 md:col-span-2">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b-2 border-slate-100 dark:border-slate-800 pb-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-500" />
                OTROS CURSOS Y REQUISITOS
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                    { id: 'CRM_FFHH', label: 'CRM / FFHH' },
                    { id: 'MERC_PELIGROSAS', label: 'Mcías Peligrosas' },
                    { id: 'SMS', label: 'SMS' },
                    { id: 'MOE', label: 'MOE' },
                    { id: 'HUET', label: 'HUET' },
                    { id: 'SMS', label: 'SMS' },
                ].map(field => (
                    <div key={field.id} className="space-y-1.5">
                        <label className="text-xs font-black text-muted-foreground uppercase">{field.label}</label>
                        <input 
                            type="text" 
                            name={field.id}
                            className="input-field"
                            value={(formData as any)[field.id] || ""}
                            onChange={handleInputChange}
                        />
                    </div>
                ))}
            </div>
        </section>
      </form>
    </div>
  );
}
