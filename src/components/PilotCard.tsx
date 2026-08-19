"use client";

import React from "react";
import { Pilot } from "@/lib/types";
import { getPilotOverallStatus, getAlertConfig, getPilotExpirations, getPilotAircraft } from "@/lib/utils";
import { User, MapPin, Phone, Mail, GraduationCap, ChevronRight, AlertCircle, Calendar, CheckCircle2, Plane } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PilotCardProps {
  pilot: Pilot;
}

const PilotCard = ({ pilot }: PilotCardProps) => {
  const status = getPilotOverallStatus(pilot);
  const statusConfig = getAlertConfig(status);
  const expirations = getPilotExpirations(pilot);
  const criticalCount = expirations.filter(e => e.level === "critical").length;
  const warningCount = expirations.filter(e => e.level === "warning").length;
  const activeAircraft = getPilotAircraft(pilot);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="card-premium h-full flex flex-col overflow-hidden"
    >
      <div className="p-6">
        {/* Card Header: Pilot Icon + Name & Status Badge */}
        <div className="flex justify-between items-start mb-5 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center border-2 border-blue-800 shrink-0 shadow-md">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-black text-card-primary text-lg leading-tight tracking-tight">{pilot.PILOTO}</h3>
              <p className="text-xs text-card-secondary font-black tracking-wide mt-0.5">DNI: {pilot.DNI || "—"}</p>
            </div>
          </div>
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shrink-0 shadow-xs"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1.5px solid ${statusConfig.border}` }}
          >
            {statusConfig.label}
          </div>
        </div>

        {/* Pilot Detail Rows */}
        <div className="card-inner-box space-y-3 mb-6 p-4 rounded-2xl">
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-card-secondary">Base: <span className="font-black text-card-primary">{pilot.BASE || "—"}</span></span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-card-secondary">Licencia: <span className="font-black text-card-primary">{pilot.LICENCIA || "—"}</span></span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-card-secondary shrink-0">Habilitado:</span>
            <div className="flex flex-wrap gap-1 items-center">
              {activeAircraft.length > 0 ? (
                activeAircraft.map((model) => (
                  <span key={model} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-black rounded-md">
                    {model}
                  </span>
                ))
              ) : (
                <span className="font-extrabold text-card-secondary text-xs opacity-75">Sin asignar</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-card-primary">{pilot.TELEFONO || "Sin teléfono registrado"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-bold text-card-primary truncate">{pilot.EMAIL || "Sin email registrado"}</span>
          </div>
        </div>

        {/* Alert Summary Section */}
        {expirations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-black uppercase text-card-primary tracking-wider border-b-2 border-slate-200 dark:border-slate-700 pb-1.5 mb-2">
              Resumen de Alertas
            </p>
            <div className="flex flex-wrap gap-2">
              {criticalCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-950 border-2 border-red-300 dark:border-red-800 rounded-lg text-red-950 dark:text-red-200 text-xs font-black shadow-xs">
                  <AlertCircle className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                  {criticalCount} {criticalCount === 1 ? "Crítica" : "Críticas"}
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-800 rounded-lg text-amber-950 dark:text-amber-200 text-xs font-black shadow-xs">
                  <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  {warningCount} {warningCount === 1 ? "Aviso" : "Avisos"}
                </div>
              )}
              {criticalCount === 0 && warningCount === 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-950 dark:text-emerald-200 text-xs font-black shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  Certificados al Día
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Action Link */}
      <div className="card-footer-box mt-auto p-4">
        <Link 
          href={`/pilot/${pilot.id}`}
          className="flex items-center justify-between text-sm font-black text-card-primary hover:text-blue-600 transition-colors group"
        >
          Gestionar Legajo Digital
          <ChevronRight className="w-4 h-4 text-card-primary group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default PilotCard;
