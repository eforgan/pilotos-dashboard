"use client";

import React, { useState } from "react";
import { Pilot, COMPANY_BASES, BaseContract } from "@/lib/types";
import { getPilotOverallStatus, getPilotAircraft } from "@/lib/utils";
import { MapPin, ShieldCheck, AlertTriangle, Plane, ChevronDown, ChevronUp, FileText, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BaseCoverageMatrixProps {
  pilots: Pilot[];
}

export default function BaseCoverageMatrix({ pilots }: BaseCoverageMatrixProps) {
  const [expandedBaseId, setExpandedBaseId] = useState<string | null>(null);

  // Helper to match pilot base string to official BaseContract
  const matchBaseContract = (pilotBase: string): BaseContract | undefined => {
    if (!pilotBase) return undefined;
    const b = pilotBase.toLowerCase().trim();
    if (b.includes("nuñez") || b.includes("nunez") || b.includes("same")) return COMPANY_BASES.find(c => c.id === "nunez");
    if (b.includes("rosario") || b.includes("utv")) return COMPANY_BASES.find(c => c.id === "rosario");
    if (b.includes("neuquen") || b.includes("neuquén") || b.includes("vista")) return COMPANY_BASES.find(c => c.id === "neuquen");
    if (b.includes("cabo") || b.includes("virgenes") || b.includes("psm")) return COMPANY_BASES.find(c => c.id === "cabo_virgenes");
    if (b.includes("sierra") || b.includes("grande") || b.includes("ypf")) return COMPANY_BASES.find(c => c.id === "sierra_grande");
    if (b.includes("calafate") || b.includes("patagonia")) return COMPANY_BASES.find(c => c.id === "calafate");
    return undefined;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            Matriz Táctica de Cobertura por Contrato y Base
          </h2>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
            Configuración oficial de bases operativas Modena Air Service, contratos de clientes y cobertura de flota habilitada.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-black uppercase">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vigente ✓
          </span>
          <span className="flex items-center gap-1.5 text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Vencimiento Próximo ⏳
          </span>
          <span className="flex items-center gap-1.5 text-red-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Crítico / Inhabilitado ⚠️
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {COMPANY_BASES.map((contract) => {
          // Filter pilots assigned to this contract base
          const assignedPilots = pilots.filter((p) => {
            const matched = matchBaseContract(p.BASE);
            return matched?.id === contract.id || (p.BASE && p.BASE.toUpperCase().includes(contract.name.toUpperCase()));
          });

          const isExpanded = expandedBaseId === contract.id;
          const activeCount = assignedPilots.filter(p => getPilotOverallStatus(p) !== "critical").length;
          const criticalCount = assignedPilots.filter(p => getPilotOverallStatus(p) === "critical").length;

          return (
            <div
              key={contract.id}
              className="border-2 border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-850/50 transition-all"
            >
              {/* Header Row */}
              <div
                onClick={() => setExpandedBaseId(isExpanded ? null : contract.id)}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-start md:items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center text-sm border border-blue-700 shrink-0 shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base uppercase text-slate-950 dark:text-white">{contract.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 text-[11px] font-black uppercase border border-blue-300 dark:border-blue-700">
                        {contract.client}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      {contract.description}
                    </p>
                  </div>
                </div>

                {/* Fleet Required vs Available Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {contract.fleetRequired.map((req) => {
                    const qualifiedPilots = assignedPilots.filter((p) => getPilotAircraft(p).includes(req.model));
                    const readyPilots = qualifiedPilots.filter((p) => getPilotOverallStatus(p) === "ok");

                    const isSufficient = readyPilots.length >= req.count;

                    return (
                      <div
                        key={req.model}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 ${
                          isSufficient
                            ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                            : qualifiedPilots.length > 0
                            ? "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200"
                            : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200"
                        }`}
                      >
                        <Plane className="w-3.5 h-3.5 text-current" />
                        <span>{req.model} ({req.count} req): <strong>{readyPilots.length} Habilitados</strong></span>
                      </div>
                    );
                  })}

                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Expanded Pilot Roster */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                        Tripulación Asignada a {contract.name} ({assignedPilots.length} Pilotos Registrados):
                      </h4>
                      <span className="text-xs font-bold text-slate-400 uppercase">Ubicación: {contract.location}</span>
                    </div>

                    {assignedPilots.length === 0 ? (
                      <p className="text-xs font-bold text-slate-400 italic py-2">
                        No hay pilotos asignados actualmente a esta base. Puede asignar pilotos editando su legajo.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {assignedPilots.map((p) => {
                          const status = getPilotOverallStatus(p);
                          const aircraft = getPilotAircraft(p);

                          return (
                            <div
                              key={p.id}
                              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40"
                            >
                              <div className="truncate">
                                <p className="font-black text-sm uppercase text-slate-950 dark:text-white truncate">{p.PILOTO}</p>
                                <p className="text-[11px] font-bold text-slate-500 truncate mt-0.5">
                                  {aircraft.length > 0 ? `Aeronaves: ${aircraft.join(", ")}` : "Sin Habilitación Activa"}
                                </p>
                              </div>

                              <span
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 ${
                                  status === "ok"
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : status === "warning" || status === "caution"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                }`}
                              >
                                {status === "ok" ? "Vigente ✓" : status === "critical" ? "Inhabilitado ⚠️" : "Próximo ⏳"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
