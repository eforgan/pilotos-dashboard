"use client";

import React, { useState, useRef } from "react";
import { Camera, Loader2, User, UploadCloud, Info, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PhotoUploadProps {
  pilotId: string;
  currentImage?: string | null;
  onUploadComplete: (newUrl: string | null) => void;
}

export default function PhotoUpload({ pilotId, currentImage, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file) return;

    // Client-side validation: must be an image
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (JPG, PNG, WEBP).");
      return;
    }

    // Client-side validation: max size 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo excede el tamaño máximo permitido de 5 MB.");
      return;
    }

    // Client-side instant preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
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
        alert("Error al subir la foto de perfil.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Desea eliminar la foto de perfil actual?")) return;
    setPreview(null);
    onUploadComplete(null);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-700 shadow-md">
      {/* Square Upload Box */}
      <div className="relative group shrink-0">
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-44 h-44 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col items-center justify-center border-4 ${
            isDragging 
              ? "border-blue-600 bg-blue-50 dark:bg-blue-950/80 scale-105" 
              : "border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:border-blue-500 shadow-lg"
          }`}
        >
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img 
              src={preview} 
              alt="Foto de perfil del piloto" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors">
              <User className="w-16 h-16 mb-2 stroke-[1.5]" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Subir Foto
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                Haz clic o arrastra
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-xs">
            <Camera className="w-8 h-8 mb-1" />
            <span className="text-xs font-black uppercase tracking-wider">
              {preview ? "Cambiar Foto" : "Cargar Foto"}
            </span>
          </div>

          {/* Uploading Spinner */}
          <AnimatePresence>
            {uploading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-10 backdrop-blur-sm"
              >
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                <span className="text-xs font-black uppercase">Subiendo...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Badge Button */}
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-2 -right-2 w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 active:scale-95 border-2 border-white dark:border-slate-900"
          title="Seleccionar foto de perfil"
        >
          <UploadCloud className="w-5 h-5" />
        </button>

        {/* Remove Photo Button */}
        {preview && (
          <button 
            type="button"
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="absolute -top-2 -left-2 w-9 h-9 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-110 border-2 border-white dark:border-slate-900"
            title="Eliminar foto de perfil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden" 
          accept="image/png, image/jpeg, image/webp"
        />
      </div>

      {/* Profile Photo Instructions */}
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2 border-b-2 border-slate-200 dark:border-slate-700 pb-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <h3 className="font-black text-sm uppercase tracking-wider text-slate-950 dark:text-white">
            Instrucciones para Carga de Foto de Perfil
          </h3>
        </div>
        
        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-bold">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-black">•</span>
            <span><strong className="text-slate-950 dark:text-white">Proporción Cuadrada (1:1):</strong> Se recomienda formato de aspecto 1:1 (ej: 400×400 px o 500×500 px).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-black">•</span>
            <span><strong className="text-slate-950 dark:text-white">Formatos Permitidos:</strong> Archivos de imagen JPG, PNG o WEBP (Tamaño máximo: 5 MB).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-black">•</span>
            <span><strong className="text-slate-950 dark:text-white">Requisitos de Imagen:</strong> Rostro de frente, centrado y bien iluminado sobre fondo claro para legajo digital ANAC.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 font-black">•</span>
            <span><strong className="text-slate-950 dark:text-white">Forma de Carga:</strong> Haz clic en el recuadro cuadrado o arrastra el archivo de imagen directamente sobre la caja.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
