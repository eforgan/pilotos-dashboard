export interface Pilot {
  id: string;
  PILOTO: string;
  TELEFONO: string;
  EMAIL?: string;
  DNI: string;
  FECHA_NAC: string;
  LICENCIA: string;
  CMA: string;
  AW109: string;
  BO105: string;
  RH44: string;
  BN2B: string;
  CONTROL_BIENAL: string;
  INSP_RECONOC: string;
  SIMULADOR: string;
  CTRL_IDONEIDAD: string;
  CTRL_RUTA: string;
  CTRL_VLO_INST: string;
  EXP_RECIENTE: string;
  ULT_FOLIADO: string;
  CRM_FFHH: string;
  MERC_PELIGROSAS: string;
  INTERF_ILICITA: string;
  MOE: string;
  SMS: string;
  CURSO_AERONAVE: string;
  VACACIONES: string;
  INSP_IR: string;
  BASE: string;
  HUET: string;
  RO: string;
  imageUrl?: string | null;
  inviteToken?: string | null;
  user?: { id: string; email: string; role: string } | null;
  documents?: { id: string; type: string; fileUrl: string; fileName: string; pilotId: string; createdAt: Date | string; updatedAt: Date | string; verified?: boolean }[];
}

export const AIRCRAFT_MODELS = ["AW109", "AW109SP", "AW109E", "AW109C", "BO105", "RH44", "BN2B", "BN2N"] as const;
export type AircraftModel = typeof AIRCRAFT_MODELS[number];

export const MISSION_TYPES = [
  "Traslado",
  "HEMS",
  "Entrenamiento",
  "Inspección",
  "Mantenimiento",
  "Transporte Personal",
  "Transporte Carga",
] as const;
export type MissionType = typeof MISSION_TYPES[number];

export interface CrewModalityItem {
  id: "SOLO" | "PILOT_COPILOT" | "PILOT_TFO" | "INSTRUCTOR_STUDENT" | "INSPECTOR_EVALUATED";
  label: string;
  hemsOnly?: boolean;
}

export const CREW_MODALITIES: readonly CrewModalityItem[] = [
  { id: "SOLO", label: "Piloto Solo (Monopiloto)" },
  { id: "PILOT_COPILOT", label: "Piloto y Copiloto" },
  { id: "PILOT_TFO", label: "Piloto y Técnico Operativo (TFO)", hemsOnly: true },
  { id: "INSTRUCTOR_STUDENT", label: "Instructor y Piloto en Instrucción" },
  { id: "INSPECTOR_EVALUATED", label: "Inspector y Piloto Inspeccionado" },
];
export type CrewModality = CrewModalityItem["id"];

export type AlertLevel = "critical" | "warning" | "caution" | "ok" | "na";

export interface ExpirationItem {
  field: string;
  label: string;
  date: string;
  daysRemaining: number;
  level: AlertLevel;
  pilotName: string;
  pilotId: string;
}

export interface PilotSummary {
  total: number;
  byBase: Record<string, number>;
  byLicense: Record<string, number>;
  criticalAlerts: number;
  warningAlerts: number;
  cautionAlerts: number;
  okCount: number;
}

export interface TrackableField {
  key: keyof Pilot;
  label: string;
  category: "medical" | "license" | "training" | "operational" | "safety";
  renewalMonths?: number;
}

export const TRACKABLE_FIELDS: TrackableField[] = [
  { key: "CMA", label: "Certificado Médico (CMA)", category: "medical" },
  { key: "CTRL_IDONEIDAD", label: "Control Idoneidad en el Tipo", category: "operational", renewalMonths: 12 },
  { key: "CTRL_RUTA", label: "Control de Ruta", category: "operational", renewalMonths: 12 },
  { key: "CTRL_VLO_INST", label: "Control Vuelo por Instrumentos", category: "operational", renewalMonths: 12 },
  { key: "CRM_FFHH", label: "CRM / Factores Humanos", category: "training" },
  { key: "MERC_PELIGROSAS", label: "Mercancías Peligrosas", category: "training" },
  { key: "INTERF_ILICITA", label: "Interferencia Ilícita", category: "training" },
  { key: "MOE", label: "MOE", category: "safety" },
  { key: "SMS", label: "SMS", category: "safety" },
  { key: "CURSO_AERONAVE", label: "Curso de Aeronave", category: "training" },
  { key: "CONTROL_BIENAL", label: "Control Bienal", category: "license" },
  { key: "SIMULADOR", label: "Simulador", category: "training" },
  { key: "HUET", label: "HUET", category: "safety" },
];

