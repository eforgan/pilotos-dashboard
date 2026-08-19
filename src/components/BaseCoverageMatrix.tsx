"use client";

import React, { useState } from "react";
import { Pilot } from "@/lib/types";
import { getPilotOverallStatus, getPilotAircraft } from "@/lib/utils";
import { MapPin, ShieldCheck, AlertTriangle, XCircle, Plane, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BaseCoverageMatrixProps {
  pilots: Pilot[];
}

const HELICOPTER_MODELS = ["AW109", "BO105", "RH44", "BN2B"] as const;

export default function BaseCoverageMatrix({ pilots }: BaseCoverageMatrixProps) {
  const [expandedBase, setExpandedBase] = useState<string | null>(null);

  // Group pilots by Base
  const basesMap: Record<string, Pilot[]> = {};

  pilots.forEach((p) => {
    const baseName = (p.BASE || "Sin Base").toUpperCase().trim();
    if (!basesMap[baseName]) {
      basesMap[baseName] = [];
    }
    basesMap[baseName].push(p);
  });

  const baseNames = Object.keys(basesMap).sort();

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            Matriz Táctica de Cobertura Operacional por Base
          </h2>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
            Disponibilidad en tiempo real de tripulación habilitada por aeronave para respuesta a emergencias HEMS 24/7.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-black uppercase">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vigentes
          </span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Advertencia
          </span>
          <span className="flex items-center gap-1.5 text-red-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Vencidos
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {baseNames.map((baseName) => {
          const basePilots = basesMap[baseName];
          const isExpanded = expandedBase === baseName;

          // Count active vs critical pilots
          const activePilots = basePilots.filter((p) => getPilotOverallStatus(p) !== "critical");
          const criticalPilots = basePilots.filter((p) => getPilotOverallStatus(p) === "critical");

          return (
            <div
              key={baseName}
              className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-850/50 transition-all"
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedBase(isExpanded ? null : baseName)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-sm border border-blue-300 dark:border-blue-700 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base uppercase text-slate-950 dark:text-white">{baseName}</h3>
                    <p className="text-xs font-bold text-slate-500">
                      {basePilots.length} Pilotos Asignados ({activePilots.length} Habilitados | {criticalPilots.length} Inhabilitados)
                    </p>
                  </div>
                </div>

                {/* Helicopters count badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {HELICOPTER_MODELS.map((model) => {
                    const qualifiedPilots = basePilots.filter((p) => getPilotAircraft(p).includes(model));
                    const fullyReadyPilots = qualifiedPilots.filter((p) => getPilotOverallStatus(p) === "ok");

                    return (
                      <div
                        key={model}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${
                          fullyReadyPilots.length > 0
                            ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                            : qualifiedPilots.length > 0
                            ? "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400"
                        }`}
                      >
                        <Plane className="w-3.5 h-3.5" />
                        <span>{model}: <strong>{fullyReadyPilots.length}</strong>/{qualifiedPilots.length}</span>
                      </div>
                    );
                  })}

                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Detail List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 space-y-3"
                  >
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Detalle de Tripulación en {baseName}:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {basePilots.map((p) => {
                        const status = getPilotOverallStatus(p);
                        const aircraft = getPilotAircraft(p);

                        return (
                          <div
                            key={p.id}
                            className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                          >
                            <div className="truncate">
                              <p className="font-extrabold text-sm uppercase text-slate-950 dark:text-white truncate">{p.PILOTO}</p>
                              <p className="text-[11px] font-bold text-slate-500 truncate">
                                {aircraft.length > 0 ? aircraft.join(", ") : "Sin Aeronave Asignada"}
                              </p>
                            </div>

                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                status === "ok"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : status === "warning" || status === "caution"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                              }`}
                            >
                              {status === "ok" ? "Vigente ✓" : status === "critical" ? "Crítico ⚠️" : "Próximo ⏳"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
