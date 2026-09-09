"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FileCheck, Loader2, Plus, AlertTriangle } from "lucide-react";
import { FratType } from "@/lib/frat-data";

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

  useEffect(() => {
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
            <FileCheck className="w-4 h-4" />
            SMS — Sistema de Gestión de Seguridad Operacional
          </div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            FRAT — Evaluación de Riesgo Pre-Vuelo
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Flight Risk Assessment Tool oficial (EHSIT / PAVE) de Modena Air Service.
            {role !== "ADMIN" && " Mostrando tus evaluaciones."}
          </p>
        </div>
        <Link
          href="/frat/new"
          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-500/25 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nueva Evaluación FRAT
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase text-slate-400">Total registradas</p>
          <p className="text-2xl font-black text-slate-950 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase text-amber-600">Caution</p>
          <p className="text-2xl font-black text-amber-600">{stats.caution}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4">
          <p className="text-[10px] font-black uppercase text-red-600">High Risk</p>
          <p className="text-2xl font-black text-red-600">{stats.highRisk}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-auto bg-white dark:bg-slate-900">
          <option value="">Todos los tipos</option>
          <option value="TRAINING">Training FRAT</option>
          <option value="DAILY_OPS">Daily Normal Ops FRAT</option>
        </select>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="input-field w-auto bg-white dark:bg-slate-900">
          <option value="">Todos los riesgos</option>
          <option value="ACCEPTABLE">Acceptable</option>
          <option value="CAUTION">Caution</option>
          <option value="HIGH_RISK">High Risk</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <AlertTriangle className="w-10 h-10 text-slate-300 mb-3" />
            <p className="font-bold text-slate-500 text-sm">Todavía no hay evaluaciones FRAT registradas.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="text-left px-5 py-3">Tipo</th>
                <th className="text-left px-5 py-3">Piloto / PIC</th>
                <th className="text-left px-5 py-3">Base</th>
                <th className="text-left px-5 py-3">Aeronave</th>
                <th className="text-left px-5 py-3">Puntaje</th>
                <th className="text-left px-5 py-3">Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-bold">
                    <Link href={`/frat/${item.id}`} className="hover:underline">
                      {new Date(item.flightDate).toLocaleDateString("es-AR")}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-bold">{TYPE_LABEL[item.type]}</td>
                  <td className="px-5 py-3 font-bold">{item.pilot?.PILOTO || item.picName}</td>
                  <td className="px-5 py-3 text-slate-500">{item.base || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{item.aircraft || "—"}</td>
                  <td className="px-5 py-3 font-black">
                    {item.finalScore}/{item.maxScore}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${BADGE_CLASS[item.finalRiskLevel]}`}>
                      {item.finalRiskLevel.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
