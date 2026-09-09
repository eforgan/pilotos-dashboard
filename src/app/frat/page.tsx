"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FileCheck, Loader2, Plus, AlertTriangle, BarChart2, List } from "lucide-react";
import { FratType } from "@/lib/frat-data";
import FratAnalytics from "@/components/frat/FratAnalytics";

interface FratListItem {
  id: string;
  type: FratType;
  flightDate: string;
  base?: string | null;
  aircraft?: string | null;
  picName: string;
  initialScore: number;
  finalScore: number;
  maxScore: number;
  finalRiskLevel: "ACCEPTABLE" | "CAUTION" | "HIGH_RISK";
  pilot?: { PILOTO: string } | null;
}

const BADGE_CLASS: Record<string, string> = {
  ACCEPTABLE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  CAUTION: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  HIGH_RISK: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
};

const TYPE_LABEL: Record<FratType, string> = {
  TRAINING: "Training",
  DAILY_OPS: "Daily Ops",
};

export default function FratListPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const [items, setItems] = useState<FratListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [riskFilter, setRiskFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"list" | "analytics">("list");

  useEffect(() => {
    // Fetch-on-filter-change pattern: the loading flag is intentionally set
    // synchronously before the request starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (riskFilter) params.set("riskLevel", riskFilter);
    fetch(`/api/frat?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter, riskFilter]);

  const stats = useMemo(() => {
    const total = items.length;
    const caution = items.filter((i) => i.finalRiskLevel === "CAUTION").length;
    const highRisk = items.filter((i) => i.finalRiskLevel === "HIGH_RISK").length;
    return { total, caution, highRisk };
  }, [items]);

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-400/30 text-blue-700 dark:text-cyan-300 text-xs font-black rounded-full uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <FileCheck className="w-4 h-4 text-blue-500" />
            SMS — Sistema de Gestión de Seguridad Operacional
          </div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            FRAT — Evaluación de Riesgo Pre-Vuelo
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-extrabold text-sm mt-1">
            Flight Risk Assessment Tool oficial (EHSIT / PAVE) de Modena Air Service.
            {role !== "ADMIN" && " Mostrando tus evaluaciones."}
          </p>
        </div>
        <Link
          href="/frat/new"
          className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nueva Evaluación FRAT
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-panel rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-lg">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total registradas</p>
          <p className="text-3xl font-black text-slate-950 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="glass-panel rounded-3xl p-5 border-2 border-amber-300/50 dark:border-amber-700/50 shadow-lg shadow-amber-500/5">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Caution</p>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.caution}</p>
        </div>
        <div className="glass-panel rounded-3xl p-5 border-2 border-red-300/50 dark:border-red-700/50 shadow-lg shadow-red-500/5">
          <p className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">High Risk</p>
          <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">{stats.highRisk}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${
              activeTab === "list"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <List className="w-4 h-4" /> Evaluaciones
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BarChart2 className="w-4 h-4" /> Analítica de Riesgo SMS
          </button>
        </div>

        {activeTab === "list" && (
          <div className="flex items-center gap-3">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-auto bg-white dark:bg-slate-900 font-bold">
              <option value="">Todos los tipos</option>
              <option value="TRAINING">Training FRAT</option>
              <option value="DAILY_OPS">Daily Normal Ops FRAT</option>
            </select>
            <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input-field w-auto bg-white dark:bg-slate-900 font-bold">
              <option value="">Todos los riesgos</option>
              <option value="ACCEPTABLE">Acceptable</option>
              <option value="CAUTION">Caution</option>
              <option value="HIGH_RISK">High Risk</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === "analytics" ? (
        <FratAnalytics items={items} />
      ) : (
        <div className="glass-panel border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <AlertTriangle className="w-10 h-10 text-slate-400 mb-3" />
            <p className="font-bold text-slate-500 text-sm">Todavía no hay evaluaciones FRAT registradas.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="text-left px-6 py-4">Fecha</th>
                <th className="text-left px-6 py-4">Tipo</th>
                <th className="text-left px-6 py-4">Piloto / PIC</th>
                <th className="text-left px-6 py-4">Base</th>
                <th className="text-left px-6 py-4">Aeronave</th>
                <th className="text-left px-6 py-4">Puntaje</th>
                <th className="text-left px-6 py-4">Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">
                    <Link href={`/frat/${item.id}`} className="hover:text-blue-600 dark:hover:text-cyan-400 hover:underline">
                      {new Date(item.flightDate).toLocaleDateString("es-AR")}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-extrabold">{TYPE_LABEL[item.type]}</td>
                  <td className="px-6 py-4 font-black text-slate-900 dark:text-white">{item.pilot?.PILOTO || item.picName}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold">{item.base || "—"}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-semibold">{item.aircraft || "—"}</td>
                  <td className="px-6 py-4 font-black text-slate-900 dark:text-white">
                    {item.finalScore}/{item.maxScore}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${BADGE_CLASS[item.finalRiskLevel]}`}>
                      {item.finalRiskLevel.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      )}
    </div>
  );
}
