import { z } from "zod";

export const aircraftSchema = z.object({
  model: z.string().trim().min(1, "El modelo es requerido"),
  tailNumber: z.string().trim().min(1, "La matrícula es requerida"),
});

export const baseSubmitSchema = z.object({
  name: z.string().trim().min(1, "El nombre de la base es requerido"),
  client: z.string().trim().min(1, "El cliente/contrato es requerido"),
  location: z.string().trim().min(1, "La ubicación es requerida"),
  description: z.string().trim().optional().nullable(),
});
