"use client";

import React, { useState } from "react";
import { BookOpen, Plane, AlertTriangle, ShieldCheck, FileText, ChevronRight, X, Download, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ManualItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  updatedAt: string;
  version: string;
  sections: { title: string; content: string }[];
}

export default function ManualsPage() {
  const [selectedManual, setSelectedManual] = useState<ManualItem | null>(null);

  const manuals: ManualItem[] = [
    {
      id: "hems-nvg",
      title: "Manual HEMS / NVG",
      description: "Procedimientos Operativos Estandarizados (SOP) para misiones de evacuación aeromédica (HEMS) y vuelo nocturno con visores de visión nocturna (NVG).",
      icon: <Plane className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
      updatedAt: "2024-03-15",
      version: "v2.1 ANAC",
      sections: [
        {
          title: "1. Misiones Aeromédicas HEMS",
          content: "Planificación de vuelo de respuesta rápida, zonas de aterrizaje no preparadas (HELSITE), comunicación directa con equipo médico de tierra y margen de performance HOGE/HIGE."
        },
        {
          title: "2. Operaciones con Visores Nocturnos (NVG)",
          content: "Chequeo pre-vuelo de tubos intensificadores Gen III, iluminación de cabina compatible NVG, técnicas de barrido visual en baja cota y límites meteorológicos (mínimo 1500m visibilidad)."
        },
        {
          title: "3. Procedimientos de Emergencia",
          content: "Recuperación ante desorientación espacial (IIMC), fallo de iluminación de cabina durante vuelo NVG y aterrizaje precautorio en helisitie desprotegido."
        }
      ]
    },
    {
      id: "moe",
      title: "Manual de Mantenimiento (MOE)",
      description: "Directrices, intervalos de inspección periódica y procedimientos de mantenimiento aprobados por la autoridad aeronáutica (ANAC).",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "bg-green-50 text-green-600 dark:bg-green-900/20",
      updatedAt: "2024-02-01",
      version: "v4.0 ANAC",
      sections: [
        {
          title: "1. Responsabilidades de la Tripulación",
          content: "Verificación de la Ficha Técnica de Registro de Vuelo (Foliado), discrepancias anotadas en Logbook, diferimiento de fallas según Lista de Equipamiento Mínimo (MEL)."
        },
        {
          title: "2. Inspecciones Pre/Post Vuelo",
          content: "Inspección de 360 grados, verificación de niveles de aceite en cajas de transmisión principal (MGB/TGB), condición de palas de rotor principal y rotor de cola."
        },
        {
          title: "3. Control de Vencimientos Técnicos",
          content: "Inspecciones de 50h / 100h / 300h, directivas de aeronavegabilidad (AD) aplicables y boletines de servicio de fabricantes (AgustaWestland / Airbus Helicopters)."
        }
      ]
    },
    {
      id: "sms",
      title: "Sistema de Gestión de Seguridad (SMS)",
      description: "Políticas, reporte voluntario/confidencial de eventos de seguridad y evaluación continua de riesgos operacionales en la flota.",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
      updatedAt: "2024-04-10",
      version: "v1.5 ANAC",
      sections: [
        {
          title: "1. Política de Seguridad Operacional",
          content: "Cultura justa no punitiva, compromiso de la alta dirección con la seguridad y priorización de la seguridad operacional sobre la presión comercial."
        },
        {
          title: "2. Gestión de Riesgos (FRAT)",
          content: "Formulario de Evaluación de Riesgos Pre-Vuelo (FRAT), niveles de mitigación requeridos según puntaje y aprobación por Jefe de Pilotos."
        },
        {
          title: "3. Sistema de Reporte Interno (MOR)",
          content: "Procedimiento para el envío de reportes voluntario/confidencial de incidentes, condiciones peligrosas en helipuntos o fallos de equipo."
        }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      <div className="mb-10">
        <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-2 flex items-center gap-3 text-slate-950 dark:text-white">
          <BookOpen className="w-10 h-10 text-blue-600" />
          Biblioteca Técnica
        </h1>
        <p className="text-muted-foreground font-bold text-sm">
          Acceso centralizado a la documentación operativa, manuales y procedimientos estandarizados normativos ANAC.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manuals.map((manual, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={manual.id}
            onClick={() => setSelectedManual(manual)}
            className="group rounded-[2rem] p-6 border-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${manual.color}`}>
                {manual.icon}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-2">{manual.title}</h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 min-h-[50px]">
                {manual.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{manual.version}</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-black text-blue-600 group-hover:text-blue-700 transition-colors uppercase">
                LEER MANUAL
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Manual Interactive Viewer Modal */}
      <AnimatePresence>
        {selectedManual && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedManual.color}`}>
                    {selectedManual.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white">
                      {selectedManual.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 uppercase">Edición: {selectedManual.version} | Actualizado: {selectedManual.updatedAt}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedManual(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-6 pr-2 flex-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {selectedManual.description}
                </p>

                <div className="space-y-4">
                  {selectedManual.sections.map((sec, i) => (
                    <div key={i} className="p-5 bg-white dark:bg-slate-850 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xs">
                      <h4 className="font-black text-sm uppercase text-blue-600 dark:text-blue-400 mb-2">{sec.title}</h4>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{sec.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Documentación Normativa ANAC</span>
                <button
                  onClick={() => alert(`Iniciando descarga de ${selectedManual.title} (${selectedManual.version}.pdf)...`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  DESCARGAR PDF COMPLETO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
