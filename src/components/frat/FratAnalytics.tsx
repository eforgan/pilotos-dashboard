"use client";

import React, { useMemo } from "react";
import { FratType } from "@/lib/frat-data";
import { ShieldCheck, ShieldAlert, AlertTriangle, TrendingUp, Award, Plane, Radio } from "lucide-react";

interface FratAnalyticsItem {
  id: string;
  type: FratType;
  flightDate: string;
  base?: string | null;
  aircraft?: string | null;
  missionType?: string | null;
  finalScore: number;
  maxScore: number;
  finalRiskLevel: "ACCEPTABLE" | "CAUTION" | "HIGH_RISK";
}

export default function FratAnalytics({ items }: { items: FratAnalyticsItem[] }) {
  const analytics = useMemo(() => {
    const total = items.length;
    if (total === 0) return null;

    const acceptable = items.filter((i) => i.finalRiskLevel === "ACCEPTABLE").length;
    const caution = items.filter((i) => i.finalRiskLevel === "CAUTION").length;
    const highRisk = items.filter((i) => i.finalRiskLevel === "HIGH_RISK").length;

    // By base — el promedio se expresa como % del puntaje máximo de cada FRAT
    // (Training y Daily Ops tienen escalas distintas, ej. 44 vs 62 puntos),
    // así que no se puede promediar el puntaje crudo entre bases con mezcla de tipos.
    const byBase: Record<string, { count: number; avgPct: number; sumPct: number }> = {};
    items.forEach((i) => {
      const b = i.base || "Sin especificar";
      if (!byBase[b]) byBase[b] = { count: 0, avgPct: 0, sumPct: 0 };
      byBase[b].count += 1;
      byBase[b].sumPct += i.maxScore > 0 ? (i.finalScore / i.maxScore) * 100 : 0;
    });

    Object.keys(byBase).forEach((b) => {
      byBase[b].avgPct = Math.round((byBase[b].sumPct / byBase[b].count) * 10) / 10;
    });

    // By Mission Type
    const byMission: Record<string, number> = {};
    items.forEach((i) => {
      const m = i.missionType || "Traslado";
      byMission[m] = (byMission[m] || 0) + 1;
    });

    // By Aircraft
    const byAircraft: Record<string, number> = {};
    items.forEach((i) => {
      const a = i.aircraft || "N/A";
      byAircraft[a] = (byAircraft[a] || 0) + 1;
    });

    return { total, acceptable, caution, highRisk, byBase, byMission, byAircraft };
  }, [items]);

  if (!analytics) {
    return (
      <div className="glass-panel p-10 rounded-3xl text-center border-2 border-slate-200 dark:border-slate-800">
        <p className="font-bold text-slate-500 text-sm">Cargue evaluaciones FRAT para visualizar la analítica de riesgo SMS.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Risk Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl border-2 border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Evaluaciones</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-white">{analytics.total}</p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border-2 border-emerald-300/50 dark:border-emerald-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Acceptable</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {analytics.acceptable} <span className="text-xs font-bold text-slate-400">({Math.round((analytics.acceptable / analytics.total) * 100)}%)</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border-2 border-amber-300/50 dark:border-amber-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Caution</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {analytics.caution} <span className="text-xs font-bold text-slate-400">({Math.round((analytics.caution / analytics.total) * 100)}%)</span>
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border-2 border-red-300/50 dark:border-red-700/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl font-black text-red-600 dark:text-red-400">
            {analytics.highRisk} <span className="text-xs font-bold text-slate-400">({Math.round((analytics.highRisk / analytics.total) * 100)}%)</span>
          </p>
        </div>
      </div>

      {/* Base Score & Mission Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-500" /> Promedio de Riesgo por Base Operativa
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byBase).map(([b, data]) => (
              <div key={b} className="space-y-1">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-slate-700 dark:text-slate-300">{b}</span>
                  <span className="text-blue-600 dark:text-cyan-400">{data.avgPct}% avg ({data.count} vuelos)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${Math.min(data.avgPct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-2">
            <Plane className="w-4 h-4 text-indigo-500" /> Distribución por Tipo de Misión
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.byMission).map(([m, count]) => (
              <div key={m} className="flex items-center justify-between text-xs font-extrabold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-800 dark:text-slate-200">{m}</span>
                <span className="px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-cyan-400 font-black">{count} evaluaciones</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aircraft Breakdown */}
      <div className="glass-panel p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-500" /> Distribución por Aeronave
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(analytics.byAircraft).map(([a, count]) => (
            <div key={a} className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-lg font-black text-slate-950 dark:text-white">{count}</span>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
