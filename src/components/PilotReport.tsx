"use client";

import React from "react";
import { Pilot } from "@/lib/types";
import { formatDate, getPilotExpirations } from "@/lib/utils";
import { Shield, Plane, Calendar, User, MapPin, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PilotReportProps {
  pilot: Pilot;
}

export const PilotReport = React.forwardRef<HTMLDivElement, PilotReportProps>(
  ({ pilot }, ref) => {
    const expirations = getPilotExpirations(pilot);

    return (
      <div ref={ref} className="p-16 bg-white text-slate-900 font-sans min-h-[297mm] w-[210mm] border border-slate-200 shadow-sm print:shadow-none print:border-none mx-auto">
        {/* Report Header */}
        <div className="flex justify-between items-start border-b-4 border-blue-600 pb-10 mb-10">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">{pilot.PILOTO}</h1>
            <p className="text-xl font-bold text-blue-600 tracking-widest uppercase">Legajo Técnico de Tripulación</p>
          </div>
          {pilot.imageUrl && (
            <img 
                src={pilot.imageUrl} 
                alt="Profile" 
                className="w-32 h-32 rounded-2xl object-cover border-4 border-slate-50"
            />
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Información Personal</h2>
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">DNI / Documento</p>
                        <p className="font-bold text-lg">{pilot.DNI || "N/A"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Base de Operaciones</p>
                        <p className="font-bold text-lg">{pilot.BASE || "No asignada"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Plane className="w-5 h-5 text-blue-500" />
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Licencia Principal</p>
                        <p className="font-bold text-lg">{pilot.LICENCIA || "No registrada"}</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Estado de Cumplimiento</h2>
            <div className="bg-slate-50 p-6 rounded-3xl">
                <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Alertas Críticas</p>
                        <p className={`text-4xl font-black ${expirations.filter(e => e.level === 'critical').length > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                            {expirations.filter(e => e.level === 'critical').length}
                        </p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Vencimientos</p>
                        <p className={`text-4xl font-black ${expirations.filter(e => e.level === 'warning').length > 0 ? 'text-orange-500' : 'text-slate-300'}`}>
                            {expirations.filter(e => e.level === 'warning').length}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Certifications Table */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2">Registro de Habilitaciones y Cursos</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left border-b-2 border-slate-200">
                <th className="py-4 text-xs font-black uppercase text-slate-500">Certificación / Habilidad</th>
                <th className="py-4 text-xs font-black uppercase text-slate-500">Fecha Vencimiento</th>
                <th className="py-4 text-xs font-black uppercase text-slate-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {expirations.map((exp, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="py-4 font-bold text-slate-800">{exp.label}</td>
                  <td className="py-4 font-bold font-mono">{exp.date}</td>
                  <td className="py-4">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-tighter ${
                        exp.level === 'critical' ? 'bg-red-100 text-red-600' :
                        exp.level === 'warning' ? 'bg-orange-100 text-orange-600' :
                        exp.level === 'ok' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                        {exp.level === 'critical' ? 'Vencido / Crítico' : 
                         exp.level === 'warning' ? 'Vencimiento Próximo' : 
                         exp.level === 'ok' ? 'Vigente' : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-20 flex justify-between items-end border-t border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Sistema de Gestión de Pilotos</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Generado el {format(new Date(), "PPpp", { locale: es })}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">Firma Digital Autenticada</p>
            <div className="w-48 h-12 bg-slate-50 border-b-2 border-slate-200" />
          </div>
        </div>
      </div>
    );
  }
);

PilotReport.displayName = "PilotReport";
