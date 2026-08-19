"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, FileCheck, 
  Plane, Sun, Moon, Wind, UserCheck, RefreshCw, Printer, 
  Building2, Calendar, Clock, MapPin, User, FileText, Check, AlertOctagon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { COMPANY_BASES, BaseContract } from "@/lib/types";

interface FratCriterion {
  id: string;
  label: string;
  points: number;
  category: "human" | "wx" | "mission" | "aircraft";
}

interface FratCategory {
  id: "human" | "wx" | "mission" | "aircraft";
  title: string;
  description: string;
  icon: React.ReactNode;
  criteria: FratCriterion[];
}

const FRAT_CATEGORIES: FratCategory[] = [
  {
    id: "human",
    title: "1. Factores Humanos & Fatiga de Tripulación",
    description: "Evaluación de descanso, horas de vuelo acumuladas y experiencia reciente del comandante.",
    icon: <UserCheck className="w-5 h-5 text-blue-600" />,
    criteria: [
      { id: "crew_rest", label: "Menos de 8 horas de descanso continuo previo a la presentación", points: 8, category: "human" },
      { id: "crew_duty_24h", label: "Más de 6 horas de vuelo acumuladas en las últimas 24 horas", points: 6, category: "human" },
      { id: "crew_single_pilot", label: "Operación Monopiloto sin copiloto de apoyo u observador HEMS", points: 5, category: "human" },
      { id: "crew_recent_type", label: "Menos de 15 horas de vuelo en el tipo de aeronave en los últimos 90 días", points: 7, category: "human" },
      { id: "crew_fatigue_self", label: "Fatiga percibida o nivel elevado de estrés personal/operativo autorreportado", points: 5, category: "human" },
      { id: "crew_first_route", label: "Primera operación en la ruta o área geográfica no habitual", points: 4, category: "human" },
    ]
  },
  {
    id: "wx",
    title: "2. Condiciones Meteorológicas & Entorno",
    description: "Visibilidad, techo de nubes, vuelo nocturno NVG, ráfagas de viento y fenómenos meteorológicos.",
    icon: <Wind className="w-5 h-5 text-sky-600" />,
    criteria: [
      { id: "wx_night_vfr", label: "Operación Nocturna VFR Noche sin visores nocturnos", points: 7, category: "wx" },
      { id: "wx_night_nvg", label: "Operación Nocturna HEMS con visores nocturnos NVG", points: 8, category: "wx" },
      { id: "wx_ceiling_1000", label: "Techo de nubes inferior a 1000 ft AGL en ruta o destino", points: 9, category: "wx" },
      { id: "wx_ceiling_1500", label: "Techo de nubes entre 1000 y 1500 ft AGL", points: 5, category: "wx" },
      { id: "wx_vis_3000", label: "Visibilidad horizontal inferior a 3000 metros", points: 7, category: "wx" },
      { id: "wx_wind_gusts", label: "Viento cruzado o ráfagas superiores a 25 nudos en helipunto", points: 6, category: "wx" },
      { id: "wx_icing_turb", label: "Pronóstico de formación de hielo en capa baja o turbulencia severa", points: 8, category: "wx" },
    ]
  },
  {
    id: "mission",
    title: "3. Complejidad de la Misión & Helipunto (HELSITE)",
    description: "Tipo de vuelo (HEMS aeromédico), aterrizajes en zonas no preparadas y obstáculos.",
    icon: <MapPin className="w-5 h-5 text-orange-600" />,
    criteria: [
      { id: "mission_hems_crit", label: "Evacuación Aeromédica de Emergencia (HEMS con paciente crítico)", points: 7, category: "mission" },
      { id: "mission_unprepared_lz", label: "Aterrizaje en zona improvisada no preparada (HELSITE / terreno irregular / polvo)", points: 9, category: "mission" },
      { id: "mission_urban_helipad", label: "Helipunto urbano elevado u obstáculos en la trayectoria de despegue/aproximación", points: 6, category: "mission" },
      { id: "mission_high_alt", label: "Operación en alta montaña o gran altitud de densidad (> 5000 ft PA)", points: 7, category: "mission" },
      { id: "mission_overwater", label: "Operación prolongada sobre agua sin flotadores de emergencia o HUET", points: 8, category: "mission" },
    ]
  },
  {
    id: "aircraft",
    title: "4. Estado Técnico de la Aeronave & Performance",
    description: "Diferimientos MEL, reserva de combustible y margen de potencia disponible.",
    icon: <Plane className="w-5 h-5 text-purple-600" />,
    criteria: [
      { id: "ac_mel_deferred", label: "Aeronave operando con elemento diferido según Lista de Equipamiento Mínimo (MEL)", points: 6, category: "aircraft" },
      { id: "ac_fuel_reserves", label: "Autonomía de combustible estimada cercana a la reserva legal (< 45 minutos)", points: 9, category: "aircraft" },
      { id: "ac_power_margin", label: "Margen de potencia disponible en cernido (HIGE vs HOGE < 15%)", points: 6, category: "aircraft" },
      { id: "ac_max_weight", label: "Peso estimado al despegue superior al 95% del Peso Máximo Autorizado (MTOW)", points: 5, category: "aircraft" },
    ]
  }
];

