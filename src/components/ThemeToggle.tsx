"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Standard hydration-safe mount detection for next-themes: the server can't
    // know the stored theme, so we render a neutral placeholder until mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-11 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-700" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-cyan-400 transition-all shadow-sm group"
      title={isDark ? "Cambiar a Modo Día (Luz)" : "Cambiar a Modo Noche (Oscuro)"}
    >
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-xl transition-all ${isDark ? "bg-cyan-500/20 text-cyan-400" : "bg-amber-500/20 text-amber-600"}`}>
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </div>
        <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
          {isDark ? "Modo Noche" : "Modo Día"}
        </span>
      </div>

      <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-xl">
        <span
          className={`px-2 py-0.5 text-[10px] font-black rounded-lg transition-all ${
            !isDark
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-400"
          }`}
        >
          DÍA
        </span>
        <span
          className={`px-2 py-0.5 text-[10px] font-black rounded-lg transition-all ${
            isDark
              ? "bg-cyan-500 text-slate-950 shadow-sm"
              : "text-slate-400"
          }`}
        >
          NOCHE
        </span>
      </div>
    </button>
  );
}
