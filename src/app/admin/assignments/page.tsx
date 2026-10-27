"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pilot } from "@/lib/types";
import { MapPin, Plane, Loader2, Search, CheckCircle2, AlertTriangle } from "lucide-react";

interface BaseRecord {
  id: string;
  name: string;
  client: string;
}

const AIRCRAFT_COLUMNS = ["AW109", "BO105", "RH44", "BN2B"] as const;

type SaveState = "idle" | "saving" | "saved" | "error";

function normalizeKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// "Base Cabo Vírgenes" es un alias historico de "Base BRM" (misma base
// operativa, dos nombres distintos usados en datos viejos): se unifican en
// una sola columna en vez de mostrar un duplicado.
const BASE_ALIASES: Record<string, string> = {
  [normalizeKey("Base Cabo Vírgenes")]: "Base BRM",
};

function canonicalBaseName(name: string): string {
  return BASE_ALIASES[normalizeKey(name)] || name;
}

export default function PilotAssignmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [bases, setBases] = useState<BaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cellState, setCellState] = useState<Record<string, SaveState>>({});

  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    if (status === "authenticated" && user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, user, router]);

  useEffect(() => {
    async function load() {
      try {
        const [pilotsRes, basesRes] = await Promise.all([
          fetch("/api/pilots", { cache: "no-store" }),
          fetch("/api/bases", { cache: "no-store" }),
        ]);
        if (pilotsRes.ok) setPilots(await pilotsRes.json());
        if (basesRes.ok) setBases(await basesRes.json());
      } catch (err) {
        console.error("Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Las bases operativas disponibles son las cargadas en Gestión de Flota,
  // más cualquier base que ya tengan asignada los pilotos pero que no exista
  // como registro formal todavía (para no perder datos existentes).
  const baseNames = useMemo(() => {
    const names = new Set<string>(bases.map((b) => canonicalBaseName(b.name)));
    for (const p of pilots) {
      if (p.BASE && p.BASE.trim()) names.add(canonicalBaseName(p.BASE.trim()));
      for (const b of p.BASES_OPERATIVAS || []) {
        if (b && b.trim()) names.add(canonicalBaseName(b.trim()));
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "es"));
  }, [bases, pilots]);

  const filteredPilots = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pilots;
    return pilots.filter((p) => p.PILOTO.toLowerCase().includes(q));
  }, [pilots, search]);

  async function patchPilot(pilotId: string, cellKey: string, data: Record<string, unknown>) {
    setCellState((prev) => ({ ...prev, [cellKey]: "saving" }));
    try {
      const res = await fetch(`/api/pilots/${pilotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setCellState((prev) => ({ ...prev, [cellKey]: "saved" }));
      setTimeout(() => {
        setCellState((prev) => (prev[cellKey] === "saved" ? { ...prev, [cellKey]: "idle" } : prev));
      }, 1200);
    } catch (err) {
      console.error(err);
      setCellState((prev) => ({ ...prev, [cellKey]: "error" }));
      // Revert optimistic UI change on failure by reloading this pilot's row.
      load();
    }
  }

  async function load() {
    const res = await fetch("/api/pilots", { cache: "no-store" });
    if (res.ok) setPilots(await res.json());
  }

  function toggleBase(pilot: Pilot, baseName: string) {
    const current = pilot.BASES_OPERATIVAS || [];
    const isAssigned = current.some((b) => canonicalBaseName(b) === baseName);
    // Al desmarcar, se quita cualquier variante (incluidos alias viejos como
    // "Base Cabo Vírgenes") que apunte a esta misma base canonica.
    const next = isAssigned
      ? current.filter((b) => canonicalBaseName(b) !== baseName)
      : [...current, baseName];

    setPilots((prev) =>
      prev.map((p) => (p.id === pilot.id ? { ...p, BASES_OPERATIVAS: next } : p))
    );
    patchPilot(pilot.id, `${pilot.id}-base-${baseName}`, { BASES_OPERATIVAS: next });
  }

  function toggleAircraft(pilot: Pilot, model: (typeof AIRCRAFT_COLUMNS)[number]) {
    const isEnabled = Boolean(pilot[model] && pilot[model] !== "N.A." && pilot[model] !== "");
    const nextValue = isEnabled ? "" : model;

    setPilots((prev) =>
      prev.map((p) => (p.id === pilot.id ? { ...p, [model]: nextValue } : p))
    );
    patchPilot(pilot.id, `${pilot.id}-ac-${model}`, { [model]: nextValue });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
          <MapPin className="w-7 h-7 text-blue-600" />
          Asignación de Bases y Aeronaves
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
          Marcá a qué bases operativas concurre cada piloto y en qué modelos de helicóptero está habilitado. Un piloto puede estar afectado a más de una base y más de un modelo. Los cambios se guardan al instante.
        </p>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar piloto..."
          className="input-field pl-11 h-11 w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b-2 border-slate-200 dark:border-slate-800">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-850 text-left px-4 py-3 font-black uppercase text-[11px] tracking-wider text-slate-500 dark:text-slate-400 min-w-[220px]"
                >
                  Piloto
                </th>
                <th
                  colSpan={baseNames.length}
                  className="px-3 py-2 text-center font-black uppercase text-[11px] tracking-wider text-blue-700 dark:text-blue-400 border-l-2 border-slate-200 dark:border-slate-800"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Bases Operativas
                  </span>
                </th>
                <th
                  colSpan={AIRCRAFT_COLUMNS.length}
                  className="px-3 py-2 text-center font-black uppercase text-[11px] tracking-wider text-emerald-700 dark:text-emerald-400 border-l-2 border-slate-200 dark:border-slate-800"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Plane className="w-3.5 h-3.5" /> Aeronaves Habilitadas
                  </span>
                </th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-850 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-850 px-4 py-2" />
                {baseNames.map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className="px-2 py-2 text-center font-bold text-[10px] uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap border-l border-slate-100 dark:border-slate-800"
                  >
                    {name.replace(/^Base\s+/i, "")}
                  </th>
                ))}
                {AIRCRAFT_COLUMNS.map((model) => (
                  <th
                    key={model}
                    scope="col"
                    className="px-2 py-2 text-center font-bold text-[10px] uppercase text-slate-500 dark:text-slate-400 whitespace-nowrap border-l border-slate-100 dark:border-slate-800"
                  >
                    {model}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPilots.map((pilot, idx) => (
                <tr
                  key={pilot.id}
                  className={`border-b border-slate-100 dark:border-slate-800 ${
                    idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-850/40"
                  }`}
                >
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {pilot.PILOTO}
                    {pilot.BASE && (
                      <span className="block text-[10px] font-semibold text-slate-400 normal-case">
                        Base principal: {pilot.BASE}
                      </span>
                    )}
                  </td>
                  {baseNames.map((name) => {
                    const checked = (pilot.BASES_OPERATIVAS || []).some(
                      (b) => canonicalBaseName(b) === name
                    );
                    const key = `${pilot.id}-base-${name}`;
                    const cs = cellState[key];
                    return (
                      <td
                        key={name}
                        className="px-2 py-2 text-center border-l border-slate-100 dark:border-slate-800"
                      >
                        <AssignmentCheckbox
                          checked={checked}
                          state={cs}
                          onToggle={() => toggleBase(pilot, name)}
                          label={`${pilot.PILOTO} - ${name}`}
                        />
                      </td>
                    );
                  })}
                  {AIRCRAFT_COLUMNS.map((model) => {
                    const value = pilot[model];
                    const checked = Boolean(value && value !== "N.A." && value !== "");
                    const key = `${pilot.id}-ac-${model}`;
                    const cs = cellState[key];
                    return (
                      <td
                        key={model}
                        className="px-2 py-2 text-center border-l border-slate-100 dark:border-slate-800"
                      >
                        <AssignmentCheckbox
                          checked={checked}
                          state={cs}
                          onToggle={() => toggleAircraft(pilot, model)}
                          label={`${pilot.PILOTO} - ${model}`}
                          accent="emerald"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPilots.length === 0 && (
          <p className="text-center text-sm font-semibold text-slate-400 py-10">
            No se encontraron pilotos para &quot;{search}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}

function AssignmentCheckbox({
  checked,
  state,
  onToggle,
  label,
  accent = "blue",
}: {
  checked: boolean;
  state?: SaveState;
  onToggle: () => void;
  label: string;
  accent?: "blue" | "emerald";
}) {
  const activeClasses =
    accent === "emerald"
      ? "bg-emerald-600 border-emerald-600 text-white"
      : "bg-blue-600 border-blue-600 text-white";

  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label}
      onClick={onToggle}
      disabled={state === "saving"}
      className={`relative w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all disabled:opacity-60 ${
        checked
          ? activeClasses
          : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-slate-400"
      }`}
    >
      {state === "saving" ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : state === "error" ? (
        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
      ) : checked ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : null}
    </button>
  );
}
