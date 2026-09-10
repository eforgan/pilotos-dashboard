"use client";

import React, { useState } from "react";
import { BookOpen, Plane, AlertTriangle, ShieldCheck, FileText, ChevronRight, X, Download, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ManualItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  updatedAt: string;
  version: string;
  sections: { title: string; content: string }[];
}

function downloadManual(manual: ManualItem) {
  const lines = [
    manual.title,
    `Versión: ${manual.version} | Actualizado: ${manual.updatedAt}`,
    "",
    manual.description,
    "",
    ...manual.sections.flatMap((sec) => [sec.title, sec.content, ""]),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${manual.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ManualsPage() {
  const [selectedManual, setSelectedManual] = useState<ManualItem | null>(null);

  const manuals: ManualItem[] = [
    {
      id: "sistema",
      title: "Manual del Sistema — Pilotos Dashboard",
      description: "Guía completa de la estructura, organización y operación de la plataforma: roles de usuario, módulos, flujos de trabajo y funcionalidades disponibles para cada perfil.",
      icon: <Layers className="w-6 h-6" />,
      color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20",
      updatedAt: "2026-09-10",
      version: "v1.0 Interno",
      sections: [
        {
          title: "1. Qué es Pilotos Dashboard",
          content: "Plataforma digital de Modena Air Service para la gestión integral de la tripulación: legajos digitales, vencimientos normativos ANAC, evaluación de riesgos pre-vuelo (FRAT), horas de vuelo (logbook), gestión de flota y biblioteca técnica centralizada. Funciona como aplicación web y también como app instalable (PWA) en computadora o celular."
        },
        {
          title: "2. Roles de Usuario y Permisos",
          content: "Existen tres roles: ADMIN (acceso total: gestiona pilotos, usuarios, flota, auditoría y configuración), BASE_SUPERVISOR (ve y edita únicamente los pilotos de la base que tiene asignada) y PILOT (accede solo a su propio legajo, FRAT, logbook y biblioteca técnica). Los permisos se validan en el servidor en cada operación, no solo en la pantalla."
        },
        {
          title: "3. Inicio de Sesión y Cuentas",
          content: "El acceso es con email o DNI y contraseña. Las cuentas nuevas se crean por invitación desde el Panel de Administración (solo ADMIN), que genera un enlace de alta para el piloto o supervisor. En el primer ingreso, el sistema exige cambiar la contraseña provisoria."
        },
        {
          title: "4. Panel de Control de Tripulación (Dashboard)",
          content: "Pantalla principal para ADMIN y BASE_SUPERVISOR. Muestra el resumen general de la flota, vista de tarjetas o calendario de vencimientos, buscador por nombre/DNI/base/licencia, filtros por base y por aeronave, matriz de cobertura por base, gráfico de tendencia de vencimientos y un banner de alerta cuando hay certificados en estado crítico. Incluye exportación a Excel y, para ADMIN, importación masiva por CSV."
        },
        {
          title: "5. Legajo Digital del Piloto",
          content: "Ficha individual de cada piloto con sus 13 campos de habilitación (licencia, CMA, control bienal, inspección de reconocimiento, simulador, control de idoneidad y de ruta, CRM/FFHH, mercancías peligrosas, interferencia ilícita, MOE, SMS, curso de aeronave) y su historial. Cada certificado admite la carga del documento respaldatorio (PDF/imagen), que se guarda en almacenamiento en la nube (Vercel Blob), y puede ser verificado con firma digital por un ADMIN o supervisor."
        },
        {
          title: "6. Alertas ANAC y Vencimientos",
          content: "Sección dedicada a los certificados próximos a vencer, con semáforo de estado (crítico: menos de 30 días; aviso: 30 a 60 días; ok; no aplica). Un proceso automático diario revisa toda la flota y envía notificaciones por email y, a quienes lo activaron, notificación push directa al dispositivo cuando hay alertas críticas o próximas."
        },
        {
          title: "7. FRAT — Evaluación de Riesgos Pre-Vuelo",
          content: "Formulario guiado (tipo entrenamiento u operación diaria) que calcula un puntaje de riesgo inicial y final según las respuestas del piloto al mando, permite registrar mitigaciones, firma digital del PIC y genera un reporte en PDF. Queda almacenado con fecha, base, aeronave y tripulación."
        },
        {
          title: "8. Logbook y Horas de Vuelo",
          content: "Registro de vuelos realizados por piloto: fecha, aeronave, matrícula, ruta, horas diurnas, nocturnas e IFR, y aterrizajes. Los datos se guardan de forma permanente en la base de datos (no en el navegador) y cada registro puede exportarse a PDF individualmente."
        },
        {
          title: "9. Gestión de Flota — Bases y Aeronaves",
          content: "Sección exclusiva de ADMIN para administrar las bases operativas (nombre, cliente/contrato, ubicación, descripción) y las aeronaves asignadas a cada una (modelo y matrícula), sin necesidad de un nuevo despliegue técnico. Estos datos alimentan automáticamente la matriz de cobertura del dashboard y los selectores del formulario FRAT."
        },
        {
          title: "10. Biblioteca Técnica (Manuales)",
          content: "Repositorio centralizado de manuales y procedimientos operativos normativos (este manual incluido), organizados en tarjetas con lector integrado por secciones y descarga del contenido completo."
        },
        {
          title: "11. Auditoría (solo ADMIN)",
          content: "Historial de cambios sensibles del sistema: quién editó qué dato de un piloto, quién verificó un documento y quién generó una invitación, con fecha y detalle del cambio (diff). Permite trazabilidad completa ante cualquier consulta operativa o normativa."
        },
        {
          title: "12. Administración de Usuarios e Invitaciones",
          content: "Panel donde ADMIN da de alta nuevas cuentas (piloto o supervisor de base), asigna la base correspondiente a cada supervisor y gestiona el estado de las cuentas existentes."
        },
        {
          title: "13. Notificaciones",
          content: "El sistema avisa por email (a través de Resend) y por notificación push del navegador/celular (previa activación desde el botón 'Activar Notificaciones' en el menú lateral) cuando un certificado entra en estado de alerta. El aviso por WhatsApp está previsto pero aún no integrado con un proveedor externo."
        },
        {
          title: "14. Aplicación Instalable (PWA)",
          content: "Pilotos Dashboard puede instalarse como aplicación en la pantalla de inicio del celular o como programa de escritorio, desde el navegador ('Instalar aplicación' / 'Agregar a pantalla de inicio'). Una vez instalada, permite recibir notificaciones push igual que una app nativa."
        },
        {
          title: "15. Modo Claro / Oscuro",
          content: "El ícono de sol/luna en el menú lateral cambia el tema visual de toda la aplicación y guarda la preferencia del usuario para las próximas veces que ingrese."
        },
        {
          title: "16. Seguridad de los Datos",
          content: "Las contraseñas se almacenan encriptadas, cada acción del servidor valida el rol y la base asignada del usuario antes de responder, los documentos se guardan en almacenamiento en la nube (no en el servidor de la aplicación) y la información opera sobre una base de datos de producción con respaldo continuo."
        }
      ]
    },
    {
      id: "hems-nvg",
      title: "Manual HEMS / NVG",
      description: "Procedimientos Operativos Estandarizados (SOP) para misiones de evacuación aeromédica (HEMS) y vuelo nocturno con visores de visión nocturna (NVG).",
      icon: <Plane className="w-6 h-6" />,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20",
      updatedAt: "2024-03-15",
      version: "v2.1 ANAC",
      sections: [
        {
          title: "1. Misiones Aeromédicas HEMS",
          content: "Planificación de vuelo de respuesta rápida, zonas de aterrizaje no preparadas (HELSITE), comunicación directa con equipo médico de tierra y margen de performance HOGE/HIGE."
        },
        {
          title: "2. Operaciones con Visores Nocturnos (NVG)",
          content: "Chequeo pre-vuelo de tubos intensificadores Gen III, iluminación de cabina compatible NVG, técnicas de barrido visual en baja cota y límites meteorológicos (mínimo 1500m visibilidad)."
        },
        {
          title: "3. Procedimientos de Emergencia",
          content: "Recuperación ante desorientación espacial (IIMC), fallo de iluminación de cabina durante vuelo NVG y aterrizaje precautorio en helisitie desprotegido."
        }
      ]
    },
    {
      id: "moe",
      title: "Manual de Mantenimiento (MOE)",
      description: "Directrices, intervalos de inspección periódica y procedimientos de mantenimiento aprobados por la autoridad aeronáutica (ANAC).",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "bg-green-50 text-green-600 dark:bg-green-900/20",
      updatedAt: "2024-02-01",
      version: "v4.0 ANAC",
      sections: [
        {
          title: "1. Responsabilidades de la Tripulación",
          content: "Verificación de la Ficha Técnica de Registro de Vuelo (Foliado), discrepancias anotadas en Logbook, diferimiento de fallas según Lista de Equipamiento Mínimo (MEL)."
        },
        {
          title: "2. Inspecciones Pre/Post Vuelo",
          content: "Inspección de 360 grados, verificación de niveles de aceite en cajas de transmisión principal (MGB/TGB), condición de palas de rotor principal y rotor de cola."
        },
        {
          title: "3. Control de Vencimientos Técnicos",
          content: "Inspecciones de 50h / 100h / 300h, directivas de aeronavegabilidad (AD) aplicables y boletines de servicio de fabricantes (AgustaWestland / Airbus Helicopters)."
        }
      ]
    },
    {
      id: "sms",
      title: "Sistema de Gestión de Seguridad (SMS)",
      description: "Políticas, reporte voluntario/confidencial de eventos de seguridad y evaluación continua de riesgos operacionales en la flota.",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20",
      updatedAt: "2024-04-10",
      version: "v1.5 ANAC",
      sections: [
        {
          title: "1. Política de Seguridad Operacional",
          content: "Cultura justa no punitiva, compromiso de la alta dirección con la seguridad y priorización de la seguridad operacional sobre la presión comercial."
        },
        {
          title: "2. Gestión de Riesgos (FRAT)",
          content: "Formulario de Evaluación de Riesgos Pre-Vuelo (FRAT), niveles de mitigación requeridos según puntaje y aprobación por Jefe de Pilotos."
        },
        {
          title: "3. Sistema de Reporte Interno (MOR)",
          content: "Procedimiento para el envío de reportes voluntario/confidencial de incidentes, condiciones peligrosas en helipuntos o fallos de equipo."
        }
      ]
    }
  ];

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto pb-20 mt-16 md:mt-0">
      <div className="mb-10">
        <h1 className="text-4xl font-black font-outfit uppercase tracking-tighter mb-2 flex items-center gap-3 text-slate-950 dark:text-white">
          <BookOpen className="w-10 h-10 text-blue-600" />
          Biblioteca Técnica
        </h1>
        <p className="text-muted-foreground font-bold text-sm">
          Acceso centralizado a la documentación operativa, manuales y procedimientos estandarizados normativos ANAC.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manuals.map((manual, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={manual.id}
            onClick={() => setSelectedManual(manual)}
            className="group rounded-[2rem] p-6 border-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${manual.color}`}>
                {manual.icon}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-slate-950 dark:text-white mb-2">{manual.title}</h3>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 min-h-[50px]">
                {manual.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{manual.version}</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-black text-blue-600 group-hover:text-blue-700 transition-colors uppercase">
                LEER MANUAL
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Manual Interactive Viewer Modal */}
      <AnimatePresence>
        {selectedManual && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl relative max-h-[85vh] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedManual.color}`}>
                    {selectedManual.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-950 dark:text-white">
                      {selectedManual.title}
                    </h2>
                    <p className="text-xs font-bold text-slate-500 uppercase">Edición: {selectedManual.version} | Actualizado: {selectedManual.updatedAt}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedManual(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-6 pr-2 flex-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {selectedManual.description}
                </p>

                <div className="space-y-4">
                  {selectedManual.sections.map((sec, i) => (
                    <div key={i} className="p-5 bg-white dark:bg-slate-850 rounded-2xl border-2 border-slate-100 dark:border-slate-800 shadow-xs">
                      <h4 className="font-black text-sm uppercase text-blue-600 dark:text-blue-400 mb-2">{sec.title}</h4>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{sec.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Documentación Normativa ANAC</span>
                <button
                  onClick={() => downloadManual(selectedManual)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  DESCARGAR MANUAL COMPLETO
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
