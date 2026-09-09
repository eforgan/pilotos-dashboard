"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { ArrowLeft, Download, Loader2, Printer, AlertTriangle } from "lucide-react";
import { FratPrintable, FratFormData } from "@/components/frat/FratPrintable";
import { RISK_LEVEL_INFO, computeFratScore, getFratSheet } from "@/lib/frat-data";

const BADGE_CLASS: Record<string, string> = {
  ACCEPTABLE: "bg-emerald-500 text-white",
  CAUTION: "bg-amber-500 text-white",
  HIGH_RISK: "bg-red-600 text-white",
};

export default function FratDetailPage() {
  const { id } = useParams();
  const reportRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: reportRef });

  const [form, setForm] = useState<FratFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/frat/${id}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "No se pudo cargar el FRAT");
        setForm(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 text-center">
        <AlertTriangle className="w-16 h-16 text-orange-500 mb-4" />
        <h1 className="text-2xl font-bold">{error || "FRAT no encontrado"}</h1>
        <Link href="/frat" className="btn-primary mt-6">
          Volver al histórico
        </Link>
      </div>
    );
  }

  const sheet = getFratSheet(form.type);
  const score = computeFratScore(sheet, form.responses);
  const info = RISK_LEVEL_INFO[score.finalLevel];

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto pb-20 mt-16 md:mt-0">
      <Link
        href="/frat"
        className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        VOLVER AL HISTÓRICO
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            {sheet.title} — {form.picName}
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            {new Date(form.flightDate).toLocaleDateString("es-AR")} · {form.base || "Sin base"} · {form.aircraft || "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-2xl font-black text-sm uppercase ${BADGE_CLASS[score.finalLevel]}`}>
            {score.finalScore}/{score.max} — {info.label}
          </span>
          <a
            href={`/api/frat/${id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
            title="Descargar PDF"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={() => handlePrint()}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
            title="Imprimir"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        {sheet.sections.map((sec) => (
          <div key={sec.id}>
            <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
              {sec.title}
            </h3>
            <div className="space-y-2">
              {sec.items.map((item) => {
                const r = form.responses[item.id];
                const chosen = r ? item.options.find((o) => o.score === r.final) : undefined;
                return (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 w-1/3">{item.label}</span>
                    <span className="flex-1 text-slate-500">{chosen?.label || "Sin responder"}</span>
                    {r?.mitigation && <span className="text-[11px] text-blue-600 dark:text-blue-400 w-1/4">{r.mitigation}</span>}
                    <span
                      className={`shrink-0 font-black w-10 text-center ${
                        !r ? "text-slate-300" : r.final === 2 ? "text-red-600" : r.final === 1 ? "text-amber-600" : "text-emerald-600"
                      }`}
                    >
                      {r ? r.final : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {form.generalNotes && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-black uppercase text-slate-400 mb-1">Observaciones generales</p>
            <p className="text-sm font-semibold">{form.generalNotes}</p>
          </div>
        )}
        {form.decision && (
          <div>
            <p className="text-[11px] font-black uppercase text-slate-400 mb-1">Decisión / Autorización</p>
            <p className="text-sm font-semibold">{form.decision}</p>
          </div>
        )}
        {form.picSignature && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] font-black uppercase text-slate-400 mb-2">Firma Digital del Comandante / Evaluador</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.picSignature} alt="Firma registrada" className="h-16 object-contain bg-white p-2 rounded-xl border border-slate-200" />
          </div>
        )}
      </div>

      <div className="hidden">
        <FratPrintable ref={reportRef} form={form} />
      </div>
    </div>
  );
}
