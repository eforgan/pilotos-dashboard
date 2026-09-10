import { z } from "zod";

export const flightLogSubmitSchema = z.object({
  pilotId: z.string().optional().nullable(),
  pilotName: z.string().trim().min(1, "El nombre del piloto es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
  aircraft: z.string().trim().min(1, "El modelo de aeronave es requerido"),
  tailNumber: z.string().trim().min(1, "La matrícula es requerida"),
  route: z.string().trim().optional().nullable(),
  dayHours: z.coerce.number().min(0).max(24),
  nightHours: z.coerce.number().min(0).max(24),
  ifrHours: z.coerce.number().min(0).max(24),
  landings: z.coerce.number().int().min(0),
});

export type FlightLogSubmitInput = z.infer<typeof flightLogSubmitSchema>;
