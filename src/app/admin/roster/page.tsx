"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pilot } from "@/lib/types";
import { getPilotAircraft } from "@/lib/utils";
import { Users, Mail, MapPin, Plane, Search, ArrowUp, ArrowDown, ArrowUpDown, X, Loader2 } from "lucide-react";
import { motion, animate } from "framer-motion";

const AIRCRAFT_MODELS = ["AW109", "BO105", "RH44", "BN2B"] as const;

function normalizeKey(s: string): string {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// "Base Cabo Vírgenes" es un alias historico de "Base BRM" (misma base
// operativa), igual que en el cuadro de asignaciones.
const BASE_ALIASES: Record<string, string> = {
  [normalizeKey("Base Cabo Vírgenes")]: "Base BRM",
};

function canonicalBaseName(name: string): string {
  return BASE_ALIASES[normalizeKey(name)] || name;
}

function calculateAge(fechaNac: string): number | null {
  if (!fechaNac) return null;
  const parts = fechaNac.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [y, m, d] = parts;
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

function Counter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);
  return <>{displayValue}</>;
}

interface RosterRow {
  id: string;
  piloto: string;
  dni: string;
  edad: number | null;
  basePrincipal: string;
  basesOperativas: string[];
  aeronaves: string[];
  licencia: string;
  cmaVencimiento: string;
  email: string;
  telefono: string;
}

type SortColumn = "piloto" | "dni" | "edad" | "basePrincipal" | "licencia" | "cmaVencimiento" | "email" | "telefono";

