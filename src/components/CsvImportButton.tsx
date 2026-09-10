"use client";

import React, { useRef, useState } from "react";
import { Upload, Loader2, X, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PILOT_IMPORT_COLUMNS } from "@/lib/pilot-import-schema";

interface ImportResult {
  created: number;
  updated: number;
  errorCount: number;
  errors: { row: number; dni?: string; error: string }[];
  unknownColumns: string[];
}

interface CsvImportButtonProps {
  onImported?: () => void;
}

export default function CsvImportButton({ onImported }: CsvImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = () => {
    const csvContent = "﻿" + PILOT_IMPORT_COLUMNS.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plantilla_importacion_pilotos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/pilots/import", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Error al importar el archivo");
      } else {
        setResult(body);
        onImported?.();
      }
    } catch {
      setError("Error de conexión al importar el archivo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border-2 shadow-sm bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        title="Importar pilotos desde un archivo CSV"
      >
        <Upload className="w-4 h-4 text-blue-600" />
        IMPORTAR CSV
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white mb-1 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-600" />
                Importar Pilotos desde CSV
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6">
                Se identifica cada fila por DNI: si ya existe un piloto con ese DNI se actualiza, si no, se crea uno nuevo.
              </p>

              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 w-full justify-center px-4 py-3 mb-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 text-xs font-black uppercase transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar plantilla CSV
              </button>

              <label className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:border-blue-500 transition-all">
                {uploading ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <Upload className="w-6 h-6 text-slate-400" />
                )}
                <span className="text-xs font-black uppercase text-slate-500">
                  {uploading ? "Importando..." : "Hacé clic para elegir un archivo .csv"}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  disabled={uploading}
                  onChange={handleFileSelected}
                />
              </label>

              {error && (
                <p className="mt-4 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {result && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-black uppercase">
                      {result.created} creados · {result.updated} actualizados
                    </span>
                  </div>

                  {result.unknownColumns.length > 0 && (
                    <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-[11px] font-bold">
                        Columnas no reconocidas (ignoradas): {result.unknownColumns.join(", ")}
                      </span>
                    </div>
                  )}

                  {result.errorCount > 0 && (
                    <div className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3 space-y-1 max-h-40 overflow-y-auto">
                      <p className="font-black uppercase">{result.errorCount} fila(s) con error:</p>
                      {result.errors.map((e, i) => (
                        <p key={i}>Fila {e.row} (DNI {e.dni || "—"}): {e.error}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
