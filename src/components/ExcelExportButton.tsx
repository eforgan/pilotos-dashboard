"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, Check } from "lucide-react";
import { Pilot } from "@/lib/types";
import { getPilotOverallStatus, getPilotAircraft } from "@/lib/utils";

interface ExcelExportButtonProps {
  pilots: Pilot[];
}

export default function ExcelExportButton({ pilots }: ExcelExportButtonProps) {
  const [downloaded, setDownloaded] = useState(false);

  const exportToCSV = () => {
    if (!pilots.length) return;

    // Define CSV Headers
    const headers = [
      "ID",
      "PILOTO",
      "DNI",
      "BASE",
      "EMAIL",
      "TELEFONO",
      "N° LICENCIA",
      "CMA (MEDICO)",
      "CONTROL BIENAL",
      "SIMULADOR",
      "CONTROL IDONEIDAD",
      "CONTROL RUTA",
      "CRM / FFHH",
      "MERCANCIAS PELIGROSAS",
      "MOE",
      "SMS",
      "AERONAVES HABILITADAS",
      "ESTADO NORMATIVO"
    ];

    // Map pilot rows
    const rows = pilots.map((p) => {
      const aircraft = getPilotAircraft(p).join("; ");
      const status = getPilotOverallStatus(p).toUpperCase();

      return [
        `"${p.id || ""}"`,
        `"${(p.PILOTO || "").replace(/"/g, '""')}"`,
        `"${p.DNI || ""}"`,
        `"${p.BASE || ""}"`,
        `"${p.EMAIL || ""}"`,
        `"${p.TELEFONO || ""}"`,
        `"${p.LICENCIA || ""}"`,
        `"${p.CMA || ""}"`,
        `"${p.CONTROL_BIENAL || ""}"`,
        `"${p.SIMULADOR || ""}"`,
        `"${p.CTRL_IDONEIDAD || ""}"`,
        `"${p.CTRL_RUTA || ""}"`,
        `"${p.CRM_FFHH || ""}"`,
        `"${p.MERC_PELIGROSAS || ""}"`,
        `"${p.MOE || ""}"`,
        `"${p.SMS || ""}"`,
        `"${aircraft}"`,
        `"${status}"`
      ].join(",");
    });

    // UTF-8 BOM for Excel compatibility
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split("T")[0];
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Modena_Legajos_Pilotos_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <button
      onClick={exportToCSV}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 shadow-sm ${
        downloaded
          ? "bg-emerald-600 border-emerald-600 text-white"
          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
      title="Exportar sábana completa de pilotos en formato CSV/Excel"
    >
      {downloaded ? <Check className="w-4 h-4 text-white" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
      {downloaded ? "REPORTES EXPORTADOS ✓" : "EXPORTAR EXCEL / CSV"}
    </button>
  );
}
