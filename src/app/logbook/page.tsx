"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen, Clock, ShieldCheck, Plane,
  Plus, Award, Loader2, Filter, Search, FileDown
} from "lucide-react";
import { getPilots, formatDate } from "@/lib/utils";
import { Pilot } from "@/lib/types";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface FlightLogEntry {
  id: string;
  date: string;
  pilotId: string | null;
  pilotName: string;
  aircraft: string;
  tailNumber: string;
  route: string | null;
  dayHours: number;
  nightHours: number;
  ifrHours: number;
  landings: number;
  totalHours: number;
}

// IDs used by the old localStorage demo seed data — never real flight records,
// so they're excluded when offering to import a pilot's local backup into the DB.
const LEGACY_DEMO_LOG_IDS = new Set(
  Array.from({ length: 9 }, (_, i) => `log-10${i + 1}`)
);

const LOCAL_STORAGE_KEY = "modena_flight_logs";

export default function LogbookPage() {
  const { data: session } = useSession();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPilot, setSelectedPilot] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Flight log database records
  const [logs, setLogs] = useState<FlightLogEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Legacy local-only records detected in this browser, pending import into Postgres
  const [importableLocalLogs, setImportableLocalLogs] = useState<FlightLogEntry[]>([]);
  const [importing, setImporting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLog, setNewLog] = useState({
    pilotName: "",
    aircraft: "AW109",
    tailNumber: "LV-CWC",
    route: "",
    dayHours: "1.5",
    nightHours: "0.5",
    ifrHours: "0.5",
    landings: "2",
  });

  async function loadLogs() {
    try {
      const res = await fetch("/api/logbook", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load logbook");
      const data: FlightLogEntry[] = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error al cargar el logbook:", err);
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedPilots = await getPilots();
        setPilots(fetchedPilots);

        await loadLogs();

        // Detect legacy entries saved in this browser's localStorage (pre-DB
        // persistence) and offer to import the real ones into Postgres.
        try {
          const storedLogs = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (storedLogs) {
            const parsed: FlightLogEntry[] = JSON.parse(storedLogs);
            const realLocalLogs = parsed.filter(l => !LEGACY_DEMO_LOG_IDS.has(l.id));
            setImportableLocalLogs(realLocalLogs);
          }
        } catch {
          // Malformed/legacy local data — ignore, nothing to import.
        }

        // Set default pilot for new log
        if (fetchedPilots.length > 0) {
          setNewLog(prev => ({ ...prev, pilotName: fetchedPilots[0].PILOTO }));
        }

        // If user is a logged-in pilot (non-admin), select their own pilot name by default
        if (session?.user) {
          const user = session.user as { role?: string; pilotId?: string | null };
          if (user.role !== "ADMIN" && user.pilotId) {
            const matchedPilot = fetchedPilots.find(p => p.id === user.pilotId);
            if (matchedPilot) {
              setSelectedPilot(matchedPilot.PILOTO);
              setNewLog(prev => ({ ...prev, pilotName: matchedPilot.PILOTO }));
            }
          }
        }
      } catch (err) {
        console.error("Error al cargar pilotos:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);

    const matchedPilot = pilots.find(p => p.PILOTO === newLog.pilotName);

    try {
      const res = await fetch("/api/logbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pilotId: matchedPilot?.id ?? null,
          pilotName: newLog.pilotName.toUpperCase(),
          date: new Date().toISOString(),
          aircraft: newLog.aircraft,
          tailNumber: newLog.tailNumber.toUpperCase(),
          route: newLog.route.toUpperCase(),
          dayHours: newLog.dayHours,
          nightHours: newLog.nightHours,
          ifrHours: newLog.ifrHours,
          landings: newLog.landings,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "No se pudo registrar el vuelo");
      }

      await loadLogs();
      setShowAddModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo registrar el vuelo");
    } finally {
      setSaving(false);
    }
  };

  const handleImportLocalLogs = async () => {
    setImporting(true);
    try {
      for (const log of importableLocalLogs) {
        const matchedPilot = pilots.find(p => p.PILOTO === log.pilotName);
        await fetch("/api/logbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pilotId: matchedPilot?.id ?? null,
            pilotName: log.pilotName,
            date: log.date,
            aircraft: log.aircraft,
            tailNumber: log.tailNumber,
            route: log.route,
            dayHours: log.dayHours,
            nightHours: log.nightHours,
            ifrHours: log.ifrHours,
            landings: log.landings,
          }),
        });
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setImportableLocalLogs([]);
      await loadLogs();
    } catch (err) {
      console.error("Error al importar registros locales:", err);
    } finally {
      setImporting(false);
    }
  };

  const dismissImportBanner = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setImportableLocalLogs([]);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesPilot = selectedPilot === "all" || l.pilotName.toLowerCase().includes(selectedPilot.toLowerCase());
      const matchesSearch = searchQuery === "" || 
        l.pilotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.aircraft.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.route ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.tailNumber.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPilot && matchesSearch;
    });
  }, [logs, selectedPilot, searchQuery]);

  const totalFlightHours = filteredLogs.reduce((acc, l) => acc + l.totalHours, 0);
  const totalNightHours = filteredLogs.reduce((acc, l) => acc + l.nightHours, 0);
  const totalLandings = filteredLogs.reduce((acc, l) => acc + l.landings, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Cargando Registro de Horas de Vuelo...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-black rounded-full uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Flota Oficial Modena Air Service ({pilots.length} Pilotos Registrados)
          </div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            Logbook & Horas de Vuelo
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Cómputo oficial de horas de vuelo por piloto, horas nocturnas HEMS, IFR y experiencia reciente ANAC.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/logbook/pdf${selectedPilot !== "all" ? `?pilotId=${pilots.find(p => p.PILOTO === selectedPilot)?.id ?? ""}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-xs uppercase rounded-2xl transition-all"
          >
            <FileDown className="w-4 h-4 text-blue-600" />
            EXPORTAR PDF
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-2xl transition-all shadow-xl shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            REGISTRAR NUEVO VUELO
          </button>
        </div>
      </div>

      {/* Legacy local-storage import banner */}
      {importableLocalLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-5 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 rounded-2xl">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase">
            Se encontraron {importableLocalLogs.length} registro{importableLocalLogs.length === 1 ? "" : "s"} de vuelo guardados solo en este navegador (versión anterior). ¿Importarlos a la base de datos para que no se pierdan?
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={dismissImportBanner}
              disabled={importing}
              className="px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold text-xs uppercase disabled:opacity-50"
            >
              Descartar
            </button>
            <button
              onClick={handleImportLocalLogs}
              disabled={importing}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase disabled:opacity-50"
            >
              {importing ? "Importando..." : "Importar ahora"}
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por piloto, matrícula, aeronave o ruta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11 h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-xs">
          <Filter className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-black uppercase text-slate-400 shrink-0">Piloto:</span>
          <select
            value={selectedPilot}
            onChange={(e) => setSelectedPilot(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-slate-950 dark:text-white outline-none min-w-[200px]"
          >
            <option value="all" className="font-bold text-slate-900">Todos los Pilotos de la Empresa ({pilots.length})</option>
            {pilots.map(p => (
              <option key={p.id} value={p.PILOTO} className="font-bold text-slate-900">
                {p.PILOTO} ({p.BASE || "Sin Base"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs"
        >
          <div className="flex justify-between items-start mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">TOTAL COMPUTADO</span>
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-white mb-1">{totalFlightHours.toFixed(1)} hrs</p>
          <p className="text-xs font-bold text-slate-500 uppercase">Horas Totales Registradas</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs"
        >
          <div className="flex justify-between items-start mb-2">
            <Plane className="w-6 h-6 text-purple-600" />
            <span className="text-xs font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-lg">NVG / NOCHE</span>
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-white mb-1">{totalNightHours.toFixed(1)} hrs</p>
          <p className="text-xs font-bold text-slate-500 uppercase">Vuelo Nocturno HEMS</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs"
        >
          <div className="flex justify-between items-start mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">RECIENTE ANAC</span>
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-white mb-1">{totalLandings} Aterrizajes</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-black uppercase">Experiencia Reciente Vigente ✓</p>
        </motion.div>
      </div>

      {/* Flight Logs Table */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Historial de Registros de Vuelo Modena Air Service
          </h3>
          <span className="text-xs font-bold text-slate-500 uppercase">{filteredLogs.length} Registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="pb-3">FECHA</th>
                <th className="pb-3">PILOTO</th>
                <th className="pb-3">AERONAVE / MAT.</th>
                <th className="pb-3">RUTA DE VUELO</th>
                <th className="pb-3">HORAS DÍA</th>
                <th className="pb-3">HORAS NOCHE</th>
                <th className="pb-3">ATERRIZAJES</th>
                <th className="pb-3">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 text-slate-600 dark:text-slate-400 font-mono">{formatDate(log.date)}</td>
                    <td className="py-4 font-black uppercase text-slate-950 dark:text-white">{log.pilotName}</td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] font-black uppercase text-blue-600 dark:text-blue-400">
                        {log.aircraft} ({log.tailNumber})
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 font-semibold uppercase">{log.route}</td>
                    <td className="py-4">{log.dayHours.toFixed(1)} hs</td>
                    <td className="py-4 text-purple-600 font-black">{log.nightHours.toFixed(1)} hs</td>
                    <td className="py-4">{log.landings}</td>
                    <td className="py-4 font-black text-blue-600">{log.totalHours.toFixed(1)} hs</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                    No se encontraron registros de vuelo para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl"
          >
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-1">
              Registrar Vuelo de Flota
            </h2>
            <p className="text-xs font-bold text-slate-500 mb-6 uppercase">
              Seleccione el piloto de la nómina oficial e ingrese los datos computados.
            </p>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                  Piloto de la Empresa *
                </label>
                <select
                  required
                  value={newLog.pilotName}
                  onChange={e => setNewLog(prev => ({ ...prev, pilotName: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-black text-slate-950 dark:text-white outline-none focus:border-blue-600"
                >
                  {pilots.map(p => (
                    <option key={p.id} value={p.PILOTO}>
                      {p.PILOTO} ({p.BASE || "Sin Base"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Aeronave</label>
                  <select
                    value={newLog.aircraft}
                    onChange={e => {
                      const val = e.target.value;
                      let defaultTail = "LV-FKS";
                      if (val === "BO105") defaultTail = "LV-CSM";
                      if (val === "AW109SP") defaultTail = "LV-WLO";
                      if (val === "AW109E") defaultTail = "LV-KCR";
                      if (val === "AW109C") defaultTail = "LV-WAE";
                      if (val === "RH44") defaultTail = "LV-CCV";
                      if (val === "BN2N") defaultTail = "LV-WFR";
                      setNewLog(prev => ({ ...prev, aircraft: val, tailNumber: defaultTail }));
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  >
                    <option value="BO105">BO105 (LV-CSM, LV-GID, LV-FKS, LV-GIE)</option>
                    <option value="AW109SP">AW109SP (LV-WLO, LV-WLP)</option>
                    <option value="AW109E">AW109E (LV-KCR, LV-KNS)</option>
                    <option value="AW109C">AW109C (LV-WAE)</option>
                    <option value="RH44">RH44 (LV-CCV)</option>
                    <option value="BN2N">BN2N (LV-WFR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Matrícula</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. LV-CWC"
                    value={newLog.tailNumber}
                    onChange={e => setNewLog(prev => ({ ...prev, tailNumber: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Ruta de Vuelo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. SABE -> BASE NÚÑEZ -> SABE"
                  value={newLog.route}
                  onChange={e => setNewLog(prev => ({ ...prev, route: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Hs. Día</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.dayHours}
                    onChange={e => setNewLog(prev => ({ ...prev, dayHours: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Hs. Noche (HEMS)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.nightHours}
                    onChange={e => setNewLog(prev => ({ ...prev, nightHours: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Aterrizajes</label>
                  <input
                    type="number"
                    value={newLog.landings}
                    onChange={e => setNewLog(prev => ({ ...prev, landings: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                  {formError}
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={saving}
                  className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs disabled:opacity-50"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase shadow-lg shadow-blue-500/30 disabled:opacity-50"
                >
                  {saving ? "GUARDANDO..." : "GUARDAR VUELO"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
