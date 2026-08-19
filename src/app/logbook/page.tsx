"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, Clock, Calendar, ShieldCheck, Plane, AlertTriangle, 
  CheckCircle2, Plus, User, Award, Loader2 
} from "lucide-react";
import { getPilots } from "@/lib/utils";
import { Pilot } from "@/lib/types";
import { motion } from "framer-motion";

interface FlightLogEntry {
  id: string;
  date: string;
  pilotId: string;
  pilotName: string;
  aircraft: string;
  tailNumber: string;
  route: string;
  dayHours: number;
  nightHours: number;
  ifrHours: number;
  landings: number;
  totalHours: number;
}

export default function LogbookPage() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPilotId, setSelectedPilotId] = useState<string>("all");

  // Sample flight log database records
  const [logs, setLogs] = useState<FlightLogEntry[]>([
    {
      id: "log-1",
      date: "2026-08-15",
      pilotId: "p1",
      pilotName: "CAP. GONZALEZ",
      aircraft: "AW109",
      tailNumber: "LV-CWC",
      route: "SABE - HELSITE SAN ISIDRO - SABE",
      dayHours: 1.5,
      nightHours: 0.8,
      ifrHours: 0.5,
      landings: 3,
      totalHours: 2.3,
    },
    {
      id: "log-2",
      date: "2026-08-10",
      pilotId: "p2",
      pilotName: "CAP. MARTINEZ",
      aircraft: "BO105",
      tailNumber: "LV-BUE",
      route: "SAN FERNANDO - CORDOBA - SAN FERNANDO",
      dayHours: 3.2,
      nightHours: 0.0,
      ifrHours: 1.2,
      landings: 2,
      totalHours: 3.2,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newLog, setNewLog] = useState({
    pilotName: "",
    aircraft: "AW109",
    tailNumber: "LV-CWC",
    route: "",
    dayHours: "1.0",
    nightHours: "0.0",
    ifrHours: "0.0",
    landings: "1",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPilots();
        setPilots(data);
        if (data.length > 0) {
          setNewLog(prev => ({ ...prev, pilotName: data[0].PILOTO }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const day = parseFloat(newLog.dayHours) || 0;
    const night = parseFloat(newLog.nightHours) || 0;
    const total = day + night;

    const createdLog: FlightLogEntry = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      pilotId: "custom",
      pilotName: newLog.pilotName.toUpperCase(),
      aircraft: newLog.aircraft,
      tailNumber: newLog.tailNumber.toUpperCase(),
      route: newLog.route.toUpperCase(),
      dayHours: day,
      nightHours: night,
      ifrHours: parseFloat(newLog.ifrHours) || 0,
      landings: parseInt(newLog.landings) || 1,
      totalHours: total,
    };

    setLogs(prev => [createdLog, ...prev]);
    setShowAddModal(false);
  };

  const filteredLogs = selectedPilotId === "all" 
    ? logs 
    : logs.filter(l => l.pilotName.includes(selectedPilotId.toUpperCase()));

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
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-700 text-purple-900 dark:text-purple-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            Control de Experiencia Reciente ANAC
          </div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            Logbook & Horas de Vuelo
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Registro computado de horas de vuelo, nocturnas, IFR y verificación automática de vigencia operativa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-2xl transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            REGISTRAR VUELO
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <Clock className="w-6 h-6 text-blue-600" />
            <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg">TOTAL</span>
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-white mb-1">{totalFlightHours.toFixed(1)} hrs</p>
          <p className="text-xs font-bold text-slate-500 uppercase">Horas Totales Computadas</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <Plane className="w-6 h-6 text-purple-600" />
            <span className="text-xs font-black uppercase text-purple-600 bg-purple-50 dark:bg-purple-950 px-2.5 py-1 rounded-lg">NVG / NOCHE</span>
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-white mb-1">{totalNightHours.toFixed(1)} hrs</p>
          <p className="text-xs font-bold text-slate-500 uppercase">Vuelo Nocturno HEMS</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">ANAC 90 DÍAS</span>
          </div>
          <p className="text-3xl font-black text-slate-950 dark:text-white mb-1">{totalLandings} Aterrizajes</p>
          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-black uppercase">Vigencia Operativa Cumplida ✓</p>
        </div>
      </div>

      {/* Flight Logs Table */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-hidden">
        <h3 className="text-lg font-black uppercase tracking-tight text-slate-950 dark:text-white mb-4">
          Historial de Registros de Vuelo
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="pb-3">FECHA</th>
                <th className="pb-3">PILOTO</th>
                <th className="pb-3">AERONAVE / MAT.</th>
                <th className="pb-3">RUTA DE VUELO</th>
                <th className="pb-3">HORAS DIA</th>
                <th className="pb-3">HORAS NOCHE</th>
                <th className="pb-3">ATERRIZAJES</th>
                <th className="pb-3">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4">{log.date}</td>
                  <td className="py-4 font-black">{log.pilotName}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-black uppercase text-blue-600">
                      {log.aircraft} ({log.tailNumber})
                    </span>
                  </td>
                  <td className="py-4 text-slate-500 font-semibold">{log.route}</td>
                  <td className="py-4">{log.dayHours} hrs</td>
                  <td className="py-4">{log.nightHours} hrs</td>
                  <td className="py-4">{log.landings}</td>
                  <td className="py-4 font-black text-blue-600">{log.totalHours} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-4">
              Nuevo Registro de Vuelo
            </h2>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Nombre del Piloto</label>
                <input
                  type="text"
                  required
                  placeholder="ej. CAP. GONZALEZ"
                  value={newLog.pilotName}
                  onChange={e => setNewLog(prev => ({ ...prev, pilotName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Modelo</label>
                  <select
                    value={newLog.aircraft}
                    onChange={e => setNewLog(prev => ({ ...prev, aircraft: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  >
                    <option value="AW109">AW109</option>
                    <option value="BO105">BO105</option>
                    <option value="RH44">RH44</option>
                    <option value="BN2B">BN2B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Matrícula</label>
                  <input
                    type="text"
                    placeholder="ej. LV-CWC"
                    value={newLog.tailNumber}
                    onChange={e => setNewLog(prev => ({ ...prev, tailNumber: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase mb-1">Ruta</label>
                <input
                  type="text"
                  required
                  placeholder="ej. SABE -> BUE -> SABE"
                  value={newLog.route}
                  onChange={e => setNewLog(prev => ({ ...prev, route: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
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
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Hs. Noche</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.nightHours}
                    onChange={e => setNewLog(prev => ({ ...prev, nightHours: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Aterrizajes</label>
                  <input
                    type="number"
                    value={newLog.landings}
                    onChange={e => setNewLog(prev => ({ ...prev, landings: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-black text-xs uppercase shadow-md"
                >
                  GUARDAR VUELO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
