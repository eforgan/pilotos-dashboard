"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  getPilots, 
  getSummary, 
  searchPilots, 
  filterByBase, 
  filterByStatus 
} from "@/lib/utils";
import PilotCard from "@/components/PilotCard";
import PilotMetrics from "@/components/PilotMetrics";
import { 
  Search, Filter, SlidersHorizontal, ArrowUpDown, LogOut, 
  ShieldCheck, LayoutGrid, Calendar as CalendarIcon 
} from "lucide-react";
import { Pilot } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import CalendarView from "@/components/CalendarView";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [baseFilter, setBaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

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
    result = filterByStatus(result, statusFilter as any);
    
    // Sort
    return result.sort((a, b) => {
      if (sortBy === "name") return a.PILOTO.localeCompare(b.PILOTO);
      if (sortBy === "base") return (a.BASE || "").localeCompare(b.BASE || "");
      return 0;
    });
  }, [pilots, searchQuery, baseFilter, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Iniciando Sistemas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      {/* User Status Bar */}
      <div className="flex items-center justify-end gap-4 mb-4">
        {session?.user?.role === "ADMIN" && (
            <Link href="/admin/invites" className="flex items-center gap-2 text-xs font-black text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Panel Admin
            </Link>
        )}
        <div className="flex items-center gap-3">
            <p className="text-xs font-bold text-muted-foreground">Sesión: <span className="text-foreground">{session?.user?.name}</span></p>
            <button 
                onClick={() => signOut()}
                className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 transition-colors"
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
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 font-outfit uppercase">Panel de Control</h1>
          <p className="text-muted-foreground font-medium">Gestión integral de la tripulación y cumplimiento normativo.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800" />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-[10px] font-bold text-white dark:text-slate-900">
              +{pilots.length}
            </div>
          </div>
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest ml-2">Tripulación</p>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      {summary && <PilotMetrics summary={summary} />}

      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative w-full lg:flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por nombre, DNI, base o licencia..."
            className="input-field pl-12 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus:shadow-md transition-all text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
            <button 
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:bg-slate-100'}`}
            >
                <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setViewMode("calendar")}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:bg-slate-100'}`}
            >
                <CalendarIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground ml-2" />
            <select 
              value={baseFilter}
              onChange={(e) => setBaseFilter(e.target.value)}
              className="bg-transparent text-sm font-semibold outline-none pr-4 min-w-[120px]"
            >
              <option value="all">Todas las Bases</option>
              {availableBases.map(base => (
                <option key={base} value={base}>{base}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setSortBy(sortBy === "name" ? "base" : "name")}
            className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold">{sortBy === "name" ? "Nombre" : "Base"}</span>
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
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold">No se encontraron pilotos</h3>
                <p className="text-muted-foreground">Intenta ajustar los filtros de búsqueda.</p>
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
