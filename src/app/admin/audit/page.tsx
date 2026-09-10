"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { History, Filter, Search } from "lucide-react";

interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string;
  diff: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  UPDATE: "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border-blue-300 dark:border-blue-800",
  CREATE_INVITE: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
  VERIFY: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800",
  UNVERIFY: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800",
  IMPORT_CREATE: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border-purple-300 dark:border-purple-800",
  IMPORT_UPDATE: "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border-purple-300 dark:border-purple-800",
};

export default function AdminAuditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    if (status === "authenticated" && user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, user, router]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/audit", { cache: "no-store" });
        if (res.ok) setLogs(await res.json());
      } catch (err) {
        console.error("Error al cargar auditoría:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const entityTypes = useMemo(
    () => Array.from(new Set(logs.map((l) => l.entityType))).sort(),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesType = entityTypeFilter === "all" || l.entityType === entityTypeFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        q === "" ||
        l.entityId.toLowerCase().includes(q) ||
        (l.actorEmail || "").toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [logs, entityTypeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-400 animate-pulse font-black tracking-widest uppercase">
        Cargando Registro de Auditoría...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
          <History className="w-3.5 h-3.5" />
          Registro de Auditoría
        </div>
        <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
          Historial de Cambios
        </h1>
        <p className="text-muted-foreground font-bold text-sm mt-1">
          Últimos 200 cambios sobre pilotos, documentos e invitaciones — quién, qué y cuándo.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por email, ID o acción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11 h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm font-bold w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-2xl">
          <Filter className="w-4 h-4 text-blue-600 shrink-0" />
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-slate-950 dark:text-white outline-none"
          >
            <option value="all">Todas las entidades</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th className="p-4">Fecha</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">Acción</th>
                <th className="p-4">Entidad</th>
                <th className="p-4">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("es-AR")}
                    </td>
                    <td className="p-4">{log.actorEmail || "—"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${ACTION_COLORS[log.action] || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      {log.entityType} <span className="text-slate-400">#{log.entityId.slice(0, 8)}</span>
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate" title={log.diff ? JSON.stringify(log.diff) : ""}>
                      {log.diff ? JSON.stringify(log.diff) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400 font-bold uppercase tracking-wider">
                    No hay registros de auditoría para el filtro seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
