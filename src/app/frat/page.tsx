"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, FileCheck, 
  Plane, Sun, Moon, Wind, UserCheck, RefreshCw, Printer 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FratSection {
  title: string;
  items: { id: string; label: string; points: number }[];
}

const FRAT_SECTIONS: FratSection[] = [
  {
    title: "1. Condición de Tripulación y Fatiga",
    items: [
      { id: "fatigue_rest", label: "Menos de 8 horas de descanso continuo pre-vuelo", points: 8 },
      { id: "fatigue_24h", label: "Más de 6 horas de vuelo acumuladas en las últimas 24h", points: 6 },
      { id: "crew_single", label: "Operación Monopiloto (Sin Copiloto de apoyo)", points: 5 },
      { id: "crew_recent", label: "Menos de 10 horas en el modelo de aeronave en los últimos 90 días", points: 7 },
    ]
  },
  {
    title: "2. Condiciones Meteorológicas y Visibilidad",
    items: [
      { id: "wx_night", label: "Operación Vuelo Nocturno (NVG / Visores Nocturnos)", points: 8 },
      { id: "wx_ceiling", label: "Techo de nubes inferior a 1500 ft AGL", points: 6 },
      { id: "wx_vis", label: "Visibilidad horizontal inferior a 3000 metros", points: 7 },
      { id: "wx_wind", label: "Viento cruzado o ráfagas superiores a 25 nudos", points: 5 },
    ]
  },
  {
    title: "3. Complejidad de la Misión y Helipunto",
    items: [
      { id: "mission_hems", label: "Evacuación Aeromédica Crítica (HEMS con paciente grave)", points: 7 },
      { id: "mission_unprepared", label: "Aterrizaje en zona de emergencia no preparada (HELSITE / Terreno irregular)", points: 9 },
      { id: "mission_mountain", label: "Operación en alta montaña / Altiplano (> 5000 ft PA)", points: 6 },
      { id: "mission_fuel", label: "Margen de combustible estimado de reserva inferior a 30 minutos", points: 10 },
    ]
  },
  {
    title: "4. Estado Técnico de la Aeronave",
    items: [
      { id: "ac_mel", label: "Aeronave operando con elemento diferido según MEL (Lista Equipamiento Mínimo)", points: 6 },
      { id: "ac_light", label: "Avería menor no crítica en luces externas o radio secundaria", points: 4 },
    ]
  }
];

export default function FratPage() {
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [pilotName, setPilotName] = useState("");
  const [tailNumber, setTailNumber] = useState("AW109");
  const [flightRoute, setFlightRoute] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculate score
  const totalScore = Object.keys(selectedItems).reduce((sum, id) => {
    if (!selectedItems[id]) return sum;
    for (const sec of FRAT_SECTIONS) {
      const item = sec.items.find(i => i.id === id);
      if (item) return sum + item.points;
    }
    return sum;
  }, 0);

  const getRiskCategory = (score: number) => {
    if (score <= 12) return { level: "Bajo Riesgo", color: "bg-emerald-500 text-white", border: "border-emerald-600", desc: "Vuelo Autorizado. Mantener vigilancia operacional estándar." };
    if (score <= 25) return { level: "Riesgo Moderado", color: "bg-amber-500 text-white", border: "border-amber-600", desc: "Requiere Plan de Mitigación y Notificación previa al Jefe de Operaciones." };
    return { level: "ALTO RIESGO", color: "bg-red-600 text-white", border: "border-red-700", desc: "Vuelo Suspendido. Se requiere Aprobación Explicita y Firma de la Dirección de Operaciones." };
  };

  const risk = getRiskCategory(totalScore);

  const handleReset = () => {
    setSelectedItems({});
    setPilotName("");
    setFlightRoute("");
    setSubmitted(false);
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto pb-20 mt-16 md:mt-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            SMS - Gestión de Seguridad Operacional
          </div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            Evaluación de Riesgo Pre-Vuelo (FRAT)
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Flight Risk Assessment Tool - Matriz interactiva de mitigación de riesgos para tripulaciones Modena Air Service.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          REINICIAR EVALUACIÓN
        </button>
      </div>

      {/* Live Risk Meter Bar */}
      <div className="sticky top-4 z-40 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-5 shadow-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`px-5 py-3 rounded-2xl font-black text-2xl tracking-tighter ${risk.color} shadow-md border ${risk.border}`}>
            {totalScore} PTS
          </div>
          <div>
            <h3 className="font-black text-lg uppercase tracking-tight text-slate-950 dark:text-white">{risk.level}</h3>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{risk.desc}</p>
          </div>
        </div>

        <button
          onClick={() => setSubmitted(true)}
          className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/25 transition-all"
        >
          REGISTRAR EVALUACIÓN
        </button>
      </div>

      {/* Flight Info Inputs */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-3xl mb-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-600" />
          Datos del Vuelo y Comandante
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Comandante de Aeronave</label>
            <input
              type="text"
              placeholder="ej. Cap. Eduardo Forgan"
              value={pilotName}
              onChange={e => setPilotName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Aeronave / Matrícula</label>
            <select
              value={tailNumber}
              onChange={e => setTailNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            >
              <option value="AW109">AW109 - AgustaWestland</option>
              <option value="BO105">BO105 - MBB</option>
              <option value="RH44">RH44 - Robinson R44</option>
              <option value="BN2B">BN2B - Islander</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Ruta / Misión</label>
            <input
              type="text"
              placeholder="ej. SABE -> HELSITE -> SABE"
              value={flightRoute}
              onChange={e => setFlightRoute(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Checklists Sections */}
      <div className="space-y-6">
        {FRAT_SECTIONS.map((sec, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-base font-black uppercase text-slate-950 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              {sec.title}
            </h3>

            <div className="space-y-3">
              {sec.items.map(item => {
                const checked = Boolean(selectedItems[item.id]);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      checked
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100 shadow-sm"
                        : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 shrink-0 ${checked ? "bg-amber-500 border-amber-500 text-white" : "border-slate-400"}`}>
                        {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="font-bold text-sm">{item.label}</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${checked ? "bg-amber-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>
                      +{item.points} PTS
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {submitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4 border border-emerald-300">
                <FileCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white mb-2">
                FRAT Registrado Exitosamente
              </h2>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-6">
                El formulario de riesgo pre-vuelo ha sido archivado en el sistema de gestión de seguridad (SMS) con un puntaje final de <strong className="text-slate-950 dark:text-white">{totalScore} PTS ({risk.level})</strong>.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-extrabold text-xs uppercase text-slate-900 dark:text-white"
                >
                  <Printer className="w-4 h-4" />
                  IMPRIMIR COMPROBANTE
                </button>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-extrabold text-xs uppercase shadow-md hover:bg-blue-700"
                >
                  ACEPTAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
