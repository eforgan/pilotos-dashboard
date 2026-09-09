// Catálogo oficial del FRAT (Flight Risk Assessment Tool), metodología EHSIT / PAVE,
// transcripto textualmente de las plantillas Excel reales de Flight Express
// ("Training FRAT" y "Daily Normal Ops FRAT"). El texto de cada ítem se mantiene
// en inglés (idioma original de la herramienta) por fidelidad con el documento
// que los pilotos ya conocen y firman; las ayudas de uso están en español.

export type FratType = "TRAINING" | "DAILY_OPS";
export type FratRiskLevel = "ACCEPTABLE" | "CAUTION" | "HIGH_RISK";

export interface FratOption {
  /** score posicional: la 1ra opción vale 0, la 2da 1, la 3ra 2 (roja) */
  score: 0 | 1 | 2;
  label: string;
  /** mitigación sugerida por el Excel original (columna "MITIGATION") */
  mitigation?: string;
}

export interface FratItem {
  id: string;
  label: string;
  /** Regla NO-GO: cualquier condición fuera de las opciones aprobadas impide el vuelo */
  noGo?: boolean;
  options: FratOption[];
}

export interface FratSection {
  id: string;
  title: string;
  kind: "static" | "dynamic";
  /** breve nota de ayuda en español para esta sección */
  helpText: string;
  items: FratItem[];
}

export interface FratSheet {
  type: FratType;
  title: string;
  usageNote: string;
  sections: FratSection[];
}

const STATIC_HELP =
  "Puntaje Estático: se completa una sola vez al inicio de la jornada y permanece válido para todos los vuelos del día, salvo que cambien las condiciones del piloto, del instructor/copiloto o de la aeronave.";
const DYNAMIC_HELP =
  "Puntaje Dinámico: revisar antes de cada sortie del día, aunque los puntajes estáticos ya se hayan cargado (la meteorología o la misión pueden cambiar de un vuelo a otro).";
const ITEM_HELP =
  "Seleccione la opción que describe la situación real. Si elige la opción marcada en rojo (2 puntos), debe cargar una acción de mitigación antes del vuelo.";
const NO_GO_HELP =
  "Regla NO-GO: cualquier condición fuera de las opciones aprobadas impide el despacho, independientemente del puntaje total.";

export const FRAT_ITEM_HELP = ITEM_HELP;
export const FRAT_NO_GO_HELP = NO_GO_HELP;

// ---------------------------------------------------------------------------
// TRAINING FRAT — 22 preguntas, puntaje máximo 44
// Usar para vuelos de instrucción/entrenamiento y habilitaciones Offshore VMOS.
// ---------------------------------------------------------------------------

