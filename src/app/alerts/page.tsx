"use client";

import React, { useState, useEffect } from "react";
import { getPilots, getPilotExpirations } from "@/lib/utils";
import { Pilot, ExpirationItem } from "@/lib/types";
import { AlertCircle, ShieldAlert, CheckCircle2, ChevronRight, User, Calendar, Loader2, Send, BellRing } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface PilotWithAlerts {
  pilot: Pilot;
  criticals: ExpirationItem[];
  warnings: ExpirationItem[];
}

export default function AlertsPage() {
  const [pilotsData, setPilotsData] = useState<PilotWithAlerts[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");
  const [triggering, setTriggering] = useState(false);
  const [notifyResult, setNotifyResult] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const pilots = await getPilots();
        const alertsData: PilotWithAlerts[] = [];
        
        pilots.forEach(pilot => {
          const expirations = getPilotExpirations(pilot);
          const criticals = expirations.filter(e => e.level === "critical");
          const warnings = expirations.filter(e => e.level === "warning");
          
          if (criticals.length > 0 || warnings.length > 0) {
            alertsData.push({ pilot, criticals, warnings });
          }
        });
        
        // Sort by most criticals first
        alertsData.sort((a, b) => {
            if (b.criticals.length !== a.criticals.length) {
                return b.criticals.length - a.criticals.length;
            }
            return b.warnings.length - a.warnings.length;
        });

        setPilotsData(alertsData);
      } catch (err) {
        console.error("Failed to load alerts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCriticals = pilotsData.reduce((acc, p) => acc + p.criticals.length, 0);
  const totalWarnings = pilotsData.reduce((acc, p) => acc + p.warnings.length, 0);

  const filteredPilots = pilotsData.filter(p => {
    if (filter === "critical") return p.criticals.length > 0;
    if (filter === "warning") return p.warnings.length > 0 && p.criticals.length === 0;
    return true;
  });

  const handleTriggerNotifications = async () => {
    setTriggering(true);
    setNotifyResult(null);
    try {
      const res = await fetch("/api/admin/trigger-notifications", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifyResult(`Se enviaron ${data.count} notificaciones automáticas de alertas.`);
      } else {
        setNotifyResult("Error al enviar notificaciones.");
      }
    } catch {
      setNotifyResult("Error de conexión al procesar las notificaciones.");
    } finally {
      setTriggering(false);
      setTimeout(() => setNotifyResult(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Escaneando Vencimientos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-2 flex items-center gap-3">
            <ShieldAlert className="w-10 h-10 text-red-500" />
            Central de Alertas
          </h1>
          <p className="text-muted-foreground font-semibold">
            Monitoreo en tiempo real de vencimientos y certificaciones críticas de la tripulación.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleTriggerNotifications}
            disabled={triggering}
            className="flex items-center gap-2 px-5 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase rounded-2xl transition-all shadow-lg shadow-red-500/25 disabled:opacity-50"
          >
            {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
            {triggering ? "ENVIANDO AVISOS..." : "DISPARAR ALERTAS A TRIPULACIÓN"}
          </button>
          {notifyResult && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              {notifyResult}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setFilter(filter === "critical" ? "all" : "critical")}
            className={`cursor-pointer rounded-[2rem] p-6 border transition-all ${
                filter === "critical" || filter === "all" 
                ? "bg-red-500 text-white border-red-600 shadow-xl shadow-red-500/30" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${filter === "critical" || filter === "all" ? "bg-white/20" : "bg-red-100 text-red-600"}`}>
                    <AlertCircle className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black">{totalCriticals}</span>
            </div>
            <h3 className="font-bold text-lg mb-1">Alertas Críticas</h3>
            <p className={`text-sm font-medium ${filter === "critical" || filter === "all" ? "text-red-100" : "text-muted-foreground"}`}>
                Vencidas o a menos de 30 días
            </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setFilter(filter === "warning" ? "all" : "warning")}
            className={`cursor-pointer rounded-[2rem] p-6 border transition-all ${
                filter === "warning" || filter === "all" 
                ? "bg-orange-500 text-white border-orange-600 shadow-xl shadow-orange-500/30" 
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100"
            }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${filter === "warning" || filter === "all" ? "bg-white/20" : "bg-orange-100 text-orange-600"}`}>
                    <Calendar className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black">{totalWarnings}</span>
            </div>
            <h3 className="font-bold text-lg mb-1">Próximos a Vencer</h3>
            <p className={`text-sm font-medium ${filter === "warning" || filter === "all" ? "text-orange-100" : "text-muted-foreground"}`}>
                Entre 30 y 90 días
            </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[2rem] p-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-center items-center text-center"
        >
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Monitoreo Activo</h3>
            <p className="text-sm text-muted-foreground font-medium">Sistema actualizado</p>
        </motion.div>
      </div>

      {/* Pilots List */}
      <div className="space-y-4">
        {filteredPilots.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">¡Todo en orden!</h3>
                <p className="text-muted-foreground font-medium">No hay alertas {filter !== "all" ? "de este tipo " : ""}para mostrar.</p>
            </div>
        ) : (
            filteredPilots.map((data, idx) => (
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={data.pilot.id}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all"
                >
                    <div className="flex items-center gap-4 min-w-[250px]">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-black text-slate-400 overflow-hidden shrink-0">
                            {data.pilot.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={data.pilot.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-6 h-6" />
                            )}
                        </div>
                        <div className="truncate">
                            <h3 className="font-black text-lg uppercase tracking-tight truncate">{data.pilot.PILOTO}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase truncate">{data.pilot.LICENCIA ? `LICENCIA: ${data.pilot.LICENCIA}` : "Sin Licencia"}</p>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-wrap items-center gap-2">
                        {data.criticals.map((exp, i) => (
                            <div key={`crit-${i}`} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl shrink-0">
                                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-red-800 dark:text-red-300 tracking-wider leading-none mb-0.5">{exp.label}</span>
                                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 leading-none">
                                        {exp.daysRemaining < 0 ? `Venció hace ${Math.abs(exp.daysRemaining)} días` : `Vence en ${exp.daysRemaining} días`}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {data.warnings.map((exp, i) => (
                            <div key={`warn-${i}`} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl shrink-0">
                                <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-orange-800 dark:text-orange-300 tracking-wider leading-none mb-0.5">{exp.label}</span>
                                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 leading-none">
                                        Vence en {exp.daysRemaining} días
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link 
                        href={`/pilot/${data.pilot.id}`}
                        className="btn-primary py-3 px-6 shrink-0 flex items-center justify-center gap-2"
                    >
                        VER PERFIL
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
