"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { FratScoreSummary, RISK_LEVEL_INFO } from "@/lib/frat-data";

const ICONS = {
  ACCEPTABLE: CheckCircle2,
  CAUTION: AlertTriangle,
  HIGH_RISK: ShieldAlert,
};

const BADGE_CLASS: Record<string, string> = {
  emerald: "bg-emerald-500 text-white border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
  amber: "bg-amber-500 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]",
  red: "bg-red-600 text-white border-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]",
};

const LIGHT_CLASS: Record<string, string> = {
  emerald: "bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-300 font-black",
  amber: "bg-amber-500/10 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-black",
  red: "bg-red-500/10 dark:bg-red-950/60 border border-red-300 dark:border-red-700 text-red-900 dark:text-red-300 font-black",
};

export default function FratScoreBar({ score }: { score: FratScoreSummary }) {
  const info = RISK_LEVEL_INFO[score.finalLevel];
  const Icon = ICONS[score.finalLevel];

  return (
    <div className="sticky top-4 z-40 glass-panel border-2 border-slate-300 dark:border-slate-800 rounded-3xl p-4 md:p-5 shadow-2xl shadow-blue-500/5 mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 backdrop-blur-xl">
      <div className="flex items-center gap-4 w-full lg:w-auto">
        <div className={`px-5 py-3 rounded-2xl font-black text-2xl tracking-tighter border shrink-0 ${BADGE_CLASS[info.colorClass]}`}>
          {score.finalScore}/{score.max}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <h3 className="font-black text-lg uppercase tracking-tight text-slate-950 dark:text-white">
              {info.label}
            </h3>
            {score.initialScore !== score.finalScore && (
              <span className="text-[10px] font-extrabold text-slate-400">
                (inicial: {score.initialScore}/{score.max})
              </span>
            )}
          </div>
          <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl">{info.action}</p>
        </div>
      </div>

      <div className={`px-4 py-2 rounded-xl text-xs uppercase shrink-0 ${LIGHT_CLASS[info.colorClass]}`}>
        {score.answered}/{score.total} preguntas respondidas
      </div>
    </div>
  );
}