export default function RosterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [baseFilter, setBaseFilter] = useState("");
  const [modeloFilter, setModeloFilter] = useState("");
  const [edadMin, setEdadMin] = useState("");
  const [edadMax, setEdadMax] = useState("");
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    if (status === "authenticated" && user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, user, router]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/pilots", { cache: "no-store" });
        if (res.ok) setPilots(await res.json());
      } catch (err) {
        console.error("Error al cargar pilotos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const rows: RosterRow[] = useMemo(() => {
    return pilots.map((p) => {
      const basesSet = new Set<string>();
      for (const b of p.BASES_OPERATIVAS || []) {
        if (b && b.trim()) basesSet.add(canonicalBaseName(b.trim()));
      }
      return {
        id: p.id,
        piloto: p.PILOTO.trim(),
        dni: p.DNI || "",
        edad: calculateAge(p.FECHA_NAC),
        basePrincipal: p.BASE || "",
        basesOperativas: Array.from(basesSet).sort((a, b) => a.localeCompare(b, "es")),
        aeronaves: getPilotAircraft(p),
        licencia: p.LICENCIA || "",
        cmaVencimiento: p.CMA || "",
        email: p.EMAIL || "",
        telefono: p.TELEFONO || "",
      };
    });
  }, [pilots]);

  const baseOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.basesOperativas.forEach((b) => set.add(b)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [rows]);

  const aircraftCounts = useMemo(() => {
    return AIRCRAFT_MODELS.map((model) => ({
      model,
      count: rows.filter((r) => r.aeronaves.includes(model)).length,
    }));
  }, [rows]);

  const maxAircraftCount = Math.max(1, ...aircraftCounts.map((a) => a.count));

  const totalPilotos = rows.length;
  const sinEmail = rows.filter((r) => !r.email).length;
  const basesDistintas = baseOptions.length;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = edadMin === "" ? null : Number(edadMin);
    const max = edadMax === "" ? null : Number(edadMax);

    return rows.filter((r) => {
      if (q) {
        const haystack = [
          r.piloto, r.dni, r.basePrincipal, r.basesOperativas.join(" "),
          r.aeronaves.join(" "), r.licencia, r.email, r.telefono,
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (baseFilter && !r.basesOperativas.includes(baseFilter)) return false;
      if (modeloFilter && !r.aeronaves.includes(modeloFilter)) return false;
      if (min !== null && (r.edad === null || r.edad < min)) return false;
      if (max !== null && (r.edad === null || r.edad > max)) return false;
      return true;
    });
  }, [rows, search, baseFilter, modeloFilter, edadMin, edadMax]);

  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    const dir = sortDirection === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      const av = a[sortColumn];
      const bv = b[sortColumn];
      const aEmpty = av === null || av === undefined || av === "";
      const bEmpty = bv === null || bv === undefined || bv === "";
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      if (sortColumn === "edad") return ((av as number) - (bv as number)) * dir;
      return String(av).localeCompare(String(bv), "es", { numeric: true }) * dir;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  function toggleSort(col: SortColumn) {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  }

  function sortIcon(col: SortColumn) {
    if (sortColumn !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDirection === "asc" ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />;
  }

  const columns: { key: SortColumn; label: string }[] = [
    { key: "piloto", label: "Piloto" },
    { key: "dni", label: "DNI" },
    { key: "edad", label: "Edad" },
    { key: "basePrincipal", label: "Base Principal" },
    { key: "licencia", label: "Licencia" },
    { key: "cmaVencimiento", label: "CMA (Vto.)" },
    { key: "email", label: "Email" },
    { key: "telefono", label: "Teléfono" },
  ];

  const tiles = [
    {
      title: "Total de Pilotos",
      value: totalPilotos,
      icon: Users,
      accent: "from-blue-600 to-sky-400",
      description: "Legajos Registrados",
    },
    {
      title: "Sin Email Cargado",
      value: sinEmail,
      icon: Mail,
      accent: "from-orange-600 to-amber-400",
      description: "Pendientes de Completar",
    },
    {
      title: "Bases Distintas",
      value: basesDistintas,
      icon: MapPin,
      accent: "from-green-600 to-emerald-400",
      description: "Cobertura Operativa",
    },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-600" />
          Roster de Pilotos
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Legajo, bases operativas y habilitaciones de aeronave de cada piloto.
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {tiles.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="relative group bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all overflow-hidden"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.accent} opacity-10 blur-2xl group-hover:opacity-25 transition-opacity`} />
            <div className="flex flex-col gap-4 relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.accent} p-[1px]`}>
                <div className="w-full h-full rounded-[15px] bg-slate-900 flex items-center justify-center">
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1">{card.title}</p>
                <span className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter">
                  <Counter value={card.value} />
                </span>
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tight mt-1">{card.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Aircraft distribution */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md mb-8"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white">
              Pilotos Habilitados por Modelo
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Click en una barra para filtrar la tabla por ese modelo.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {aircraftCounts.map((a) => {
            const isActive = modeloFilter === a.model;
            return (
              <button
                key={a.model}
                type="button"
                onClick={() => setModeloFilter((cur) => (cur === a.model ? "" : a.model))}
                className="w-full flex items-center gap-3 group"
              >
                <span className="w-16 text-xs font-black text-slate-600 dark:text-slate-300 text-left shrink-0">{a.model}</span>
                <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max((a.count / maxAircraftCount) * 100, a.count > 0 ? 4 : 0)}%` }}
                    transition={{ duration: 0.5 }}
                    className={`h-full rounded-full bg-gradient-to-r ${isActive ? "from-blue-600 to-sky-400" : "from-blue-500/60 to-sky-400/60 group-hover:from-blue-600 group-hover:to-sky-400"}`}
                  />
                </div>
                <span className="w-6 text-xs font-black text-slate-500 dark:text-slate-400 text-right shrink-0">{a.count}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar piloto, base, aeronave, email..."
            className="input-field pl-11 h-11 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
          />
        </div>
        <select
          value={baseFilter}
          onChange={(e) => setBaseFilter(e.target.value)}
          className="input-field h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
        >
          <option value="">Todas las bases</option>
          {baseOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          value={modeloFilter}
          onChange={(e) => setModeloFilter(e.target.value)}
          className="input-field h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
        >
          <option value="">Todos los modelos</option>
          {AIRCRAFT_MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-black uppercase text-slate-400">Edad</label>
          <input
            type="number"
            min={0}
            value={edadMin}
            onChange={(e) => setEdadMin(e.target.value)}
            placeholder="Desde"
            className="input-field h-11 w-20 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            value={edadMax}
            onChange={(e) => setEdadMax(e.target.value)}
            placeholder="Hasta"
            className="input-field h-11 w-20 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
          />
        </div>
        {modeloFilter && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-wide">
            Modelo: {modeloFilter}
            <button type="button" onClick={() => setModeloFilter("")} aria-label="Quitar filtro de modelo">
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        )}
        <span className="text-xs font-bold text-slate-400 ml-auto">
          {sortedRows.length} de {totalPilotos} pilotos
        </span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b-2 border-slate-200 dark:border-slate-800">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left px-4 py-3 font-black uppercase text-[11px] tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap cursor-pointer select-none hover:text-slate-900 dark:hover:text-white"
                  >
                    <span className="inline-flex items-center gap-1">{col.label} {sortIcon(col.key)}</span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-black uppercase text-[11px] tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Bases Operativas
                </th>
                <th className="text-left px-4 py-3 font-black uppercase text-[11px] tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Aeronaves
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="text-center text-sm font-semibold text-slate-400 py-10">
                    No hay pilotos que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                sortedRows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-850/40"}`}
                  >
                    <td className="px-4 py-2.5 font-black text-slate-900 dark:text-white whitespace-nowrap">{r.piloto}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.dni || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.edad ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.basePrincipal || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.licencia || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.cmaVencimiento || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.email || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">{r.telefono || <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {r.basesOperativas.length > 0 ? r.basesOperativas.join(", ") : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {r.aeronaves.length > 0 ? r.aeronaves.join(", ") : <span className="text-slate-400">—</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
