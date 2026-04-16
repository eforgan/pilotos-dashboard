"use client";

import React, { useState, useRef } from "react";
import { Camera, Loader2, User, X } from "lucide-react";
import { updatePilot } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoUploadProps {
  pilotId: string;
  currentImage?: string | null;
  onUploadComplete: (newUrl: string) => void;
}

export default function PhotoUpload({ pilotId, currentImage, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload logic
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pilotId", pilotId);

    try {
      const res = await fetch("/api/upload/profile-photo", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onUploadComplete(data.url);
      } else {
        alert("Error al subir la imagen");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group w-32 h-32 mx-auto mb-6">
      <div className="w-full h-full rounded-3xl bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden relative">
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <User className="w-12 h-12" />
          </div>
        )}
        
        <AnimatePresence>
            {uploading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"
                >
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all group-hover:scale-110 active:scale-95"
      >
        <Camera className="w-5 h-5" />
      </button>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
        accept="image/*"
      />
    </div>
  );
}
