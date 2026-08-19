"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  getPilots, 
  getSummary, 
  searchPilots, 
  filterByBase, 
  filterByStatus,
  filterByAircraft
} from "@/lib/utils";
import PilotCard from "@/components/PilotCard";
import PilotMetrics from "@/components/PilotMetrics";
import { 
  Search, Filter, ArrowUpDown, LogOut, 
  ShieldCheck, ShieldAlert, LayoutGrid, Calendar as CalendarIcon, Plane
} from "lucide-react";
import { Pilot } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import CalendarView from "@/components/CalendarView";
import ExcelExportButton from "@/components/ExcelExportButton";
import BaseCoverageMatrix from "@/components/BaseCoverageMatrix";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [baseFilter, setBaseFilter] = useState("all");
  const [statusFilter] = useState<"all" | "critical" | "warning" | "caution" | "ok" | "na">("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

  const [aircraftFilter, setAircraftFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPilots();
        setPilots(data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const summary = useMemo(() => {
    if (!pilots.length) return null;
    return getSummary(pilots);
  }, [pilots]);

  const availableBases = useMemo(() => {
    const bases = new Set(pilots.map(p => p.BASE).filter(Boolean));
    return Array.from(bases).sort();
  }, [pilots]);

  const filteredPilots = useMemo(() => {
    let result = searchPilots(pilots, searchQuery);
    result = filterByBase(result, baseFilter);
    result = filterByStatus(result, statusFilter);
    result = filterByAircraft(result, aircraftFilter);
    
    // Sort
    return result.sort((a, b) => {
      if (sortBy === "name") return a.PILOTO.localeCompare(b.PILOTO);
      if (sortBy === "base") return (a.BASE || "").localeCompare(b.BASE || "");
      return 0;
    });
  }, [pilots, searchQuery, baseFilter, statusFilter, aircraftFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-black text-slate-800 dark:text-slate-200 animate-pulse uppercase tracking-widest">Cargando Sistema de Flota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      {/* User Status Bar */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-4">
        <ExcelExportButton pilots={pilots} />
        {session?.user?.role === "ADMIN" && (
            <Link href="/admin/invites" className="flex items-center gap-2 text-xs font-black text-blue-900 dark:text-blue-200 border-2 border-blue-300 bg-blue-100 dark:bg-blue-950 px-4 py-2.5 rounded-2xl hover:bg-blue-200 transition-colors uppercase shadow-xs">
                <ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                Panel de Administración
            </Link>
        )}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-2xl shadow-xs">
            <p className="text-xs font-black text-slate-800 dark:text-slate-200">Usuario: <span className="text-slate-950 dark:text-white font-extrabold">{session?.user?.name || session?.user?.email}</span></p>
            <button 
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-slate-700 hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Cerrar Sesión"
            >
                <LogOut className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight mb-2 font-outfit uppercase">Panel de Control de Tripulación</h1>
          <p className="text-slate-800 dark:text-slate-200 text-base font-semibold">Gestión integral de la tripulación y seguimiento de vencimientos normativos ANAC.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 px-5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider">Total Pilotos: <span className="text-blue-700 dark:text-blue-400 font-black text-lg">{pilots.length}</span></p>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      {summary && <PilotMetrics summary={summary} />}

      {/* Tactical Base Coverage Matrix */}
      <BaseCoverageMatrix pilots={pilots} />

      {/* Global Alert Banner */}
      {summary && summary.criticalAlerts > 0 && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-1.5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 shadow-xl"
        >
            <div className="bg-white dark:bg-slate-900 px-8 py-6 rounded-[1.4rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-700 shrink-0 border border-red-300">
                        <ShieldAlert className="w-9 h-9 text-red-700" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white">Atención Inmediata Requerida</h3>
                        <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">Hay <span className="text-red-700 dark:text-red-400 font-black text-base">{summary.criticalAlerts} certificados en estado crítico</span> que requieren renovación anticipada.</p>
                    </div>
                </div>
                <Link href="/alerts" className="btn-primary bg-red-700 hover:bg-red-800 text-white font-black border-none px-8 py-4 shadow-lg whitespace-nowrap text-sm">
                    REVISAR ALERTAS
                </Link>
            </div>
        </motion.div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700 dark:text-slate-300 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por nombre de piloto, DNI, base o tipo de licencia..."
            className="input-field pl-12 h-14 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-sm transition-all text-base text-slate-950 font-bold placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-1 rounded-2xl shadow-sm">
            <button 
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-slate-950 text-white shadow-md font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                title="Vista en Tarjetas"
            >
                <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setViewMode("calendar")}
                className={`p-3 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-slate-950 text-white shadow-md font-bold' : 'text-slate-700 hover:bg-slate-100'}`}
                title="Vista Calendario de Vencimientos"
            >
                <CalendarIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-2.5 rounded-xl shadow-sm">
            <Filter className="w-4 h-4 text-slate-800 dark:text-slate-200 ml-2" />
            <select 
              value={baseFilter}
              onChange={(e) => setBaseFilter(e.target.value)}
              className="bg-transparent text-sm font-extrabold text-slate-950 dark:text-white outline-none pr-4 min-w-[140px]"
            >
              <option value="all" className="font-bold text-slate-900">Todas las Bases</option>
              {availableBases.map(base => (
                <option key={base} value={base} className="font-bold text-slate-900">{base}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-2.5 rounded-xl shadow-sm">
            <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-2" />
            <select 
              value={aircraftFilter}
              onChange={(e) => setAircraftFilter(e.target.value)}
              className="bg-transparent text-sm font-extrabold text-slate-950 dark:text-white outline-none pr-4 min-w-[160px]"
            >
              <option value="all" className="font-bold text-slate-900">Todas las Aeronaves</option>
              <option value="AW109" className="font-bold text-slate-900">AW109</option>
              <option value="BO105" className="font-bold text-slate-900">BO105</option>
              <option value="RH44" className="font-bold text-slate-900">RH44</option>
              <option value="BN2B" className="font-bold text-slate-900">BN2B</option>
            </select>
          </div>

          <button 
            onClick={() => setSortBy(sortBy === "name" ? "base" : "name")}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-3.5 rounded-xl shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-950 dark:text-white font-extrabold text-sm"
          >
            <ArrowUpDown className="w-4 h-4 text-slate-800 dark:text-slate-200" />
            <span>{sortBy === "name" ? "Ordenar: Nombre" : "Ordenar: Base"}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {filteredPilots.length > 0 ? (
              filteredPilots.map((pilot) => (
                <PilotCard key={pilot.id} pilot={pilot} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-300">
                  <Search className="w-10 h-10 text-slate-600 dark:text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white">No se encontraron pilotos</h3>
                <p className="text-slate-700 dark:text-slate-300 font-bold mt-1">Intenta modificar la búsqueda o los filtros de base.</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="calendar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CalendarView pilots={pilots} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
