"use client";

import React, { useState, useEffect } from "react";
import { getPilots } from "@/lib/utils";
import { Loader2, FileText, CheckCircle, Eye, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PendingDoc {
  pilotId: string;
  pilotName: string;
  docId: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  createdAt: string | Date;
}

export default function AdminDocumentsPage() {
  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const pilots = await getPilots();
        const pending: PendingDoc[] = [];
        
        pilots.forEach(pilot => {
          pilot.documents?.forEach(doc => {
            if (!doc.verified) {
              pending.push({
                pilotId: pilot.id,
                pilotName: pilot.PILOTO,
                docId: doc.id,
                docType: doc.type,
                fileName: doc.fileName,
                fileUrl: doc.fileUrl,
                createdAt: doc.createdAt
              });
            }
          });
        });
        
        // Sort by newest first
        pending.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPendingDocs(pending);
      } catch (err) {
        console.error("Failed to load documents:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleVerify = async (docId: string) => {
    setVerifying(docId);
    try {
      const res = await fetch(`/api/upload/document/${docId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: true })
      });
      if (res.ok) {
        setPendingDocs(prev => prev.filter(d => d.docId !== docId));
      } else {
        alert("Error al verificar");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Buscando Documentos Pendientes...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-2 flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
            Validación Documental
          </h1>
          <p className="text-muted-foreground font-semibold">
            Revisión y aprobación de certificados subidos por la tripulación.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {pendingDocs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Al Día</h3>
                <p className="text-muted-foreground font-medium">No hay documentos pendientes de verificación.</p>
            </div>
        ) : (
            pendingDocs.map((doc, idx) => (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={doc.docId}
                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-xl hover:border-blue-300 transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                    {doc.docType}
                                </span>
                                <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px] sm:max-w-xs">{doc.fileName}</span>
                            </div>
                            <Link href={`/pilot/${doc.pilotId}`} className="flex items-center gap-1.5 text-sm font-bold hover:text-blue-600 transition-colors">
                                <User className="w-4 h-4" />
                                {doc.pilotName}
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a 
                            href={doc.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            VER DOCUMENTO
                        </a>
                        <button 
                            onClick={() => handleVerify(doc.docId)}
                            disabled={verifying === doc.docId}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
                        >
                            {verifying === doc.docId ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            {verifying === doc.docId ? "APROBANDO..." : "APROBAR"}
                        </button>
                    </div>
                </motion.div>
            ))
        )}
      </div>
    </div>
  );
}
