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
  documents?: { id: string; type: string; fileUrl: string; fileName: string; pilotId: string; createdAt: Date | string; updatedAt: Date | string; verified?: boolean }[]; // Simplified for now
}

export const AIRCRAFT_MODELS = ["AW109", "BO105", "RH44", "BN2B"] as const;
export type AircraftModel = typeof AIRCRAFT_MODELS[number];

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

export interface BaseContract {
  id: string;
  name: string;
  client: string;
  location: string;
  fleetRequired: { model: AircraftModel; count: number }[];
  description: string;
}

export const COMPANY_BASES: BaseContract[] = [
  {
    id: "nunez",
    name: "Base Núñez",
    client: "SAME AÉREO",
    location: "Buenos Aires (Núñez)",
    fleetRequired: [{ model: "AW109", count: 1 }],
    description: "Contrato con SAME AÉREO para evacuaciones aeromédicas urbanas HEMS 24/7."
  },
  {
    id: "rosario",
    name: "Base Rosario",
    client: "UTV",
    location: "Aeropuerto de Rosario (SAAR)",
    fleetRequired: [{ model: "BO105", count: 1 }],
    description: "Contrato con UTV Emergencias desde el Aeropuerto de Rosario."
  },
  {
    id: "neuquen",
    name: "Base Neuquén",
    client: "Vista Energy",
    location: "Neuquén (Vaca Muerta)",
    fleetRequired: [
      { model: "BO105", count: 1 },
      { model: "AW109", count: 1 }
    ],
    description: "Contrato con Vista Energy para operaciones con 1 BO105 y 1 AW109."
  },
  {
    id: "cabo_virgenes",
    name: "Base Cabo Vírgenes",
    client: "PSM",
    location: "Cabo Vírgenes (Santa Cruz)",
    fleetRequired: [{ model: "AW109", count: 2 }],
    description: "Contrato con PSM operando con 2 helicópteros AW109SP."
  },
  {
    id: "sierra_grande",
    name: "Base Sierra Grande",
    client: "YPF Vmos",
    location: "Sierra Grande (Río Negro)",
    fleetRequired: [{ model: "BO105", count: 1 }],
    description: "Contrato con YPF Vmos operando con 1 BO105."
  },
  {
    id: "calafate",
    name: "Base El Calafate",
    client: "Solo Patagonia",
    location: "El Calafate (SAWC)",
    fleetRequired: [
      { model: "BN2B", count: 1 },
      { model: "RH44", count: 1 }
    ],
    description: "Contrato con Solo Patagonia operando 1 avión BN2B y 1 helicóptero RH44."
  }
];
