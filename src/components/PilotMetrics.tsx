"use client";

import React, { useEffect, useState } from "react";
import { PilotSummary } from "@/lib/types";
import { Users, AlertCircle, Calendar, CheckCircle2 } from "lucide-react";
import { motion, animate } from "framer-motion";

function Counter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest))
    });
    return () => controls.stop();
  }, [value]);

  return <>{displayValue}</>;
}

interface PilotMetricsProps {
  summary: PilotSummary;
}

const PilotMetrics = ({ summary }: PilotMetricsProps) => {
  const cards = [
    {
      title: "Tripulación Total",
      value: summary.total,
      icon: Users,
      color: "blue",
      description: "Personal Activo",
      accent: "from-blue-600 to-sky-400"
    },
    {
      title: "Alertas Críticas",
      value: summary.criticalAlerts,
      icon: AlertCircle,
      color: "red",
      description: "Atención Inmediata",
      accent: "from-red-600 to-rose-400"
    },
    {
      title: "Alertas Próximas",
      value: summary.warningAlerts + summary.cautionAlerts,
      icon: Calendar,
      color: "orange",
      description: "Próximos Vencimientos",
      accent: "from-orange-600 to-amber-400"
    },
    {
      title: "Estado Operativo",
      value: summary.okCount,
      icon: CheckCircle2,
      color: "green",
      description: "Cumplimiento Total",
      accent: "from-green-600 to-emerald-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          whileHover={{ y: -4 }}
          className="relative group bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.accent} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity`} />
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.accent} p-[1px]`}>
              <div className="w-full h-full rounded-[15px] bg-slate-900 flex items-center justify-center">
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">{card.title}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter">
                  <Counter value={card.value} />
                </span>
                <span className="text-xs font-black text-slate-700 dark:text-slate-300">PILOTOS</span>
              </div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tight mt-1">{card.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default PilotMetrics;
