export interface Pilot {
  id: string;
  PILOTO: string;
  TELEFONO: string;
  DNI: string;
  FECHA_NAC: string;
  LICENCIA: string;
  CMA: string;
  AW109: string;
  BO105: string;
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
  documents?: any[]; // Simplified for now
}

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
