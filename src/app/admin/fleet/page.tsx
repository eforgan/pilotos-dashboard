"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MapPin, Plane, Plus, Trash2, Loader2, Building2, X, Pencil, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AircraftRecord {
  id: string;
  model: string;
  tailNumber: string;
}

interface BaseRecord {
  id: string;
  name: string;
  client: string;
  location: string;
  description: string | null;
  aircraft: AircraftRecord[];
}

export default function AdminFleetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bases, setBases] = useState<BaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBase, setShowAddBase] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addingAircraftTo, setAddingAircraftTo] = useState<string | null>(null);
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);

  const [newBase, setNewBase] = useState({ name: "", client: "", location: "", description: "" });
  const [newAircraft, setNewAircraft] = useState({ model: "", tailNumber: "" });
  const [editBase, setEditBase] = useState({ name: "", client: "", location: "", description: "" });

  const user = session?.user as { role?: string } | undefined;

  useEffect(() => {
    if (status === "authenticated" && user?.role !== "ADMIN") {
      router.replace("/");
    }
  }, [status, user, router]);

  async function loadBases() {
    try {
      const res = await fetch("/api/bases", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load bases");
      setBases(await res.json());
    } catch (err) {
      console.error("Error al cargar bases:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBases();
  }, []);

  const handleCreateBase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBase),
      });
      if (res.ok) {
        await loadBases();
        setShowAddBase(false);
        setNewBase({ name: "", client: "", location: "", description: "" });
      } else {
        const err = await res.json();
        alert(err.error || "Error al crear la base");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startEditBase = (base: BaseRecord) => {
    setEditingBaseId(base.id);
    setEditBase({
      name: base.name,
      client: base.client,
      location: base.location,
      description: base.description || "",
    });
  };

  const handleSaveBaseEdit = async (id: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editBase),
      });
      if (res.ok) {
        await loadBases();
        setEditingBaseId(null);
      } else {
        const err = await res.json();
        alert(err.error || "Error al actualizar la base");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBase = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar permanentemente "${name}" y todas sus aeronaves asignadas?`)) return;
    const res = await fetch(`/api/bases/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBases((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert("Error al eliminar la base.");
    }
  };

  const handleAddAircraft = async (e: React.FormEvent, baseId: string) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/bases/${baseId}/aircraft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAircraft),
      });
      if (res.ok) {
        await loadBases();
        setAddingAircraftTo(null);
        setNewAircraft({ model: "", tailNumber: "" });
      } else {
        const err = await res.json();
        alert(err.error || "Error al agregar la aeronave");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAircraft = async (id: string, tailNumber: string) => {
    if (!confirm(`¿Eliminar la aeronave ${tailNumber}?`)) return;
    const res = await fetch(`/api/aircraft/${id}`, { method: "DELETE" });
    if (res.ok) {
      await loadBases();
    } else {
      alert("Error al eliminar la aeronave.");
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-400 animate-pulse font-black tracking-widest uppercase">
        Cargando Flota y Bases...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            Gestión de Flota y Bases
          </div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            Bases Operativas y Aeronaves
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Alta, baja y edición de bases, contratos y matrículas asignadas — sin necesidad de un nuevo despliegue.
          </p>
        </div>

        <button
          onClick={() => setShowAddBase(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-2xl transition-all shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          Nueva Base
        </button>
      </div>

      <div className="grid gap-4">
        {bases.map((base) => {
          const isEditing = editingBaseId === base.id;
          return (
            <div
              key={base.id}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-5"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      value={editBase.name}
                      onChange={(e) => setEditBase((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Nombre de la base"
                      className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                    />
                    <input
                      value={editBase.client}
                      onChange={(e) => setEditBase((p) => ({ ...p, client: e.target.value }))}
                      placeholder="Cliente / contrato"
                      className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                    />
                    <input
                      value={editBase.location}
                      onChange={(e) => setEditBase((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Ubicación"
                      className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <input
                    value={editBase.description}
                    onChange={(e) => setEditBase((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Descripción"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingBaseId(null)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs"
                    >
                      CANCELAR
                    </button>
                    <button
                      onClick={() => handleSaveBaseEdit(base.id)}
                      disabled={submitting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-xs uppercase disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" /> Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-base uppercase text-slate-950 dark:text-white">{base.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200 text-[11px] font-black uppercase border border-blue-300 dark:border-blue-700">
                          {base.client}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">{base.location}</p>
                      {base.description && (
                        <p className="text-xs font-semibold text-slate-400 mt-1 max-w-xl">{base.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEditBase(base)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all"
                      title="Editar base"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBase(base.id, base.name)}
                      className="p-2 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-200 dark:border-red-800"
                      title="Eliminar base"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Aircraft list */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                {base.aircraft.map((ac) => (
                  <span
                    key={ac.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase text-slate-700 dark:text-slate-200"
                  >
                    <Plane className="w-3.5 h-3.5 text-blue-500" />
                    {ac.model} ({ac.tailNumber})
                    <button
                      onClick={() => handleDeleteAircraft(ac.id, ac.tailNumber)}
                      className="text-slate-400 hover:text-red-600"
                      title="Eliminar aeronave"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}

                {addingAircraftTo === base.id ? (
                  <form
                    onSubmit={(e) => handleAddAircraft(e, base.id)}
                    className="flex items-center gap-2"
                  >
                    <input
                      required
                      autoFocus
                      value={newAircraft.model}
                      onChange={(e) => setNewAircraft((p) => ({ ...p, model: e.target.value }))}
                      placeholder="Modelo (ej. AW109SP)"
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold w-36"
                    />
                    <input
                      required
                      value={newAircraft.tailNumber}
                      onChange={(e) => setNewAircraft((p) => ({ ...p, tailNumber: e.target.value }))}
                      placeholder="Matrícula (ej. LV-XXX)"
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold w-32"
                    />
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-black text-xs uppercase disabled:opacity-50"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingAircraftTo(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setAddingAircraftTo(base.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-600 text-xs font-black uppercase transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Aeronave
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Base Modal */}
      <AnimatePresence>
        {showAddBase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddBase(false)}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white mb-1 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Nueva Base Operativa
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6">
                Se sumará al desplegable de bases en toda la aplicación de inmediato.
              </p>

              <form onSubmit={handleCreateBase} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre *</label>
                  <input
                    required
                    placeholder="ej. Base Comodoro Rivadavia"
                    value={newBase.name}
                    onChange={(e) => setNewBase((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">Cliente / Contrato *</label>
                    <input
                      required
                      value={newBase.client}
                      onChange={(e) => setNewBase((p) => ({ ...p, client: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">Ubicación *</label>
                    <input
                      required
                      value={newBase.location}
                      onChange={(e) => setNewBase((p) => ({ ...p, location: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">Descripción</label>
                  <input
                    value={newBase.description}
                    onChange={(e) => setNewBase((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                  />
                </div>
                <p className="text-[11px] font-semibold text-slate-400">
                  Las aeronaves se agregan después, desde la tarjeta de la base ya creada.
                </p>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddBase(false)}
                    className="px-5 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-700 dark:text-slate-300"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {submitting ? "GUARDANDO..." : "CREAR BASE"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