export default function FratPage() {
  const [selectedCriteria, setSelectedCriteria] = useState<Record<string, boolean>>({});
  const [mitigations, setMitigations] = useState<Record<string, string>>({});
  
  // Flight Info Form
  const [picName, setPicName] = useState("");
  const [sicName, setSicName] = useState("");
  const [selectedBase, setSelectedBase] = useState<string>("nunez");
  const [tailNumber, setTailNumber] = useState<string>("BO105");
  const [missionType, setMissionType] = useState<string>("HEMS Aeromédico");
  const [originRoute, setOriginRoute] = useState("");
  const [destinationRoute, setDestinationRoute] = useState("");
  const [etdTime, setEtdTime] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [generalMitigation, setGeneralMitigation] = useState("");

  const toggleCriterion = (id: string) => {
    setSelectedCriteria(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMitigationChange = (id: string, text: string) => {
    setMitigations(prev => ({ ...prev, [id]: text }));
  };

  // Calculate score
  const totalScore = Object.keys(selectedCriteria).reduce((sum, id) => {
    if (!selectedCriteria[id]) return sum;
    for (const cat of FRAT_CATEGORIES) {
      const item = cat.criteria.find(c => c.id === id);
      if (item) return sum + item.points;
    }
    return sum;
  }, 0);

  const getRiskLevel = (score: number) => {
    if (score <= 14) {
      return {
        level: "Riesgo Bajo",
        badge: "bg-emerald-500 text-white border-emerald-600",
        bgLight: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200",
        approvalReq: "Aprobación estándar por el Comandante de Vuelo (PIC).",
        status: "DESPACHO NORMAL AUTORIZADO",
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />
      };
    }
    if (score <= 28) {
      return {
        level: "Riesgo Moderado",
        badge: "bg-amber-500 text-white border-amber-600",
        bgLight: "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200",
        approvalReq: "Requiere Plan de Mitigación obligatorio y Notificación previa al Jefe de Pilotos.",
        status: "AUTORIZADO CON PLAN DE MITIGACIÓN",
        icon: <AlertTriangle className="w-6 h-6 text-amber-600" />
      };
    }
    return {
      level: "ALTO RIESGO",
      badge: "bg-red-600 text-white border-red-700 animate-pulse",
      bgLight: "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-700 text-red-900 dark:text-red-200",
      approvalReq: "VUELO DETENIDO. Se requiere Plan de Mitigación Aprobado y Autorización Expresa Firmada por el Director de Operaciones (DO).",
      status: "VUELO SUSPENDIDO / REQUIERE FIRMA DO",
      icon: <ShieldAlert className="w-6 h-6 text-red-600" />
    };
  };

  const risk = getRiskLevel(totalScore);
  const currentBase = COMPANY_BASES.find(b => b.id === selectedBase) || COMPANY_BASES[0];

  const handleReset = () => {
    setSelectedCriteria({});
    setMitigations({});
    setPicName("");
    setSicName("");
    setOriginRoute("");
    setDestinationRoute("");
    setEtdTime("");
    setGeneralMitigation("");
    setSubmitted(false);
  };

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
            <FileCheck className="w-4 h-4" />
            SMS - Sistema de Gestión de Seguridad Operacional ANAC
          </div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            Evaluación de Riesgos Pre-Vuelo (FRAT)
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Flight Risk Assessment Tool oficial de Modena Air Service para la prevención de incidentes aeronáuticos.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs uppercase hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          REINICIAR EVALUACIÓN
        </button>
      </div>

      {/* Sticky Risk Score Status Bar */}
      <div className="sticky top-4 z-40 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-3xl p-5 shadow-2xl mb-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className={`px-6 py-4 rounded-2xl font-black text-3xl tracking-tighter shadow-md border shrink-0 ${risk.badge}`}>
            {totalScore} PTS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl uppercase tracking-tight text-slate-950 dark:text-white">{risk.level}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${risk.bgLight}`}>
                {risk.status}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 max-w-xl">{risk.approvalReq}</p>
          </div>
        </div>

        <button
          onClick={() => setSubmitted(true)}
          className="w-full lg:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-blue-500/25 transition-all whitespace-nowrap"
        >
          FINALIZAR Y REGISTRAR FRAT
        </button>
      </div>

      {/* Flight Information & Base Selector */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl mb-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-black uppercase text-slate-950 dark:text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-blue-600" />
            1. Datos del Vuelo, Base Operativa y Tripulación
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase">ANAC RAAC 91/135</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
              Base Operativa y Contrato *
            </label>
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-extrabold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            >
              {COMPANY_BASES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} - {b.client} ({b.location})
                </option>
              ))}
            </select>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-1">
              Cliente: {currentBase.client} | {currentBase.description}
            </p>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
              Modelo de Aeronave / Matrícula *
            </label>
            <select
              value={tailNumber}
              onChange={(e) => setTailNumber(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-extrabold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            >
              <option value="BO105">BO105 - MBB (Helicóptero Multipropropósito)</option>
              <option value="AW109">AW109 - AgustaWestland (Bimotor HEMS)</option>
              <option value="RH44">RH44 - Robinson R44</option>
              <option value="BN2B">BN2B - Britten-Norman Islander (Avión)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">
              Tipo de Misión Operacional *
            </label>
            <select
              value={missionType}
              onChange={(e) => setMissionType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-extrabold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            >
              <option value="HEMS Aeromédico">Evacuación Aeromédica HEMS 24/7</option>
              <option value="Traslado Ejecutivo / VIP">Traslado Ejecutivo / VIP</option>
              <option value="Reconocimiento / Inspección">Reconocimiento / Inspección de Campo</option>
              <option value="Instrucción / Vuelo de Prueba">Instrucción / Vuelo de Prueba</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Comandante PIC *</label>
            <input
              type="text"
              placeholder="ej. CAP. GONZALEZ, Carlos"
              value={picName}
              onChange={(e) => setPicName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Copiloto / Tripulante SIC</label>
            <input
              type="text"
              placeholder="ej. CAP. MARTINEZ, Pedro"
              value={sicName}
              onChange={(e) => setSicName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Ruta (Origen a Destino)</label>
            <input
              type="text"
              placeholder="ej. BASE NUÑEZ a HELSITE BUE"
              value={originRoute}
              onChange={(e) => setOriginRoute(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Hora Estimada Despegue (ETD)</label>
            <input
              type="time"
              value={etdTime}
              onChange={(e) => setEtdTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* FRAT Categories Matrix */}
      <div className="space-y-8 mb-10">
        {FRAT_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {category.icon}
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-slate-950 dark:text-white">{category.title}</h3>
                <p className="text-xs font-bold text-slate-500">{category.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              {category.criteria.map((item) => {
                const checked = Boolean(selectedCriteria[item.id]);
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border-2 transition-all p-4 ${
                      checked
                        ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 shadow-sm"
                        : "bg-slate-50/40 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <div
                      onClick={() => toggleCriterion(item.id)}
                      className="flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 shrink-0 transition-colors ${
                            checked ? "bg-amber-500 border-amber-500 text-white" : "border-slate-400"
                          }`}
                        >
                          {checked && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {item.label}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 ${
                          checked
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        +{item.points} PTS
                      </span>
                    </div>

                    {/* Mitigation input field if checked */}
                    {checked && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/60"
                      >
                        <label className="block text-[11px] font-black uppercase text-amber-900 dark:text-amber-200 mb-1">
                          Acción de Mitigación Aplicada para este Riesgo:
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Designación de copiloto de apoyo / Monitoreo continuo de radar meteorológico"
                          value={mitigations[item.id] || ""}
                          onChange={(e) => handleMitigationChange(item.id, e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold text-slate-950 dark:text-white outline-none focus:border-amber-600"
                        />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* General Risk Mitigation & Signature Block */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-3xl mb-8 shadow-sm space-y-4">
        <h3 className="text-base font-black uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          Plan Global de Mitigación de Riesgos & Firma
        </h3>
        <p className="text-xs font-semibold text-slate-500">
          Ingrese los comentarios generales o acciones colectivas tomadas por la tripulación antes del despegue:
        </p>
        <textarea
          rows={3}
          placeholder="ej. Vuelo planificado con margen de combustible de 60 minutos, alternativo asignado SAAR, coordinación con SAME en tierra."
          value={generalMitigation}
          onChange={(e) => setGeneralMitigation(e.target.value)}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
        />
      </div>

      {/* Confirmation & Printable Modal */}
      <AnimatePresence>
        {submitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative my-8"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
                    MAE
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white">
                      COMPROBANTE FRAT OFICIAL - ANAC
                    </h2>
                    <p className="text-xs font-bold text-slate-500 uppercase">MODENA AIR SERVICE | SMS</p>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-2xl font-black text-sm uppercase ${risk.badge}`}>
                  {totalScore} PTS - {risk.level}
                </div>
              </div>

              {/* Printable Body */}
              <div className="space-y-4 text-left mb-8 text-xs font-bold text-slate-800 dark:text-slate-200">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Base y Contrato:</span>
                    <span className="font-extrabold uppercase text-slate-950 dark:text-white">{currentBase.name} ({currentBase.client})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Aeronave:</span>
                    <span className="font-extrabold uppercase text-slate-950 dark:text-white">{tailNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Comandante PIC:</span>
                    <span className="font-extrabold uppercase text-slate-950 dark:text-white">{picName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-black">Misión:</span>
                    <span className="font-extrabold uppercase text-slate-950 dark:text-white">{missionType}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-xs uppercase mb-2 text-slate-500">Criterios de Riesgo Evaluados:</h4>
                  <ul className="space-y-1.5 pl-2">
                    {Object.keys(selectedCriteria).filter(id => selectedCriteria[id]).map(id => {
                      let label = id;
                      for (const cat of FRAT_CATEGORIES) {
                        const match = cat.criteria.find(c => c.id === id);
                        if (match) label = `${match.label} (+${match.points} pts)`;
                      }
                      return (
                        <li key={id} className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                          • {label}
                        </li>
                      );
                    })}
                    {Object.keys(selectedCriteria).filter(id => selectedCriteria[id]).length === 0 && (
                      <li className="text-emerald-600 font-bold">✓ No se identificaron factores de riesgo críticos.</li>
                    )}
                  </ul>
                </div>

                {generalMitigation && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800">
                    <span className="text-[10px] font-black text-blue-600 uppercase block mb-1">Plan de Mitigación Observado:</span>
                    <p className="text-blue-950 dark:text-blue-100">{generalMitigation}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-center mt-6">
                  <div className="p-3 border border-slate-300 dark:border-slate-700 rounded-xl">
                    <div className="h-10 flex items-end justify-center mb-1 border-b border-dashed border-slate-400">
                      <span className="text-[10px] font-mono text-slate-400">Firma Digital PIC</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-600">{picName || "Firma Comandante PIC"}</span>
                  </div>

                  <div className="p-3 border border-slate-300 dark:border-slate-700 rounded-xl">
                    <div className="h-10 flex items-end justify-center mb-1 border-b border-dashed border-slate-400">
                      <span className="text-[10px] font-mono text-slate-400">Aprobación SMS / DO</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-600">Dirección de Operaciones</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-extrabold text-xs uppercase text-slate-900 dark:text-white transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  IMPRIMIR FORMULARIO PDF
                </button>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-extrabold text-xs uppercase shadow-md hover:bg-blue-700"
                >
                  ACEPTAR Y ARCHIVAR
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
