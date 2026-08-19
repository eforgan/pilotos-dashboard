"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Pilot, COMPANY_BASES } from "@/lib/types";
import { getPilots, filterByAircraft } from "@/lib/utils";
import { Copy, Check, ExternalLink, ShieldCheck, MessageSquare, Mail, Sparkles, Plus, Trash2, X, Loader2, UserPlus, Users, Send, Filter, Layers, Plane, MapPin } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminInvitesPage() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Group Broadcast State
  const [groupType, setGroupType] = useState<"all" | "base" | "aircraft">("all");
  const [selectedBaseGroup, setSelectedBaseGroup] = useState<string>("Base Núñez");
  const [selectedAircraftGroup, setSelectedAircraftGroup] = useState<string>("BO105");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("course_iimc");
  
  const [broadcastSubject, setBroadcastSubject] = useState("MODENA AIR SERVICE - Presentación Curso Online Vuelo Instrumental Inadvertido");
  const [broadcastMessage, setBroadcastMessage] = useState(
    "Estimado/a {PILOTO},\n\nme estoy comunicando con vos para presentarte un curso online de Vuelo Instrumental Inadvertido en Helicóptero.\n\nUna vez finalizado me gustaría tener tu opinión.\n\n👉 Acceso al Curso en la Biblioteca Técnica:\nhttps://pilotos-dashboard.vercel.app/manuals\n\nAtentamente,\nDirección de Operaciones\nModena Air Service"
  );
  const [copiedBcc, setCopiedBcc] = useState(false);
  const [copiedPhones, setCopiedPhones] = useState(false);

  const applyTemplate = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey === "course_iimc") {
      setBroadcastSubject("MODENA AIR SERVICE - Presentación Curso Online Vuelo Instrumental Inadvertido");
      setBroadcastMessage(
        "Estimado/a {PILOTO},\n\nme estoy comunicando con vos para presentarte un curso online de Vuelo Instrumental Inadvertido en Helicóptero.\n\nUna vez finalizado me gustaría tener tu opinión.\n\n👉 Acceso al Curso en la Biblioteca Técnica:\nhttps://pilotos-dashboard.vercel.app/manuals\n\nAtentamente,\nDirección de Operaciones\nModena Air Service"
      );
    } else if (templateKey === "invite_register") {
      setBroadcastSubject("MODENA AIR SERVICE - Invitación a Activar su Legajo Digital de Piloto");
      setBroadcastMessage(
        "Estimado/a {PILOTO},\n\nLe enviamos su enlace de acceso exclusivo para registrarse y verificar su Legajo Digital de Tripulante en el nuevo Panel de Pilotos.\n\nA través del siguiente enlace podrá acceder a su formulario interactivo:\n👉 {LINK}\n\nAtentamente,\nDepartamento de Seguridad y Operaciones\nModena Air Service"
      );
    } else if (templateKey === "alert_notice") {
      setBroadcastSubject("MODENA AIR SERVICE - Aviso de Vencimiento de Certificaciones ANAC");
      setBroadcastMessage(
        "Estimado/a {PILOTO},\n\nLe solicitamos revisar el estado de sus certificaciones normativas (CMA, Licencia ANAC, Control Bienal) para mantener la vigencia operacional de la flota.\n\nAtentamente,\nDirección de Operaciones\nModena Air Service"
      );
    }
  };

  const [newPilot, setNewPilot] = useState({
    PILOTO: "",
    DNI: "",
    EMAIL: "",
    TELEFONO: "",
    BASE: "",
    LICENCIA: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPilots();
        setPilots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCopy = (token: string, id: string) => {
    const url = `${window.location.origin}/register/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatWhatsAppPhone = (phoneStr?: string | null): string => {
    if (!phoneStr) return "";
    let digits = phoneStr.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("11") || digits.startsWith("15")) {
      digits = "549" + digits;
    } else if (digits.startsWith("911")) {
      digits = "54" + digits;
    } else if (!digits.startsWith("54") && digits.length <= 10) {
      digits = "549" + digits;
    }
    return digits;
  };

  // Filter pilots for group communications
  const targetPilots = useMemo(() => {
    if (groupType === "all") return pilots;
    if (groupType === "base") {
      return pilots.filter((p) =>
        (p.BASE || "").toUpperCase().includes(selectedBaseGroup.toUpperCase())
      );
    }
    if (groupType === "aircraft") {
      return filterByAircraft(pilots, selectedAircraftGroup);
    }
    return pilots;
  }, [pilots, groupType, selectedBaseGroup, selectedAircraftGroup]);

  // Mass Email via Mailto BCC
  const handleMassEmailBcc = () => {
    const emails = targetPilots.map((p) => (p.EMAIL || "").trim()).filter(Boolean);
    if (!emails.length) {
      alert("No hay correos electrónicos registrados para los pilotos de este grupo.");
      return;
    }
    const bccString = emails.join(",");
    const subject = encodeURIComponent(broadcastSubject);
    const samplePilot = targetPilots[0];
    const sampleBody = broadcastMessage
      .replace(/\{PILOTO\}/g, samplePilot?.PILOTO || "Tripulante")
      .replace(/\(nombre y apellido\)/gi, samplePilot?.PILOTO || "Tripulante")
      .replace(/\{LINK\}/g, `${window.location.origin}/register/${samplePilot?.inviteToken || ""}`);
    
    const body = encodeURIComponent(sampleBody);

    if (bccString.length > 1500) {
      alert(
        `El grupo contiene ${emails.length} correos. Se ha copiado la lista en CCO (BCC) al portapapeles para pegarla en su cliente de correo.`
      );
      navigator.clipboard.writeText(emails.join("; "));
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else {
      window.location.href = `mailto:?bcc=${bccString}&subject=${subject}&body=${body}`;
    }
  };

  // Copy Mass Email List
  const handleCopyMassEmails = () => {
    const emails = targetPilots.map((p) => (p.EMAIL || "").trim()).filter(Boolean);
    if (!emails.length) {
      alert("No hay correos registrados en este grupo.");
      return;
    }
    navigator.clipboard.writeText(emails.join("; "));
    setCopiedBcc(true);
    setTimeout(() => setCopiedBcc(false), 2500);
  };

  // Copy Mass WhatsApp Phones / Links with Personalized Text
  const handleCopyMassPhones = () => {
    const items = targetPilots
      .map((p) => {
        const phone = formatWhatsAppPhone(p.TELEFONO);
        const registerUrl = `${window.location.origin}/register/${p.inviteToken || ""}`;
        const formattedMsg = broadcastMessage
          .replace(/\{PILOTO\}/g, p.PILOTO)
          .replace(/\(nombre y apellido\)/gi, p.PILOTO)
          .replace(/\{LINK\}/g, registerUrl);

        return phone 
          ? `${p.PILOTO} (${phone}): https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(formattedMsg)}` 
          : null;
      })
      .filter(Boolean);

    if (!items.length) {
      alert("No hay números de teléfono registrados para este grupo.");
      return;
    }
    navigator.clipboard.writeText(items.join("\n\n"));
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2500);
  };

  const handleOpenEmail = (pilot: Pilot) => {
    const email = (pilot.EMAIL || "").trim();
    const registerUrl = `${window.location.origin}/register/${pilot.inviteToken || ""}`;
    const formattedBody = broadcastMessage
      .replace(/\{PILOTO\}/g, pilot.PILOTO)
      .replace(/\(nombre y apellido\)/gi, pilot.PILOTO)
      .replace(/\{LINK\}/g, registerUrl);

    const subject = encodeURIComponent(broadcastSubject);
    const body = encodeURIComponent(formattedBody);

    if (!email) {
      alert(`El piloto "${pilot.PILOTO}" no tiene email asignado. Se ha copiado el mensaje al portapapeles.`);
      navigator.clipboard.writeText(formattedBody);
      return;
    }

    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const handleOpenWhatsApp = (pilot: Pilot) => {
    const phone = formatWhatsAppPhone(pilot.TELEFONO);
    const registerUrl = `${window.location.origin}/register/${pilot.inviteToken || ""}`;
    const formattedMsg = broadcastMessage
      .replace(/\{PILOTO\}/g, pilot.PILOTO)
      .replace(/\(nombre y apellido\)/gi, pilot.PILOTO)
      .replace(/\{LINK\}/g, registerUrl);

    const encoded = encodeURIComponent(formattedMsg);

    const waUrl = phone 
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleCreatePilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPilot.PILOTO.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/pilots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPilot),
      });

      if (res.ok) {
        const created = await res.json();
        setPilots(prev => [created, ...prev]);
        setShowAddModal(false);
        setNewPilot({ PILOTO: "", DNI: "", EMAIL: "", TELEFONO: "", BASE: "", LICENCIA: "" });
      } else {
        const errData = await res.json();
        alert(errData.error || "Error al registrar el piloto");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar el piloto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePilot = async (id: string, name: string) => {
    if (!confirm(`¿Está seguro de eliminar permanentemente al piloto "${name}" y todos sus legajos/documentos?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/pilots/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPilots(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Error al eliminar el piloto.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="p-20 text-center text-slate-400 animate-pulse font-black tracking-widest uppercase">
      Cargando Enlaces e Invitaciones de Tripulación...
    </div>
  );

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 text-xs font-black rounded-full uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Centro de Envío de Comunicaciones
          </div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter text-slate-950 dark:text-white">
            Invitaciones y Registros de Pilotos
          </h1>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Envíe enlaces por Email o WhatsApp a los pilotos para que actualicen sus datos y activen su usuario.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase rounded-2xl transition-all shadow-lg shadow-blue-500/25"
          >
            <UserPlus className="w-4 h-4" />
            Registrar Nuevo Piloto
          </button>
          
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-3 px-4 rounded-2xl flex items-center gap-3 shadow-md">
            <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Total Pilotos</p>
              <p className="text-sm font-black text-slate-950 dark:text-white">{pilots.length} Enlaces</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mass Group Broadcast Panel */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div>
            <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              Centro de Envíos Masivos & Comunicados Grupales
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
              Envíe mensajes o correos masivos filtrando por Todos los Pilotos, Base Operativa o Modelo de Aeronave.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-4 py-2 rounded-2xl border border-blue-200 dark:border-blue-800">
            <Send className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black uppercase text-blue-900 dark:text-blue-200">
              Destinatarios: <strong>{targetPilots.length} Pilotos</strong>
            </span>
          </div>
        </div>

        {/* Group Selector Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> 1. Seleccionar Criterio de Grupo
            </label>
            <select
              value={groupType}
              onChange={(e) => setGroupType(e.target.value as "all" | "base" | "aircraft")}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-extrabold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            >
              <option value="all">👥 Todos los Pilotos ({pilots.length})</option>
              <option value="base">📍 Por Base Operativa Específica</option>
              <option value="aircraft">✈️ Por Modelo de Aeronave / Helicóptero</option>
            </select>
          </div>

          {groupType === "base" && (
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> 2. Filtrar por Base
              </label>
              <select
                value={selectedBaseGroup}
                onChange={(e) => setSelectedBaseGroup(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-extrabold text-slate-950 dark:text-white outline-none focus:border-blue-600"
              >
                <option value="Base Núñez">Base Núñez (SAME AÉREO)</option>
                <option value="Base Rosario">Base Rosario (UTV)</option>
                <option value="Base Neuquén">Base Neuquén (Vista Energy)</option>
                <option value="Base Cabo Vírgenes">Base Cabo Vírgenes (PSM)</option>
                <option value="Base Sierra Grande">Base Sierra Grande (YPF Vmos)</option>
                <option value="Base El Calafate">Base El Calafate (Solo Patagonia)</option>
              </select>
            </div>
          )}

          {groupType === "aircraft" && (
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase mb-1 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-purple-600" /> 2. Filtrar por Modelo de Aeronave
              </label>
              <select
                value={selectedAircraftGroup}
                onChange={(e) => setSelectedAircraftGroup(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-extrabold text-slate-950 dark:text-white outline-none focus:border-blue-600"
              >
                <option value="BO105">BO105 (Multipropósito)</option>
                <option value="AW109">AW109 (AgustaWestland)</option>
                <option value="RH44">RH44 (Robinson R44)</option>
                <option value="BN2B">BN2B (Britten-Norman Islander)</option>
              </select>
            </div>
          )}
        </div>

        {/* Template Selector Dropdown */}
        <div className="mb-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-black uppercase text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" /> Cargar Plantilla Predefinida de Mensaje:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applyTemplate("course_iimc")}
              className={`p-3 rounded-xl border-2 text-left font-black text-xs transition-all ${
                selectedTemplate === "course_iimc"
                  ? "bg-blue-600 border-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500"
              }`}
            >
              🎓 Curso Vuelo Instrumental Inadvertido (IIMC)
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("invite_register")}
              className={`p-3 rounded-xl border-2 text-left font-black text-xs transition-all ${
                selectedTemplate === "invite_register"
                  ? "bg-blue-600 border-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500"
              }`}
            >
              📑 Invitación a Legajo Digital
            </button>
            <button
              type="button"
              onClick={() => applyTemplate("alert_notice")}
              className={`p-3 rounded-xl border-2 text-left font-black text-xs transition-all ${
                selectedTemplate === "alert_notice"
                  ? "bg-blue-600 border-blue-600 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-blue-500"
              }`}
            >
              ⚠️ Aviso de Vencimientos ANAC
            </button>
          </div>
        </div>

        {/* Message Content Customization */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Asunto del Comunicado / Email</label>
            <input
              type="text"
              value={broadcastSubject}
              onChange={(e) => setBroadcastSubject(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase mb-1">Mensaje / Comunicado Oficial</label>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Group Broadcast Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-400">Pilotos Seleccionados:</span>
            <span className="text-xs font-black uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-slate-700 dark:text-slate-200">
              {targetPilots.length} de {pilots.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Email Mass Action */}
            <button
              onClick={handleMassEmailBcc}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl transition-all shadow-md"
              title="Abrir cliente de correo enviando CCO masivo al grupo filtrado"
            >
              <Mail className="w-4 h-4" />
              Enviar Email Masivo (CCO)
            </button>

            {/* Copy Emails */}
            <button
              onClick={handleCopyMassEmails}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
            >
              {copiedBcc ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedBcc ? "COPIADOS" : "Copiar Emails del Grupo"}
            </button>

            {/* Copy WhatsApp Phones */}
            <button
              onClick={handleCopyMassPhones}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-md"
              title="Copiar lista de enlaces y teléfonos formateados para difusión de WhatsApp"
            >
              {copiedPhones ? <Check className="w-4 h-4 text-white" /> : <MessageSquare className="w-4 h-4" />}
              {copiedPhones ? "TELÉFONOS COPIADOS" : "Copiar Difusión WhatsApp"}
            </button>
          </div>
        </div>
      </div>

      {/* Invitation Cards Grid */}
      <div className="grid gap-4">
        {pilots.map((pilot, idx) => {
          const isRegistered = Boolean(pilot.user);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              key={pilot.id}
              className="group bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xl hover:border-blue-500 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm border border-blue-800">
                  {pilot.PILOTO.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg uppercase tracking-tight text-slate-950 dark:text-white">{pilot.PILOTO}</h3>
                    {isRegistered ? (
                      <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-[10px] font-black uppercase rounded-full">
                        Registrado ✓
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase rounded-full">
                        Pendiente ⚡
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>DNI: <strong className="text-slate-950 dark:text-white">{pilot.DNI || "—"}</strong></span>
                    <span>•</span>
                    <span>Email: <strong className="text-slate-950 dark:text-white">{pilot.EMAIL || "Sin email"}</strong></span>
                    <span>•</span>
                    <span>Base: <strong className="text-slate-950 dark:text-white">{pilot.BASE || "—"}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Email Action */}
                <button 
                  onClick={() => handleOpenEmail(pilot)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 hover:bg-blue-600 hover:text-white text-xs font-black rounded-xl transition-all shadow-xs"
                  title="Enviar correo de invitación personalizado"
                >
                  <Mail className="w-4 h-4" />
                  Enviar Email
                </button>

                {/* Copy Link */}
                <button 
                  onClick={() => handleCopy(pilot.inviteToken || "", pilot.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-black text-xs transition-all ${
                    copiedId === pilot.id 
                      ? "bg-emerald-600 text-white" 
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-950 hover:text-white text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700"
                  }`}
                >
                  {copiedId === pilot.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedId === pilot.id ? "COPIADO" : "COPIAR ENLACE"}
                </button>
                
                {/* WhatsApp */}
                <button 
                  onClick={() => handleOpenWhatsApp(pilot)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition-all text-xs font-black shadow-xs"
                  title="Enviar por WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  WhatsApp
                </button>

                {/* External Link */}
                <Link 
                  href={`/register/${pilot.inviteToken}`}
                  target="_blank"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all border border-slate-300 dark:border-slate-700"
                  title="Probar vista del formulario"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>

                {/* Delete Pilot */}
                <button
                  onClick={() => handleDeletePilot(pilot.id, pilot.PILOTO)}
                  disabled={deletingId === pilot.id}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-200 dark:border-red-800 disabled:opacity-50"
                  title="Eliminar piloto"
                >
                  {deletingId === pilot.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add New Pilot Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white mb-1 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-600" />
                Registrar Nuevo Piloto
              </h2>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6">
                Complete los datos principales. Se generará automáticamente un enlace exclusivo de invitación.
              </p>

              <form onSubmit={handleCreatePilot} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. GONZALEZ, Carlos"
                    value={newPilot.PILOTO}
                    onChange={(e) => setNewPilot(prev => ({ ...prev, PILOTO: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">DNI</label>
                    <input
                      type="text"
                      placeholder="ej. 30123456"
                      value={newPilot.DNI}
                      onChange={(e) => setNewPilot(prev => ({ ...prev, DNI: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">Base de Operaciones</label>
                    <select
                      value={newPilot.BASE}
                      onChange={(e) => setNewPilot(prev => ({ ...prev, BASE: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                    >
                      <option value="">Seleccionar Base...</option>
                      <option value="Base Núñez">Base Núñez (SAME AÉREO)</option>
                      <option value="Base Rosario">Base Rosario (UTV)</option>
                      <option value="Base Neuquén">Base Neuquén (Vista Energy)</option>
                      <option value="Base Cabo Vírgenes">Base Cabo Vírgenes (PSM)</option>
                      <option value="Base Sierra Grande">Base Sierra Grande (YPF Vmos)</option>
                      <option value="Base El Calafate">Base El Calafate (Solo Patagonia)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="piloto@empresa.com"
                    value={newPilot.EMAIL}
                    onChange={(e) => setNewPilot(prev => ({ ...prev, EMAIL: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">Teléfono</label>
                    <input
                      type="text"
                      placeholder="+54 9 11..."
                      value={newPilot.TELEFONO}
                      onChange={(e) => setNewPilot(prev => ({ ...prev, TELEFONO: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1">N° Licencia ANAC</label>
                    <input
                      type="text"
                      placeholder="ej. TLA-12345"
                      value={newPilot.LICENCIA}
                      onChange={(e) => setNewPilot(prev => ({ ...prev, LICENCIA: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-950 dark:text-white outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-extrabold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {submitting ? "GUARDANDO..." : "CREAR Y GENERAR ENLACE"}
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
