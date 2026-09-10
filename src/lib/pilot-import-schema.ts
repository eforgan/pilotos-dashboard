import { z } from "zod";
import { dateOrSentinel } from "./pilot-schema";

// Columns accepted in a bulk pilot import CSV. These mirror the raw Pilot
// field names (not the human-readable export headers in ExcelExportButton,
// which drop several trackable fields) so the template round-trips cleanly.
export const PILOT_IMPORT_COLUMNS = [
  "PILOTO",
  "DNI",
  "BASE",
  "EMAIL",
  "TELEFONO",
  "FECHA_NAC",
  "LICENCIA",
  "CMA",
  "CONTROL_BIENAL",
  "SIMULADOR",
  "CTRL_IDONEIDAD",
  "CTRL_RUTA",
  "CTRL_VLO_INST",
  "CRM_FFHH",
  "MERC_PELIGROSAS",
  "INTERF_ILICITA",
  "MOE",
  "SMS",
  "CURSO_AERONAVE",
  "HUET",
] as const;

const freeText = z.string().trim().optional();

export const pilotImportRowSchema = z.object({
  PILOTO: z.string().trim().min(1, "El nombre del piloto es requerido"),
  DNI: z.string().trim().min(1, "El DNI es requerido"),
  BASE: freeText,
  EMAIL: freeText,
  TELEFONO: freeText,
  FECHA_NAC: freeText,
  LICENCIA: freeText,
  CMA: dateOrSentinel,
  CONTROL_BIENAL: dateOrSentinel,
  SIMULADOR: dateOrSentinel,
  CTRL_IDONEIDAD: dateOrSentinel,
  CTRL_RUTA: dateOrSentinel,
  CTRL_VLO_INST: dateOrSentinel,
  CRM_FFHH: dateOrSentinel,
  MERC_PELIGROSAS: dateOrSentinel,
  INTERF_ILICITA: dateOrSentinel,
  MOE: dateOrSentinel,
  SMS: dateOrSentinel,
  CURSO_AERONAVE: dateOrSentinel,
  HUET: dateOrSentinel,
});

export type PilotImportRow = z.infer<typeof pilotImportRowSchema>;