export const FIELD_CATEGORIES = {
  medical: { label: "Médico", color: "#ef4444", icon: "Heart" },
  license: { label: "Licencia", color: "#8b5cf6", icon: "Award" },
  training: { label: "Capacitación", color: "#3b82f6", icon: "GraduationCap" },
  operational: { label: "Operacional", color: "#f59e0b", icon: "Plane" },
  safety: { label: "Seguridad", color: "#10b981", icon: "Shield" },
} as const;

export interface FleetAircraft {
  model: string;
  tailNumber: string;
}

export interface BaseContract {
  id: string;
  name: string;
  client: string;
  location: string;
  fleetRequired: { model: string; count: number }[];
  assignedAircraft: FleetAircraft[];
  description: string;
}

export const COMPANY_BASES: BaseContract[] = [
  {
    id: "sierra_grande",
    name: "Base Sierra Grande",
    client: "YPF Vmos",
    location: "Sierra Grande (Río Negro)",
    fleetRequired: [{ model: "BO105", count: 1 }],
    assignedAircraft: [{ model: "BO105", tailNumber: "LV-CSM" }],
    description: "Contrato con YPF Vmos operando con helicóptero BO105 (LV-CSM)."
  },
  {
    id: "brm",
    name: "Base BRM",
    client: "BRM",
    location: "Bahía Rincón / BRM",
    fleetRequired: [{ model: "AW109SP", count: 2 }],
    assignedAircraft: [
      { model: "AW109SP", tailNumber: "LV-WLO" },
      { model: "AW109SP", tailNumber: "LV-WLP" }
    ],
    description: "Operaciones de la base BRM equipada con 2 helicópteros AgustaWestland AW109SP (LV-WLO y LV-WLP)."
  },
  {
    id: "neuquen",
    name: "Base Neuquén",
    client: "Vista Energy",
    location: "Neuquén (Vaca Muerta)",
    fleetRequired: [
      { model: "AW109E", count: 1 },
      { model: "BO105", count: 1 }
    ],
    assignedAircraft: [
      { model: "AW109E", tailNumber: "LV-KCR" },
      { model: "BO105", tailNumber: "LV-GID" }
    ],
    description: "Contrato con Vista Energy operando con AW109E (LV-KCR) y BO105 (LV-GID)."
  },
  {
    id: "don_torcuato",
    name: "Base Don Torcuato",
    client: "Mantenimiento / Operativa",
    location: "Don Torcuato (Buenos Aires)",
    fleetRequired: [
      { model: "AW109E", count: 1 },
      { model: "AW109C", count: 1 }
    ],
    assignedAircraft: [
      { model: "AW109E", tailNumber: "LV-KNS" },
      { model: "AW109C", tailNumber: "LV-WAE" }
    ],
    description: "Base operativa y centro técnico operando con AW109E (LV-KNS) y AW109C (LV-WAE)."
  },
  {
    id: "nunez",
    name: "Base Núñez",
    client: "SAME AÉREO",
    location: "Buenos Aires (Núñez / HEMS)",
    fleetRequired: [{ model: "BO105", count: 1 }],
    assignedAircraft: [{ model: "BO105", tailNumber: "LV-FKS" }],
    description: "Contrato con SAME AÉREO para evacuaciones aeromédicas urbanas HEMS 24/7 operando con BO105 (LV-FKS)."
  },
  {
    id: "rosario",
    name: "Base Rosario",
    client: "UTV Emergencias",
    location: "Aeropuerto de Rosario (SAAR)",
    fleetRequired: [{ model: "BO105", count: 1 }],
    assignedAircraft: [{ model: "BO105", tailNumber: "LV-GIE" }],
    description: "Contrato con UTV Emergencias desde el Aeropuerto de Rosario operando con BO105 (LV-GIE)."
  },
  {
    id: "calafate",
    name: "Base El Calafate",
    client: "Solo Patagonia",
    location: "El Calafate (SAWC)",
    fleetRequired: [
      { model: "BN2N", count: 1 },
      { model: "RH44", count: 1 }
    ],
    assignedAircraft: [
      { model: "BN2N", tailNumber: "LV-WFR" },
      { model: "RH44", tailNumber: "LV-CCV" }
    ],
    description: "Contrato con Solo Patagonia operando avión BN2N (LV-WFR) y helicóptero RH44 (LV-CCV)."
  }
];