export const TRAINING_FRAT: FratSheet = {
  type: "TRAINING",
  title: "Training FRAT (Instrucción / Inspección)",
  usageNote:
    "Usar para vuelos de instrucción, inspección, entrenamiento y habilitaciones Offshore VMOS.",
  sections: [
    {
      id: "pilot",
      title: "PILOTO EN INSTRUCCIÓN / EVALUADO",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "t_pilot_illness",
          label: "Enfermedad / Condición Física",
          options: [
            { score: 0, label: "Sin problemas. En óptimas condiciones físicas y mentales." },
            {
              score: 1,
              label: "Molestia, dolor menor, indisposición o estrés mental leve.",
              mitigation: "Discutir métodos CRM para minimizar errores causados por salud no óptima.",
            },
            {
              score: 2,
              label: "Enfermedad que requiere medicación / Dolor o malestar persistente / Estrés mental mayor.",
              mitigation: "¡Detener! Programar la instrucción para otro día.",
            },
          ],
        },
        {
          id: "t_pilot_medication",
          label: "Medicación (NO-GO con medicamentos recetados no aprobados)",
          noGo: true,
          options: [
            { score: 0, label: "Sin medicación en las últimas 24 horas." },
            {
              score: 1,
              label: "Medicamentos de venta libre (OTC) aprobados por la compañía.",
              mitigation: "Suspender entrenamiento y esperar hasta que la indisposición ceda y no se requiera medicación.",
            },
            {
              score: 2,
              label: "Medicamentos recetados aprobados.",
              mitigation: "Confirmar con el médico aeronáutico que la medicación no afectará la aptitud de vuelo.",
            },
          ],
        },
        {
          id: "t_pilot_fatigue",
          label: "Fatiga del Piloto",
          options: [
            { score: 0, label: "Sin fatiga. 6 a 8 horas de descanso reparador." },
            {
              score: 1,
              label: "Fatiga leve. Menos de 6 horas de sueño.",
              mitigation: "Descansar adecuadamente antes de realizar el vuelo de entrenamiento.",
            },
            { score: 2, label: "Fatiga física o mental significativa. Menos de 4 horas de descanso." },
          ],
        },
        {
          id: "t_pilot_flight_time_type",
          label: "Horas de vuelo en la marca / modelo",
          options: [
            { score: 0, label: "Más de 1000 horas de vuelo en la marca/modelo." },
            { score: 1, label: "Entre 500 y 1000 horas de vuelo en la marca/modelo." },
            {
              score: 2,
              label: "Menos de 500 horas de vuelo en la marca/modelo.",
              mitigation: "Repasar POH y todos los procedimientos de emergencia. No asumir conocimientos previos.",
            },
          ],
        },
        {
          id: "t_pilot_last_flight_type",
          label: "Último vuelo en la marca / modelo",
          options: [
            { score: 0, label: "Realizado dentro del último mes." },
            {
              score: 1,
              label: "Entre 1 y 3 meses atrás.",
              mitigation: "No realizar procedimientos de emergencia con contacto en tierra durante el primer vuelo.",
            },
            {
              score: 2,
              label: "Más de 3 meses atrás (no considerado reciente para vuelo).",
              mitigation: "No realizar ningún procedimiento de emergencia en el primer vuelo de adaptación.",
            },
          ],
        },
      ],
    },
    {
      id: "instructor",
      title: "INSTRUCTOR / INSPECTOR",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "t_instr_illness",
          label: "Enfermedad / Condición del Instructor",
          options: [
            { score: 0, label: "Sin problemas. En óptimas condiciones físicas y mentales." },
            {
              score: 1,
              label: "Molestia, dolor menor, indisposición o estrés mental leve.",
              mitigation: "Discutir métodos CRM para minimizar errores por salud no óptima.",
            },
            {
              score: 2,
              label: "Enfermedad con medicación / Dolor persistente / Estrés mental mayor.",
              mitigation: "¡Detener! Entrenar otro día con instructor descansado y apto.",
            },
          ],
        },
        {
          id: "t_instr_medication",
          label: "Medicación del Instructor (NO-GO con medicación no autorizada)",
          noGo: true,
          options: [
            { score: 0, label: "Sin medicación en las últimas 24 horas." },
            {
              score: 1,
              label: "Medicamentos de venta libre (OTC) aprobados por la compañía.",
              mitigation: "Detener la instrucción hasta que cesen los síntomas.",
            },
            {
              score: 2,
              label: "Medicamentos recetados aprobados.",
              mitigation: "Confirmar aptitud de vuelo con el médico aeronáutico de la empresa.",
            },
          ],
        },
        {
          id: "t_instr_fatigue",
          label: "Fatiga del Instructor",
          options: [
            { score: 0, label: "Sin fatiga. 6 a 8 horas de descanso." },
            {
              score: 1,
              label: "Fatiga leve. Menos de 6 horas de descanso.",
              mitigation: "Descansar antes de iniciar la jornada de instrucción.",
            },
            { score: 2, label: "Fatiga física o mental significativa. Menos de 4 horas de descanso." },
          ],
        },
        {
          id: "t_instr_flight_time_type",
          label: "Horas de vuelo del instructor en la marca / modelo",
          options: [
            { score: 0, label: "Más de 1000 horas de vuelo en la marca/modelo." },
            {
              score: 1,
              label: "Entre 500 y 1000 horas de vuelo en la marca/modelo.",
              mitigation: "No practicar procedimientos de emergencia en el primer vuelo.",
            },
            {
              score: 2,
              label: "Menos de 500 horas de vuelo en la marca/modelo.",
              mitigation: "Vuelo de refresco previo con instructor de mayor experiencia en la aeronave.",
            },
          ],
        },
        {
          id: "t_instr_last_flight_type",
          label: "Último vuelo del instructor en la marca / modelo",
          options: [
            { score: 0, label: "Realizado dentro del último mes." },
            {
              score: 1,
              label: "Entre 1 y 3 meses atrás.",
              mitigation: "Sin emergencias con contacto en tierra en el primer vuelo.",
            },
            {
              score: 2,
              label: "Más de 3 meses atrás.",
              mitigation: "Requerido vuelo de refresco con instructor habilitado en la aeronave.",
            },
          ],
        },
        {
          id: "t_crew_composition",
          label: "Composición de la Tripulación",
          options: [
            { score: 0, label: "Instructor experimentado (>500hs de instrucción impartida) y alumno habilitado." },
            {
              score: 1,
              label: "Dos instructores de vuelo.",
              mitigation: "Briefing detallado de CRM de cabina y división de roles.",
            },
            {
              score: 2,
              label: "Instructor nuevo (<500hs impartidas), alumno ab-initio o transición a nueva aeronave.",
              mitigation: "Explicar y cubrir todas las maniobras como si el alumno no tuviera experiencia previa.",
            },
          ],
        },
      ],
    },
    {
      id: "aircraft",
      title: "AERONAVE",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "t_ac_maintenance",
          label: "Mantenimiento Reciente Realizado",
          options: [
            { score: 0, label: "Más de 10 horas de vuelo desde el último mantenimiento." },
            {
              score: 1,
              label: "Entre 5 y 10 horas de vuelo desde el último mantenimiento.",
              mitigation: "Verificar maniobras básicas, motor y embrague antes de comenzar la instrucción.",
            },
            { score: 2, label: "Menos de 5 horas desde el último mantenimiento.", mitigation: "No realizar vuelos de instrucción." },
          ],
        },
        {
          id: "t_ac_anomalies",
          label: "Anomalías conocidas (Sin diferidos NO-GO)",
          noGo: true,
          options: [
            { score: 0, label: "Ninguna anomalía." },
            {
              score: 1,
              label: "1 a 2 discrepancias menores anotadas.",
              mitigation: "Discutir contramedidas para compensar la pérdida o degradación de equipos.",
            },
            { score: 2, label: "Más de 2 discrepancias menores." },
          ],
        },
        {
          id: "t_ac_performance",
          label: "Rendimiento (Peso y Balance)",
          options: [
            { score: 0, label: "Ampliamente dentro de los límites de peso y centrado." },
            {
              score: 1,
              label: "Dentro del 20% del peso máximo bruto o límite de centrado.",
              mitigation: "Repasar tabla de performance. Consumir combustible. Esperar mejores condiciones.",
            },
            {
              score: 2,
              label: "Dentro del 10% del peso máximo bruto o límite de centrado.",
              mitigation: "Discutir el impacto del peso en las maniobras críticas a realizar.",
            },
          ],
        },
      ],
    },
    {
      id: "environment",
      title: "ENTORNO Y METEOROLOGÍA",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "t_env_ceiling",
          label: "Techo de Nubes",
          options: [
            { score: 0, label: "> 1000 ft por encima del mínimo de la compañía." },
            {
              score: 1,
              label: "Dentro de los 500 ft del mínimo de la compañía.",
              mitigation: "Configurar cabina para recuperación IIMC. Monitorear tendencia de clima y alternativos.",
            },
            { score: 2, label: "Dentro de los 100 ft del mínimo de la compañía.", mitigation: "Entrenar únicamente en el circuito de tránsito del aeródromo." },
          ],
        },
        {
          id: "t_env_visibility",
          label: "Visibilidad",
          options: [
            { score: 0, label: "> 5 millas por encima de la visibilidad mínima." },
            {
              score: 1,
              label: "Dentro de las 3 millas de la visibilidad mínima.",
              mitigation: "Preparar cabina para IIMC. Monitorear tendencia meteorológica y puntos alternativos.",
            },
            { score: 2, label: "Dentro de 1 milla de la visibilidad mínima.", mitigation: "Entrenar únicamente en el circuito de tránsito del aeródromo." },
          ],
        },
        {
          id: "t_env_winds",
          label: "Vientos y Ráfagas",
          options: [
            { score: 0, label: "Vientos calmos o leves." },
            {
              score: 1,
              label: "Viento a menos de 10 kts del límite de la aeronave / personal (ráfagas > 10 kts).",
              mitigation: "Planificar despegues y aterrizajes favoreciendo la proa al viento.",
            },
            {
              score: 2,
              label: "En o cerca del límite de la aeronave / personal (ráfagas > 15 kts).",
              mitigation: "Realizar únicamente entrenamiento específico de viento fuerte. Cancelar maniobras no esenciales.",
            },
          ],
        },
        {
          id: "t_env_convective",
          label: "Actividad Convectiva",
          options: [
            { score: 0, label: "Sin actividad convectiva en la zona." },
            {
              score: 1,
              label: "Actividad convectiva moderada dentro de 20 NM.",
              mitigation: "Briefing de clima pronosticado y monitoreo continuo durante el vuelo.",
            },
            { score: 2, label: "Fuerte actividad convectiva dentro de 20 NM.", mitigation: "¡Detener! Reanudar el entrenamiento cuando mejore la meteorología." },
          ],
        },
        {
          id: "t_env_terrain",
          label: "Terreno Operativo",
          options: [
            { score: 0, label: "Rural / Llano." },
            { score: 1, label: "Urbano / Colinas moderadas / Zona anegada.", mitigation: "Revisar zonas de aterrizaje de emergencia en la ruta." },
            {
              score: 2,
              label: "Montañoso / Sobre agua extendido fuera de distancia de planeo.",
              mitigation: "Realizar únicamente entrenamiento específico para este tipo de terreno.",
            },
          ],
        },
      ],
    },
    {
      id: "training_mission",
      title: "MISIÓN DE INSTRUCCIÓN",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "t_mission_maneuvers",
          label: "Maniobras de Entrenamiento",
          options: [
            { score: 0, label: "Maniobras básicas de vuelo." },
            {
              score: 1,
              label: "Maniobras avanzadas de vuelo / Procedimientos de emergencia.",
              mitigation:
                "Repasar procedimientos de emergencia, definir condiciones necesarias de inicio y criterios de escape/toma de mando por el instructor.",
            },
            {
              score: 2,
              label: "Procedimientos de emergencia con contacto en tierra (autorrotaciones a suelo).",
              mitigation: "Utilizar un enfoque progresivo previo a realizar las maniobras de contacto en tierra.",
            },
          ],
        },
        {
          id: "t_mission_day_night",
          label: "Día / Noche / Visores Nocturnos (NVG)",
          options: [
            { score: 0, label: "Misión diurna." },
            {
              score: 1,
              label: "Misión nocturna con visores de visión nocturna (NVG).",
              mitigation: "Repasar uso y procedimientos ante falla simulada de NVG.",
            },
            {
              score: 2,
              label: "Misión nocturna sin visores (unaided).",
              mitigation: "Repasar terreno y procedimientos de CRM durante el vuelo.",
            },
          ],
        },
        {
          id: "t_mission_briefing",
          label: "Briefing Pre-vuelo",
          options: [
            { score: 0, label: "Todas las maniobras y procedimientos cubiertos en detalle." },
            { score: 1, label: "Algunas maniobras no cubiertas o límites no especificados." },
            { score: 2, label: "Sin briefing realizado.", mitigation: "¡DETENER! No volar bajo ninguna circunstancia sin briefing previo." },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// DAILY NORMAL OPS FRAT — 31 preguntas, puntaje máximo 62
// Usar para vuelos operativos normales (no de instrucción): línea, HEMS, traslados, etc.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// DAILY NORMAL OPS FRAT — 31 preguntas, puntaje máximo 62
// Usar para vuelos operativos normales: línea, HEMS, traslados, etc.
// ---------------------------------------------------------------------------

export const DAILY_OPS_FRAT: FratSheet = {
  type: "DAILY_OPS",
  title: "Daily Normal Ops FRAT (Vuelos Operativos)",
  usageNote: "Usar para vuelos operativos normales: línea, HEMS, traslados de personal, carga, etc.",
  sections: [
    {
      id: "pilot",
      title: "COMANDANTE (PIC)",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "d_pilot_illness",
          label: "Enfermedad / Condición Física",
          options: [
            { score: 0, label: "Sin problemas. En óptimas condiciones físicas y mentales." },
            {
              score: 1,
              label: "Molestia, dolor menor, indisposición o estrés mental leve.",
              mitigation: "Discutir métodos CRM para minimizar errores causados por salud degradada.",
            },
            { score: 2, label: "Enfermedad que requiere medicación / Dolor persistente / Estrés mental mayor.", mitigation: "¡Detener! Solicitar relevo por el servicio médico." },
          ],
        },
        {
          id: "d_pilot_medication",
          label: "Medicación (NO-GO con medicamentos recetados no aprobados)",
          noGo: true,
          options: [
            { score: 0, label: "Sin medicación en las últimas 24 horas." },
            {
              score: 1,
              label: "Medicamentos de venta libre (OTC) aprobados por la compañía.",
              mitigation: "Limitar actividad de vuelo. Descansar durante el turno y consultar médico aeronáutico.",
            },
            { score: 2, label: "Medicamentos recetados aprobados por la compañía." },
          ],
        },
        {
          id: "d_pilot_fatigue",
          label: "Fatiga del Piloto",
          options: [
            { score: 0, label: "Sin fatiga. 6 a 8 horas de descanso reparador." },
            { score: 1, label: "Fatiga leve. Menos de 6 horas de descanso.", mitigation: "Descansar durante el turno en base si es posible." },
            {
              score: 2,
              label: "Fatiga física o mental significativa. Menos de 4 horas de descanso.",
              mitigation: "Considerar suspensión temporal del vuelo hasta estar descansado o ser relevado.",
            },
          ],
        },
        {
          id: "d_pilot_total_time",
          label: "Horas totales de vuelo",
          options: [
            { score: 0, label: "Más de 3000 horas totales de vuelo." },
            {
              score: 1,
              label: "Entre 1000 y 3000 horas totales de vuelo.",
              mitigation: "Establecer mayores márgenes de seguridad en meteorología y perfil de misión.",
            },
            { score: 2, label: "Menos de 1000 horas totales de vuelo.", mitigation: "Asignar copiloto o TFO de mayor experiencia." },
          ],
        },
        {
          id: "d_pilot_time_type",
          label: "Horas de vuelo en la marca / modelo",
          options: [
            { score: 0, label: "Más de 1000 horas de vuelo en marca/modelo." },
            {
              score: 1,
              label: "Entre 500 y 1000 horas en marca/modelo.",
              mitigation: "Repasar sección del POH diariamente (procedimiento de emergencia del día).",
            },
            { score: 2, label: "Menos de 500 horas en marca/modelo.", mitigation: "Limitar perfiles de misión y mínimos meteorológicos." },
          ],
        },
        {
          id: "d_pilot_last_flight_type",
          label: "Último vuelo en la marca / modelo",
          options: [
            { score: 0, label: "Realizado dentro del último mes." },
            {
              score: 1,
              label: "Entre 1 y 3 meses atrás.",
              mitigation: "Repasar POH y volar acompañado de tripulación experimentada y reciente.",
            },
            { score: 2, label: "Más de 3 meses atrás (no considerado reciente).", mitigation: "Requiere vuelo de adaptación/refresco con instructor." },
          ],
        },
        {
          id: "d_pilot_currency_training",
          label: "Entrenamiento Periódico / Recurrente",
          options: [
            { score: 0, label: "Realizado en los últimos 6 meses (simulador, fábrica, recurrentes)." },
            { score: 1, label: "Realizado entre 6 y 12 meses atrás." },
            { score: 2, label: "Ninguno en los últimos 12 meses.", mitigation: "No considerado reciente para misiones operativas." },
          ],
        },
        {
          id: "d_pilot_imc",
          label: "Preparación IMC / Vuelo por Instrumentos",
          options: [
            { score: 0, label: "IFR reciente - Entrenamiento IIMC en los últimos 6 meses." },
            {
              score: 1,
              label: "Habilitación IFR > 6 meses - Entrenamiento IIMC entre 6 y 12 meses atrás.",
              mitigation: "Repasar procedimientos IMC en simulador o briefing de vuelo.",
            },
            {
              score: 2,
              label: "Sin habilitación IFR reciente ni entrenamiento IIMC en los últimos 12 meses.",
              mitigation: "Volar solo si hay 5000 ft de techo y 10 millas de visibilidad sin pronóstico de cambio. Noche solo en zonas urbanas bien iluminadas.",
            },
          ],
        },
      ],
    },
    {
      id: "tfo_copilot",
      title: "COPILOTO / TFO",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "d_tfo_illness",
          label: "Enfermedad / Condición del Copiloto/TFO",
          options: [
            { score: 0, label: "Sin problemas. En óptimas condiciones físicas y mentales." },
            {
              score: 1,
              label: "Molestia, dolor menor, indisposición o estrés mental leve.",
              mitigation: "Discutir métodos CRM para minimizar errores causados por salud degradada.",
            },
            { score: 2, label: "Enfermedad con medicación / Dolor persistente / Estrés mental mayor.", mitigation: "¡Detener! Relevar por el servicio médico." },
          ],
        },
        {
          id: "d_tfo_medication",
          label: "Medicación del Copiloto/TFO (NO-GO)",
          noGo: true,
          options: [
            { score: 0, label: "Sin medicación en las últimas 24 horas." },
            {
              score: 1,
              label: "Medicamentos de venta libre (OTC) aprobados.",
              mitigation: "Limitar actividad de vuelo y consultar médico aeronáutico.",
            },
            { score: 2, label: "Medicamentos recetados aprobados." },
          ],
        },
        {
          id: "d_tfo_fatigue",
          label: "Fatiga del Copiloto/TFO",
          options: [
            { score: 0, label: "Sin fatiga. 6 a 8 horas de descanso reparador." },
            { score: 1, label: "Fatiga leve. Menos de 6 horas de descanso.", mitigation: "Descansar durante el turno si es posible." },
            {
              score: 2,
              label: "Fatigado física o mentalmente. Menos de 4 horas de descanso.",
              mitigation: "Considerar relevo de tripulación.",
            },
          ],
        },
        {
          id: "d_tfo_total_time",
          label: "Horas totales de vuelo del Copiloto/TFO",
          options: [
            { score: 0, label: "Más de 1000 horas de vuelo o más de 3 años de experiencia." },
            {
              score: 1,
              label: "Entre 300 y 1000 horas de vuelo o 1 a 3 años de experiencia.",
              mitigation: "Briefing de emergencias y CRM con el comandante.",
            },
            {
              score: 2,
              label: "Menos de 300 horas o menos de 6 meses de experiencia.",
              mitigation: "Volar con comandante experimentado. Elevar mínimos de visibilidad y altitud.",
            },
          ],
        },
        {
          id: "d_tfo_imc",
          label: "Preparación IMC del Copiloto/TFO",
          options: [
            { score: 0, label: "Entrenamiento IIMC en los últimos 6 meses." },
            { score: 1, label: "Entrenamiento IIMC realizado hace más de 6 meses.", mitigation: "Repasar procedimientos IMC en briefing o simulador." },
            {
              score: 2,
              label: "Sin entrenamiento IIMC en los últimos 12 meses.",
              mitigation: "Volar solo con 5000 ft de techo y 10 millas de visibilidad.",
            },
          ],
        },
        {
          id: "d_tfo_crew_together",
          label: "Experiencia conjunta de la Tripulación",
          options: [
            { score: 0, label: "Más de 100 horas volando juntos como tripulación de vuelo." },
            { score: 1, label: "Entre 20 y 100 horas volando juntos.", mitigation: "Briefing detallado de CRM de cabina y procedimientos." },
            {
              score: 2,
              label: "Menos de 20 horas volando juntos.",
              mitigation: "Incrementar márgenes de seguridad en meteorología y perfil de misión.",
            },
          ],
        },
      ],
    },
    {
      id: "aircraft",
      title: "AERONAVE",
      kind: "static",
      helpText: STATIC_HELP,
      items: [
        {
          id: "d_ac_maintenance",
          label: "Mantenimiento Reciente Realizado",
          options: [
            { score: 0, label: "Más de 10 horas de vuelo desde el último mantenimiento." },
            { score: 1, label: "Entre 5 y 10 horas desde el último mantenimiento.", mitigation: "Vuelo diurno o elevar mínimos meteorológicos nocturnos." },
            { score: 2, label: "Menos de 5 horas desde el último mantenimiento.", mitigation: "No transportar pasajeros." },
          ],
        },
        {
          id: "d_ac_anomalies",
          label: "Anomalías conocidas (Sin diferidos NO-GO)",
          noGo: true,
          options: [
            { score: 0, label: "Ninguna anomalía." },
            {
              score: 1,
              label: "1 a 2 discrepancias menores anotadas.",
              mitigation: "Discutir contramedidas por degradación de equipos.",
            },
            { score: 2, label: "Más de 2 discrepancias menores." },
          ],
        },
        {
          id: "d_ac_performance",
          label: "Rendimiento (Peso y Balance)",
          options: [
            { score: 0, label: "Ampliamente dentro de los límites de peso y centrado." },
            { score: 1, label: "Dentro del 20% del peso máximo bruto o límite de centrado.", mitigation: "Repasar tabla de rendimiento." },
            {
              score: 2,
              label: "Dentro del 10% del peso máximo bruto o límite de centrado.",
              mitigation: "Sin aterrizajes fuera de base, posibles cambios en el perfil de despegue/aterrizaje.",
            },
          ],
        },
      ],
    },
    {
      id: "aircrew",
      title: "JORNADA Y TRIPULACIÓN",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "d_crew_hours_duty",
          label: "Horas de Servicio / Turno",
          options: [
            { score: 0, label: "0 a 8 horas de turno." },
            {
              score: 1,
              label: "8 a 12 horas de turno.",
              mitigation: "Tomar descanso breve en base si es posible.",
            },
            { score: 2, label: "Más de 12 horas de turno.", mitigation: "Evitar aceptar misiones con puntajes de riesgo elevados." },
          ],
        },
        {
          id: "d_crew_time_of_day",
          label: "Hora del Día (Ventana de Baja Circadiana)",
          options: [
            { score: 0, label: "Horario diurno habitual." },
            {
              score: 1,
              label: "15:00 a 17:00 hs (baja circadiana vespertina).",
              mitigation: "Descanso previo si la operativa lo permite.",
            },
            { score: 2, label: "01:00 a 06:00 hs (ventana de máxima baja circadiana).", mitigation: "Evitar misiones con puntajes de riesgo elevados." },
          ],
        },
      ],
    },
    {
      id: "environment",
      title: "ENTORNO Y METEOROLOGÍA",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "d_env_ceiling",
          label: "Techo de Nubes",
          options: [
            { score: 0, label: "> 1000 ft por encima del mínimo de la compañía." },
            {
              score: 1,
              label: "Dentro de los 500 ft del mínimo de la compañía.",
              mitigation: "Configurar cabina para IIMC. Monitorear tendencia de clima y alternativos.",
            },
            { score: 2, label: "Dentro de los 100 ft del mínimo de la compañía." },
          ],
        },
        {
          id: "d_env_visibility",
          label: "Visibilidad",
          options: [
            { score: 0, label: "> 5 millas por encima de la visibilidad mínima." },
            {
              score: 1,
              label: "Dentro de las 3 millas de la visibilidad mínima.",
              mitigation: "Configurar cabina para IIMC. Verificar puntos alternativos.",
            },
            { score: 2, label: "Dentro de 1 milla de la visibilidad mínima." },
          ],
        },
        {
          id: "d_env_winds",
          label: "Vientos y Ráfagas",
          options: [
            { score: 0, label: "Vientos calmos o leves." },
            {
              score: 1,
              label: "Viento a menos de 10 kts del límite de la aeronave (ráfagas > 10 kts).",
              mitigation: "Favorables despegues y aterrizajes enfrentando el viento.",
            },
            {
              score: 2,
              label: "En límites de la aeronave / personal (ráfagas > 15 kts).",
              mitigation: "Repasar procedimientos de aterrizaje con viento fuerte.",
            },
          ],
        },
        {
          id: "d_env_convective",
          label: "Actividad Convectiva",
          options: [
            { score: 0, label: "Sin actividad convectiva en la zona." },
            {
              score: 1,
              label: "Actividad convectiva moderada dentro de 20 NM.",
              mitigation: "Desarrollar plan alternativo para desvío o aterrizaje en helipuerto de alternativa.",
            },
            { score: 2, label: "Fuerte actividad convectiva dentro de 20 NM.", mitigation: "¡Detener! Cancelar el vuelo si es necesario." },
          ],
        },
        {
          id: "d_env_forecast",
          label: "Condiciones Pronosticadas",
          options: [
            { score: 0, label: "Condiciones estables - sin cambios pronosticados." },
            {
              score: 1,
              label: "Cambio moderado en el pronóstico o pronóstico poco confiable.",
              mitigation: "Configurar cabina para IIMC. Monitorear tendencia meteorológica.",
            },
            {
              score: 2,
              label: "Clima inestable o pronóstico de deterioro hacia condiciones IMC.",
              mitigation: "Establecer límite meteorológico que permita retornar a base o aterrizar fuera a tiempo.",
            },
          ],
        },
        {
          id: "d_env_terrain",
          label: "Terreno Operativo",
          options: [
            { score: 0, label: "Rural / Llano." },
            {
              score: 1,
              label: "Urbano / Colinas moderadas / Zona anegada.",
              mitigation: "Equipamiento de supervivencia y chalecos salvavidas colocados. Revisar rutas y altitudes mínimas.",
            },
            { score: 2, label: "Montañoso / Sobre agua extendido fuera de distancia de planeo." },
          ],
        },
        {
          id: "d_env_fog",
          label: "Niebla",
          options: [
            { score: 0, label: "Condiciones no propicias para formación de niebla." },
            {
              score: 1,
              label: "Niebla pronosticada > 4 horas después del despegue.",
              mitigation: "Configurar cabina para IIMC. Monitorear tendencia de clima.",
            },
            { score: 2, label: "Margen temperatura/punto de rocío < 3°F o 1°C, vientos calmos.", mitigation: "¡Detener! Cancelar el vuelo si es necesario." },
          ],
        },
        {
          id: "d_env_icing",
          label: "Engelamiento / Hielo",
          options: [
            { score: 0, label: "Sin condiciones de engelamiento." },
            { score: 1, label: "Condiciones marginales de engelamiento.", mitigation: "Identificar niveles de congelamiento y plan de escape." },
            {
              score: 2,
              label: "Engelamiento probable en humedad visible.",
              mitigation: "¡Detener! Cancelar el vuelo.",
            },
          ],
        },
      ],
    },
    {
      id: "mission",
      title: "MISIÓN OPERATIVA",
      kind: "dynamic",
      helpText: DYNAMIC_HELP,
      items: [
        {
          id: "d_mission_type",
          label: "Tipo de Misión",
          options: [
            { score: 0, label: "Vuelo normal en zona operativa habitual." },
            {
              score: 1,
              label: "Vuelo fuera de la zona operativa habitual.",
              mitigation: "Repasar procedimientos de emergencia y realizar briefing de área desconocida.",
            },
            {
              score: 2,
              label: "Misión especializada (Carga externa, guinche/hoist, helibalde, operaciones especiales).",
              mitigation: "Utilizar tarjeta de briefing específica para misión especializada.",
            },
          ],
        },
        {
          id: "d_mission_landing_site",
          label: "Sitio de Aterrizaje",
          options: [
            { score: 0, label: "En base operativa o helipuerto designado." },
            { score: 1, label: "Aterrizaje fuera de base o helipuerto (sitio conocido)." },
            { score: 2, label: "Aterrizaje fuera de base o helipuerto (sitio desconocido)." },
          ],
        },
        {
          id: "d_mission_day_night",
          label: "Día / Noche / Visores Nocturnos",
          options: [
            { score: 0, label: "Misión diurna." },
            { score: 1, label: "Misión nocturna con visores de visión nocturna (NVG)." },
            {
              score: 2,
              label: "Misión nocturna sin visores (unaided).",
              mitigation: "Utilizar mínimos de clima más elevados. Preparar cabina para recuperación IIMC.",
            },
          ],
        },
        {
          id: "d_mission_external_pressure",
          label: "Presión Externa",
          options: [
            { score: 0, label: "Vuelo fácilmente cancelable - sin riesgo para vidas humanas." },
            { score: 1, label: "Riesgo de lesiones o pérdida de vidas sin apoyo aeronáutico." },
            {
              score: 2,
              label: "Presión significativa de clientes o jefatura para despegar.",
              mitigation: "¡Detener! Cancelar el vuelo si supera los límites de riesgo de la compañía. Repasar políticas escritas.",
            },
          ],
        },
      ],
    },
  ],
};

