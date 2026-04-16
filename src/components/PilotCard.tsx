"use client";

import React from "react";
import { Pilot } from "@/lib/types";
import { getPilotOverallStatus, getAlertConfig, getPilotExpirations, formatDate } from "@/lib/utils";
import { User, MapPin, Phone, GraduationCap, ChevronRight, AlertCircle, Calendar } from "lucide-react";
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="card-premium h-full flex flex-col overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
              <User className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{pilot.PILOTO}</h3>
              <p className="text-xs text-muted-foreground font-medium">DNI: {pilot.DNI}</p>
            </div>
          </div>
          <div 
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}
          >
            {statusConfig.label}
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 opacity-70" />
            <span>Base: <span className="font-semibold text-slate-900 dark:text-slate-200">{pilot.BASE || "—"}</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <GraduationCap className="w-4 h-4 opacity-70" />
            <span>Licencia: <span className="font-medium text-slate-900 dark:text-slate-200">{pilot.LICENCIA}</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Phone className="w-4 h-4 opacity-70" />
            <span>{pilot.TELEFONO || "Sin teléfono"}</span>
          </div>
        </div>

        {expirations.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest border-b border-slate-100 dark:border-slate-800 pb-1 mb-2">Resumen de Alertas</p>
            <div className="flex flex-wrap gap-2">
              {criticalCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-xs font-bold">
                  <AlertCircle className="w-3 h-3" />
                  {criticalCount} Críticas
                </div>
              )}
              {warningCount > 0 && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg text-orange-600 dark:text-orange-400 text-xs font-bold">
                  <Calendar className="w-3 h-3" />
                  {warningCount} Avisos
                </div>
              )}
              {criticalCount === 0 && warningCount === 0 && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Todo al día</span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30">
        <Link 
          href={`/pilot/${pilot.id}`}
          className="flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
        >
          Gestionar Perfil
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default PilotCard;
