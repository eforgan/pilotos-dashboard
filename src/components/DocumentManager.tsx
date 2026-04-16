"use client";

import React, { useState, useRef } from "react";
import { 
  FileText, Upload, Trash2, Eye, Loader2, 
  CheckCircle, AlertCircle, FilePlus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Document {
  id: string;
  type: string;
  fileUrl: string;
  fileName: string;
  createdAt: string;
}

interface DocumentManagerProps {
  pilotId: string;
  docType: string;
  label: string;
  initialDocuments?: Document[];
}

export default function DocumentManager({ pilotId, docType, label, initialDocuments = [] }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
