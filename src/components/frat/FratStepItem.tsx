"use client";

import React from "react";
import { AlertTriangle, Check, ShieldAlert } from "lucide-react";
import { FratItem, FratResponseValue } from "@/lib/frat-data";

const SCORE_STYLES: Record<0 | 1 | 2, { base: string; active: string; dot: string }> = {
  0: {
    base: "border-slate-200 dark:border-slate-700 hover:border-emerald-400",
    active: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
  1: {
    base: "border-slate-200 dark:border-slate-700 hover:border-amber-400",
    active: "bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  2: {
    base: "border-slate-200 dark:border-slate-700 hover:border-red-400",
    active: "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-200",
    dot: "bg-red-500",
  },
};

interface FratStepItemProps {
  item: FratItem;
  value?: FratResponseValue;
  onChange: (value: FratResponseValue | undefined) => void;
}

export default function FratStepItem({ item, value, onChange }: FratStepItemProps) {
  const selectInitial = (score: 0 | 1 | 2) => {
    onChange({ initial: score, final: score, mitigation: score === 2 ? value?.mitigation : undefined });
  };

  const setMitigation = (mitigation: string) => {
    if (!value) return;
    onChange({ ...value, mitigation });
  };

  const setFinal = (final: 0 | 1 | 2) => {
    if (!value) return;
    onChange({ ...value, final });
  };

  const suggestedMitigation = item.options.find((o) => o.score === 2)?.mitigation;
  const needsMitigation = value?.initial === 2;

  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-colors ${
        needsMitigation
          ? "border-red-300 dark:border-red-800 bg-red-50/40 dark:bg-red-950/20"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{item.label}</h4>
        {item.noGo && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase shrink-0">
            <ShieldAlert className="w-3 h-3" />
            Regla NO-GO
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {item.options.map((opt) => {
          const active = value?.initial === opt.score;
          const style = SCORE_STYLES[opt.score];
          return (
            <button
              key={opt.score}
              type="button"
              onClick={() => selectInitial(opt.score)}
              className={`flex items-center gap-3 text-left px-4 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                active ? style.active : style.base
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  active ? style.dot : "bg-slate-200 dark:bg-slate-700"
                }`}
              >
                {active && <Check className="w-3.5 h-3.5 text-white" />}
              </span>
              <span className="flex-1">{opt.label}</span>
              <span className="text-[10px] font-black opacity-60 shrink-0">+{opt.score} pts</span>
            </button>
          );
        })}
      </div>

      {needsMitigation && (
        <div className="mt-3 pt-3 border-t border-red-200 dark:border-red-800/60 space-y-3">
          <div className="flex items-start gap-2 text-red-700 dark:text-red-300 text-[11px] font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {item.noGo
                ? "Regla NO-GO: esta condición impide el despacho salvo que se aplique una mitigación efectiva y realista, o se cancele/reprograme el vuelo."
                : "Ítem en rojo: cargue una acción de mitigación real antes del vuelo (Paso 8 del instructivo)."}
            </span>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-red-700 dark:text-red-300 mb-1">
              Acción de mitigación
            </label>
            <textarea
              rows={2}
              value={value?.mitigation || ""}
              onChange={(e) => setMitigation(e.target.value)}
              placeholder={suggestedMitigation || "Describa la mitigación aplicada..."}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-700 rounded-xl text-xs font-semibold text-slate-950 dark:text-white outline-none focus:border-red-600"
            />
            {suggestedMitigation && (
              <p className="text-[10px] text-slate-400 mt-1">
                Sugerencia del formulario original: &quot;{suggestedMitigation}&quot; — ajústela a la situación real.
              </p>
            )}
          </div>

          {value?.mitigation?.trim() && (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Puntaje final tras la mitigación
              </label>
              <div className="flex gap-2">
                {([0, 1, 2] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFinal(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black border-2 ${
                      value.final === s
                        ? SCORE_STYLES[s].active
                        : "border-slate-200 dark:border-slate-700 text-slate-500"
                    }`}
                  >
                    {s} pts
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
