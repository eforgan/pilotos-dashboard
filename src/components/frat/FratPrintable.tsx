"use client";

import React from "react";
import { FratResponses, FratType, RISK_LEVEL_INFO, allItems, computeFratScore, getFratSheet } from "@/lib/frat-data";

export interface FratFormData {
  id: string;
  type: FratType;
  flightDate: string | Date;
  base?: string | null;
  aircraft?: string | null;
  picName: string;
  sicName?: string | null;
  route?: string | null;
  etd?: string | null;
  missionType?: string | null;
  responses: FratResponses;
  generalNotes?: string | null;
  decision?: string | null;
  createdAt: string | Date;
  pilot?: { PILOTO: string } | null;
}

interface FratPrintableProps {
  form: FratFormData;
}

const RISK_BADGE_BG: Record<string, string> = {
  ACCEPTABLE: "bg-emerald-600",
  CAUTION: "bg-amber-600",
  HIGH_RISK: "bg-red-600",
};

export const FratPrintable = React.forwardRef<HTMLDivElement, FratPrintableProps>(({ form }, ref) => {
  const sheet = getFratSheet(form.type);
  const score = computeFratScore(sheet, form.responses);
  const info = RISK_LEVEL_INFO[score.finalLevel];
  const items = allItems(sheet);

  return (
    <div
      ref={ref}
      className="p-12 bg-white text-slate-900 font-sans min-h-[297mm] w-[210mm] border border-slate-200 shadow-sm print:shadow-none print:border-none mx-auto"
    >
      <div className="flex justify-between items-start border-b-4 border-blue-600 pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">MODENA AIR SERVICE OFFSHORE</h1>
          <p className="text-xs font-bold text-slate-500">Dirección de Operaciones — Seguridad Operacional (SMS)</p>
          <p className="text-sm font-black text-blue-600 uppercase tracking-widest mt-2">{sheet.title}</p>
        </div>
        <div className="text-right">
          <div
            className={`inline-block px-4 py-2 rounded-xl font-black text-lg text-white ${
              RISK_BADGE_BG[score.finalLevel]
            }`}
          >
            {score.finalScore}/{score.max} — {info.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6 text-xs">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">Fecha</p>
          <p className="font-bold">{new Date(form.flightDate).toLocaleDateString("es-AR")}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">Base</p>
          <p className="font-bold">{form.base || "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">Aeronave</p>
          <p className="font-bold">{form.aircraft || "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">Misión</p>
          <p className="font-bold">{form.missionType || "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">
            {form.type === "TRAINING"
              ? "Instructor / Inspector"
              : form.missionType === "HEMS"
              ? "Piloto HEMS"
              : "Comandante (PIC)"}
          </p>
          <p className="font-bold">{form.picName}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">
            {form.type === "TRAINING"
              ? "Piloto en Instrucción"
              : form.missionType === "HEMS"
              ? "Técnico Operativo (TFO) / Copiloto"
              : "Copiloto / TFO"}
          </p>
          <p className="font-bold">{form.sicName || "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">Ruta</p>
          <p className="font-bold">{form.route || "N/A"}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">ETD</p>
          <p className="font-bold">{form.etd || "N/A"}</p>
        </div>
      </div>

      {sheet.sections.map((sec) => (
        <div key={sec.id} className="mb-4">
          <h3 className="bg-slate-900 text-white text-xs font-black uppercase px-2 py-1 rounded mb-1">
            {sec.title} {sec.kind === "static" ? "(Estático)" : "(Dinámico)"}
          </h3>
          <table className="w-full text-[10px]">
            <tbody>
              {sec.items.map((item) => {
                const r = form.responses[item.id];
                const chosen = r ? item.options.find((o) => o.score === r.final) : undefined;
                return (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="py-1 pr-2 font-bold w-1/4 align-top">{item.label}</td>
                    <td className="py-1 pr-2 align-top">{chosen?.label || "Sin responder"}</td>
                    <td className="py-1 pr-2 align-top font-black w-8 text-center">{r ? r.final : "-"}</td>
                    <td className="py-1 align-top text-slate-500 w-1/4">{r?.mitigation || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      <div className="flex justify-between text-xs font-bold border border-slate-200 rounded-xl p-3 mt-4">
        <span>
          Puntaje inicial: {score.initialScore}/{score.max}
        </span>
        <span>
          Puntaje final: {score.finalScore}/{score.max}
        </span>
        <span>
          Preguntas: {score.answered}/{items.length}
        </span>
      </div>

      {form.generalNotes && (
        <div className="mt-4 text-xs">
          <p className="font-black uppercase text-slate-500">Observaciones generales</p>
          <p>{form.generalNotes}</p>
        </div>
      )}

      {form.decision && (
        <div className="mt-3 text-xs">
          <p className="font-black uppercase text-slate-500">Decisión / Autorización</p>
          <p>{form.decision}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 mt-10 text-center text-xs">
        <div className="border-t border-slate-400 pt-2">{form.picName}</div>
        <div className="border-t border-slate-400 pt-2">Dirección de Operaciones / SMS</div>
      </div>
    </div>
  );
});

FratPrintable.displayName = "FratPrintable";
