"use client";

import React, { useState, useEffect } from "react";
import { Pilot } from "@/lib/types";
import { getPilots } from "@/lib/utils";
import { Copy, Check, ExternalLink, ShieldCheck, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminInvitesPage() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  if (loading) return <div className="p-20 text-center text-muted-foreground animate-pulse font-bold tracking-widest uppercase">Cargando Invitaciones...</div>;

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-2">Centro de Invitaciones</h1>
          <p className="text-muted-foreground font-semibold">Genera y distribuye enlaces de registro para la tripulación.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <div>
                <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Estado del Sistema</p>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Invitaciones Activas ({pilots.length})</p>
            </div>
        </div>
      </div>

      <div className="grid gap-4">
        {pilots.map((pilot, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={pilot.id}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-xl hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400">
                    {pilot.PILOTO.charAt(0)}
                </div>
                <div>
                    <h3 className="font-black text-lg uppercase tracking-tight">{pilot.PILOTO}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase">{pilot.DNI ? `DNI: ${pilot.DNI}` : "Sin DNI registrado"}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <button 
                    onClick={() => handleCopy(pilot.inviteToken || "", pilot.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        copiedId === pilot.id 
                        ? "bg-green-500 text-white" 
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-blue-600"
                    }`}
                >
                    {copiedId === pilot.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedId === pilot.id ? "COPIADO" : "COPIAR ENLACE"}
                </button>
                
                <a 
                    href={`https://wa.me/${pilot.TELEFONO?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${pilot.PILOTO}, por favor regístrate en el nuevo Panel de Pilotos usando este enlace: ${window.location.origin}/register/${pilot.inviteToken}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-all shadow-sm"
                    title="Enviar por WhatsApp"
                >
                    <MessageSquare className="w-5 h-5" />
                </a>

                <Link 
                    href={`/register/${pilot.inviteToken}`}
                    target="_blank"
                    className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Ver página de registro"
                >
                    <ExternalLink className="w-5 h-5" />
                </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
