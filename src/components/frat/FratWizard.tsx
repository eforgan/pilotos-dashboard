"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  Loader2,
  Plane,
  Radio,
} from "lucide-react";
import {
  FratResponses,
  FratType,
  computeFratScore,
  getFratSheet,
} from "@/lib/frat-data";
import { COMPANY_BASES, AIRCRAFT_MODELS, MISSION_TYPES } from "@/lib/types";
import FratStepItem from "./FratStepItem";
import FratScoreBar from "./FratScoreBar";

interface PilotOption {
  id: string;
  PILOTO: string;
}

const TYPE_INFO: { type: FratType; title: string; icon: React.ReactNode; description: string }[] = [
  {
    type: "TRAINING",
    title: "Training FRAT",
    icon: <GraduationCap className="w-6 h-6" />,
    description:
      "Vuelos de instrucción/entrenamiento, incluidas las habilitaciones Offshore VMOS. Es la pestaña utilizada en el programa de habilitación de pilotos.",
  },
  {
    type: "DAILY_OPS",
    title: "Daily Normal Ops FRAT",
    icon: <Plane className="w-6 h-6" />,
    description: "Vuelos operativos normales (no de instrucción): línea, HEMS, traslados, etc.",
  },
];

export default function FratWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { role?: string; pilotId?: string | null } | undefined;
  const isAdmin = user?.role === "ADMIN";

  const [pilots, setPilots] = useState<PilotOption[]>([]);
  const [step, setStep] = useState(0);
  const [fratType, setFratType] = useState<FratType | null>(null);
  const [responses, setResponses] = useState<FratResponses>({});
  const [generalNotes, setGeneralNotes] = useState("");
  const [decision, setDecision] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [pilotId, setPilotId] = useState("");
  const [flightDate, setFlightDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [base, setBase] = useState("");
  const [aircraft, setAircraft] = useState<string>(AIRCRAFT_MODELS[0]);
  const [picName, setPicName] = useState("");
  const [sicName, setSicName] = useState("");
  const [route, setRoute] = useState("");
  const [etd, setEtd] = useState("");
  const [missionType, setMissionType] = useState<string>(MISSION_TYPES[0]);

  useEffect(() => {
    fetch("/api/pilots")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setPilots(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAdmin && user?.pilotId) {
      setPilotId(user.pilotId);
    }
  }, [isAdmin, user?.pilotId]);

  useEffect(() => {
    if (pilotId) {
      const p = pilots.find((x) => x.id === pilotId);
      if (p && !picName) setPicName(p.PILOTO);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pilotId, pilots]);

  const sheet = fratType ? getFratSheet(fratType) : null;
  const score = useMemo(() => (sheet ? computeFratScore(sheet, responses) : null), [sheet, responses]);

  const steps = useMemo(() => {
    const base: { id: string; label: string }[] = [
      { id: "type", label: "Tipo de FRAT" },
      { id: "flight", label: "Datos de Vuelo" },
    ];
    if (sheet) {
      for (const s of sheet.sections) base.push({ id: s.id, label: s.title });
      base.push({ id: "review", label: "Revisión y Registro" });
    }
    return base;
  }, [sheet]);

  const currentSection = sheet && step >= 2 && step < steps.length - 1 ? sheet.sections[step - 2] : null;
  const isReviewStep = sheet && step === steps.length - 1;

  const flightInfoValid = picName.trim().length > 0 && flightDate.length > 0;
  const canGoNext = step === 0 ? Boolean(fratType) : step === 1 ? flightInfoValid : true;

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSelectType = (t: FratType) => {
    if (t !== fratType) setResponses({});
    setFratType(t);
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!sheet || !score) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/frat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: fratType,
          pilotId: pilotId || null,
          flightDate,
          base,
          aircraft,
          picName,
          sicName,
          route,
          etd,
          missionType,
          responses,
          generalNotes,
          decision,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "No se pudo registrar el FRAT");
        return;
      }
      setCreatedId(data.id);
    } catch {
      setSubmitError("Error de conexión al registrar el FRAT");
    } finally {
      setSubmitting(false);
    }
  };

  if (createdId) {
    return (
      <div className="max-w-xl mx-auto text-center py-24">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black uppercase text-slate-950 dark:text-white mb-2">FRAT Registrado</h2>
        <p className="text-sm font-bold text-slate-500 mb-8">
          La evaluación quedó guardada en la base de datos y disponible para consulta.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.push(`/frat/${createdId}`)}
            className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-extrabold text-xs uppercase shadow-md hover:bg-blue-700"
          >
            Ver FRAT y descargar PDF
          </button>
          <button
            onClick={() => router.push("/frat")}
            className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-extrabold text-xs uppercase text-slate-900 dark:text-white"
          >
            Volver al histórico
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
          <span>
            Paso {step + 1} de {steps.length}: {steps[step]?.label}
          </span>
          <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-blue-600"
            initial={false}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {sheet && score && step >= 1 && <FratScoreBar score={score} />}

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.15 }}
      >
          {step === 0 && (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-xs font-bold text-blue-900 dark:text-blue-200">
                Elija la pestaña del FRAT que corresponde al vuelo a evaluar, tal como indica el instructivo de la
                compañía.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TYPE_INFO.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => handleSelectType(t.type)}
                    className={`text-left p-6 rounded-3xl border-2 transition-all ${
                      fratType === t.type
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-4">
                      {t.icon}
                    </div>
                    <h3 className="font-black text-lg uppercase text-slate-950 dark:text-white mb-1">{t.title}</h3>
                    <p className="text-xs font-bold text-slate-500">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && sheet && (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Radio className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black uppercase text-slate-950 dark:text-white">
                  Datos del vuelo — {sheet.title}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Fecha del vuelo *</label>
                  <input
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Base operativa</label>
                  <select value={base} onChange={(e) => setBase(e.target.value)} className="input-field bg-white dark:bg-slate-900">
                    <option value="">Sin especificar</option>
                    {COMPANY_BASES.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} — {b.client}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">Aeronave</label>
                  <select value={aircraft} onChange={(e) => setAircraft(e.target.value)} className="input-field bg-white dark:bg-slate-900">
                    {AIRCRAFT_MODELS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Tripulación del Vuelo
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sheet.type === "TRAINING" ? (
                    <>
                      {/* Box 1: Instructor / Inspector */}
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                          Instructor / Inspector / Evaluador *
                        </label>
                        <div className="space-y-2">
                          <select
                            onChange={(e) => {
                              const p = pilots.find((x) => x.id === e.target.value);
                              if (p) setPicName(p.PILOTO);
                            }}
                            className="input-field bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="">Seleccionar Instructor de la lista...</option>
                            {pilots.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.PILOTO}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={picName}
                            onChange={(e) => setPicName(e.target.value)}
                            placeholder="Nombre del Instructor / Inspector *"
                            className="input-field"
                          />
                        </div>
                      </div>

                      {/* Box 2: Piloto en Instrucción / Alumno */}
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                          Piloto en Instrucción / Alumno (Legajo)
                        </label>
                        <div className="space-y-2">
                          <select
                            value={pilotId}
                            onChange={(e) => {
                              setPilotId(e.target.value);
                              const p = pilots.find((x) => x.id === e.target.value);
                              if (p) setSicName(p.PILOTO);
                            }}
                            disabled={!isAdmin}
                            className="input-field bg-white dark:bg-slate-900 disabled:opacity-60 text-xs"
                          >
                            <option value="">Seleccionar Piloto en Instrucción...</option>
                            {pilots.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.PILOTO}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={sicName}
                            onChange={(e) => setSicName(e.target.value)}
                            placeholder="Nombre del Piloto en Instrucción / Alumno"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Box 1: Comandante (PIC) */}
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                          {missionType === "HEMS" ? "Piloto / Comandante HEMS *" : "Comandante (PIC) / Piloto a Cargo *"}
                        </label>
                        <div className="space-y-2">
                          <select
                            value={pilotId}
                            onChange={(e) => {
                              setPilotId(e.target.value);
                              const p = pilots.find((x) => x.id === e.target.value);
                              if (p) setPicName(p.PILOTO);
                            }}
                            disabled={!isAdmin}
                            className="input-field bg-white dark:bg-slate-900 disabled:opacity-60 text-xs"
                          >
                            <option value="">Vincular con Legajo de Piloto...</option>
                            {pilots.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.PILOTO}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={picName}
                            onChange={(e) => setPicName(e.target.value)}
                            placeholder={missionType === "HEMS" ? "Nombre del Piloto HEMS *" : "Nombre del Comandante (PIC) *"}
                            className="input-field"
                          />
                        </div>
                      </div>

                      {/* Box 2: Técnico Operativo (TFO) / Copiloto */}
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                          {missionType === "HEMS" ? "Técnico Operativo (TFO) / Copiloto HEMS" : "Copiloto / TFO"}
                        </label>
                        <div className="space-y-2">
                          <select
                            onChange={(e) => {
                              const p = pilots.find((x) => x.id === e.target.value);
                              if (p) setSicName(p.PILOTO);
                            }}
                            className="input-field bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="">
                              {missionType === "HEMS"
                                ? "Seleccionar Técnico Operativo / Copiloto..."
                                : "Seleccionar Copiloto de la lista..."}
                            </option>
                            {pilots.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.PILOTO}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={sicName}
                            onChange={(e) => setSicName(e.target.value)}
                            placeholder={
                              missionType === "HEMS"
                                ? "Nombre del Técnico Operativo (TFO) o Copiloto"
                                : "Nombre del Copiloto / TFO (opcional)"
                            }
                            className="input-field"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Tipo de misión</label>
                    <select
                      value={missionType}
                      onChange={(e) => setMissionType(e.target.value)}
                      className="input-field bg-white dark:bg-slate-900"
                    >
                      {MISSION_TYPES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">Ruta</label>
                    <input type="text" value={route} onChange={(e) => setRoute(e.target.value)} placeholder="ej. SABB - SAZR" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-1">ETD</label>
                    <input type="time" value={etd} onChange={(e) => setEtd(e.target.value)} className="input-field" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentSection && sheet && (
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase text-slate-950 dark:text-white">{currentSection.title}</h3>
                  <p className="text-xs font-bold text-slate-500">{currentSection.helpText}</p>
                </div>
              </div>
              <div className="space-y-4">
                {currentSection.items.map((item) => (
                  <FratStepItem
                    key={item.id}
                    item={item}
                    value={responses[item.id]}
                    onChange={(v) =>
                      setResponses((prev) => {
                        const next = { ...prev };
                        if (v) next[item.id] = v;
                        else delete next[item.id];
                        return next;
                      })
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {isReviewStep && sheet && score && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-4">
                <h3 className="text-base font-black uppercase text-slate-950 dark:text-white">
                  Revisión final — {sheet.title}
                </h3>
                {score.missing > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-900 dark:text-amber-200">
                    Faltan {score.missing} pregunta(s) por responder. Vuelva a los pasos anteriores para completarlas.
                  </div>
                )}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {sheet.sections.map((sec) => (
                    <div key={sec.id}>
                      <p className="text-[11px] font-black uppercase text-slate-400 mb-1">{sec.title}</p>
                      {sec.items.map((item) => {
                        const r = responses[item.id];
                        const chosen = r ? item.options.find((o) => o.score === r.final) : undefined;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 text-xs font-bold py-1 border-b border-slate-50 dark:border-slate-800"
                          >
                            <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                            <span
                              className={`shrink-0 ${
                                !r ? "text-slate-400" : r.final === 2 ? "text-red-600" : r.final === 1 ? "text-amber-600" : "text-emerald-600"
                              }`}
                            >
                              {chosen ? `${chosen.label} (${r!.final} pts)` : "Sin responder"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase mb-1">
                    Observaciones generales
                  </label>
                  <textarea
                    rows={2}
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Comentarios o acciones colectivas de la tripulación antes del despegue..."
                    className="input-field"
                  />
                </div>
                {score.finalLevel !== "ACCEPTABLE" && (
                  <div>
                    <label className="block text-xs font-black text-red-600 uppercase mb-1">
                      Decisión / Autorización *
                    </label>
                    <textarea
                      rows={2}
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      placeholder={
                        score.finalLevel === "CAUTION"
                          ? "ej. Autorizado por [Post Holder de Operaciones] tras revisión adicional..."
                          : "ej. Vuelo cancelado/reprogramado por Dirección de Operaciones..."
                      }
                      className="input-field border-red-300 dark:border-red-700"
                    />
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                      Puntaje {score.finalLevel === "CAUTION" ? "CAUTION" : "HIGH RISK"}: debe dejar constancia de la
                      autorización del Post Holder de Operaciones o del motivo de cancelación/reprogramación.
                    </p>
                  </div>
                )}
                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 text-xs font-bold text-red-700 dark:text-red-300">
                    {submitError}
                  </div>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || score.missing > 0}
                  className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Registrar FRAT
                </button>
              </div>
            </div>
          )}
      </motion.div>

      {!isReviewStep && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase disabled:opacity-40"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            onClick={goNext}
            disabled={!canGoNext}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-extrabold text-xs uppercase disabled:opacity-40"
          >
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {isReviewStep && (
        <div className="flex items-center justify-start mt-6">
          <button
            onClick={goPrev}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>
        </div>
      )}
    </div>
  );
}
