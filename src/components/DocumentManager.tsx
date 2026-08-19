"use client";

import React, { useState, useRef } from "react";
import { 
  FileText, Eye, Loader2, FilePlus, CheckCircle, Clock 
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface Document {
  id: string;
  type: string;
  fileUrl: string;
  fileName: string;
  createdAt: string | Date;
  verified?: boolean;
}

interface DocumentManagerProps {
  pilotId: string;
  docType: string;
  label: string;
  initialDocuments?: Document[];
}

export default function DocumentManager({ pilotId, docType, label, initialDocuments = [] }: DocumentManagerProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerify = async (docId: string, currentStatus: boolean) => {
    setVerifying(docId);
    try {
      const res = await fetch(`/api/upload/document/${docId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !currentStatus })
      });
      if (res.ok) {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, verified: !currentStatus } : d));
      } else {
        alert("Error al verificar");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pilotId", pilotId);
    formData.append("type", docType);

    try {
      const res = await fetch("/api/upload/document", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newDoc = await res.json();
        setDocuments(prev => [...prev, newDoc]);
      } else {
        alert("Error al subir el documento");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black uppercase tracking-tight">{label}</span>
        </div>
        <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm disabled:opacity-50"
        >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus className="w-4 h-4" />}
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <div className="space-y-2">
        {documents.filter(d => d.type === docType).map((doc) => (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            key={doc.id}
            className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-xs shadow-sm hover:border-blue-200"
          >
            <div className="flex items-center gap-2 truncate pr-2">
                <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium">{doc.fileName}</span>
            </div>
            <div className="flex items-center gap-1">
                {isAdmin ? (
                    <button 
                        onClick={() => handleVerify(doc.id, !!doc.verified)}
                        disabled={verifying === doc.id}
                        className={`p-1.5 rounded-lg transition-colors ${
                            doc.verified 
                            ? "text-green-600 bg-green-50 hover:bg-green-100" 
                            : "text-slate-400 bg-slate-50 hover:bg-slate-100"
                        }`}
                        title={doc.verified ? "Marcado como verificado" : "Marcar como verificado"}
                    >
                        {verifying === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                ) : (
                    <div 
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            doc.verified 
                            ? "text-green-600 bg-green-50 border border-green-100 dark:bg-green-900/20 dark:border-green-800" 
                            : "text-slate-500 bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                    >
                        {doc.verified ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {doc.verified ? "Aprobado" : "Pendiente"}
                    </div>
                )}
                <a 
                    href={doc.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 dark:text-blue-400"
                    title="Ver documento"
                >
                    <Eye className="w-4 h-4" />
                </a>
            </div>
          </motion.div>
        ))}

        {documents.filter(d => d.type === docType).length === 0 && (
            <div className="py-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sin documentos cargados</p>
            </div>
        )}
      </div>
    </div>
  );
}