export const FRAT_SHEETS: Record<FratType, FratSheet> = {
  TRAINING: TRAINING_FRAT,
  DAILY_OPS: DAILY_OPS_FRAT,
};

export function getFratSheet(type: FratType): FratSheet {
  return FRAT_SHEETS[type];
}

export function allItems(sheet: FratSheet): FratItem[] {
  return sheet.sections.flatMap((s) => s.items);
}

export function maxScore(sheet: FratSheet): number {
  return allItems(sheet).length * 2;
}

/** Umbrales verificados contra los .xls reales de la compañía: CAUTION al 20% del máximo, HIGH RISK al 40%. */
export function riskLevelFor(score: number, max: number): FratRiskLevel {
  if (score >= max * 0.4) return "HIGH_RISK";
  if (score >= max * 0.2) return "CAUTION";
  return "ACCEPTABLE";
}

export const RISK_LEVEL_INFO: Record<
  FratRiskLevel,
  { label: string; description: string; action: string; colorClass: string }
> = {
  ACCEPTABLE: {
    label: "ACCEPTABLE",
    description: "Riesgo aceptable para la operación prevista.",
    action: "Proceder con el vuelo, conservando el FRAT completado como parte de la documentación del vuelo.",
    colorClass: "emerald",
  },
  CAUTION: {
    label: "CAUTION",
    description: "Riesgo elevado que requiere revisión adicional.",
    action:
      "Requiere autorización expresa del Post Holder de Operaciones (o del responsable de mayor jerarquía disponible) antes de volar, dejando constancia de dicha autorización.",
    colorClass: "amber",
  },
  HIGH_RISK: {
    label: "HIGH RISK",
    description: "Riesgo no aceptable para la operación en las condiciones evaluadas.",
    action:
      "Cancelar o reprogramar el vuelo. No debe operarse hasta que la mitigación de los factores de riesgo reduzca el puntaje a un nivel aceptable.",
    colorClass: "red",
  },
};

export interface FratResponseValue {
  initial: 0 | 1 | 2;
  final: 0 | 1 | 2;
  mitigation?: string;
}

export type FratResponses = Record<string, FratResponseValue>;

export interface FratScoreSummary {
  max: number;
  initialScore: number;
  finalScore: number;
  initialLevel: FratRiskLevel;
  finalLevel: FratRiskLevel;
  answered: number;
  total: number;
  missing: number;
}

export function computeFratScore(sheet: FratSheet, responses: FratResponses): FratScoreSummary {
  const items = allItems(sheet);
  const max = items.length * 2;
  let initialScore = 0;
  let finalScore = 0;
  let answered = 0;

  for (const item of items) {
    const r = responses[item.id];
    if (!r) continue;
    answered += 1;
    initialScore += r.initial;
    finalScore += r.final;
  }

  return {
    max,
    initialScore,
    finalScore,
    initialLevel: riskLevelFor(initialScore, max),
    finalLevel: riskLevelFor(finalScore, max),
    answered,
    total: items.length,
    missing: items.length - answered,
  };
}
