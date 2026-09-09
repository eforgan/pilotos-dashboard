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
  emerald: "bg-emerald-500 text-white border-emerald-600",
  amber: "bg-amber-500 text-white border-amber-600",
  red: "bg-red-600 text-white border-red-700 animate-pulse",
};

const LIGHT_CLASS: Record<string, string> = {
  emerald: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200",
  amber: "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200",
  red: "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200",
};

export default function FratScoreBar({ score }: { score: FratScoreSummary }) {
  const info = RISK_LEVEL_INFO[score.finalLevel];
  const Icon = ICONS[score.finalLevel];

  return (
    <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-4 md:p-5 shadow-2xl mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4 w-full lg:w-auto">
        <div className={`px-5 py-3 rounded-2xl font-black text-2xl tracking-tighter shadow-md border shrink-0 ${BADGE_CLASS[info.colorClass]}`}>
          {score.finalScore}/{score.max}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <h3 className="font-black text-lg uppercase tracking-tight text-slate-950 dark:text-white">
              {info.label}
            </h3>
            {score.initialScore !== score.finalScore && (
              <span className="text-[10px] font-bold text-slate-400">
                (inicial: {score.initialScore}/{score.max})
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">{info.action}</p>
        </div>
      </div>

      <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase shrink-0 ${LIGHT_CLASS[info.colorClass]}`}>
        {score.answered}/{score.total} preguntas respondidas
      </div>
    </div>
  );
}
