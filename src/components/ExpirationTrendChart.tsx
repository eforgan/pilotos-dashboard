"use client";

import React, { useMemo } from "react";
import { Pilot } from "@/lib/types";
import { getAllAlerts, parseDate } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ExpirationTrendChartProps {
  pilots: Pilot[];
  monthsAhead?: number;
}

const MONTH_LABELS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export default function ExpirationTrendChart({ pilots, monthsAhead = 6 }: ExpirationTrendChartProps) {
  const buckets = useMemo(() => {
    const alerts = getAllAlerts(pilots);
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);

    const months = Array.from({ length: monthsAhead }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      return { year: d.getFullYear(), month: d.getMonth(), count: 0 };
    });

    for (const alert of alerts) {
      const date = parseDate(alert.date);
      if (!date) continue;
      const bucket = months.find((m) => m.year === date.getFullYear() && m.month === date.getMonth());
      if (bucket) bucket.count++;
    }

    return months;
  }, [pilots, monthsAhead]);

  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md mb-8"
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white">
            Tendencia de Vencimientos
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Certificaciones por vencer en los próximos {monthsAhead} meses.
          </p>
        </div>
      </div>

      <div className="flex items-end gap-3 h-40">
        {buckets.map((b, i) => {
          const heightPct = (b.count / max) * 100;
          const isCurrent = i === 0;
          return (
            <div key={`${b.year}-${b.month}`} className="flex-1 flex flex-col items-center justify-end h-full gap-2">
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">{b.count}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(heightPct, b.count > 0 ? 6 : 2)}%` }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`w-full rounded-t-lg ${
                  isCurrent
                    ? "bg-gradient-to-t from-red-600 to-rose-400"
                    : "bg-gradient-to-t from-blue-600 to-sky-400"
                }`}
                title={`${b.count} vencimiento${b.count === 1 ? "" : "s"}`}
              />
              <span className="text-[10px] font-black uppercase text-slate-400">
                {MONTH_LABELS[b.month]} {String(b.year).slice(2)}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
