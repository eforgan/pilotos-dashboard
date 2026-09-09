"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, FileCheck } from "lucide-react";
import FratWizard from "@/components/frat/FratWizard";

export default function NewFratPage() {
  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      <Link
        href="/frat"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        VOLVER AL HISTÓRICO
      </Link>

      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
          <FileCheck className="w-4 h-4" />
          SMS — Sistema de Gestión de Seguridad Operacional
        </div>
        <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
          Nueva Evaluación FRAT
        </h1>
        <p className="text-muted-foreground font-bold text-sm mt-1">
          Flight Risk Assessment Tool (EHSIT / PAVE) — complete el formulario paso a paso.
        </p>
      </div>

      <FratWizard />
    </div>
  );
}
