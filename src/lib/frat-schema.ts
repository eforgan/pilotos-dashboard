import { z } from "zod";

const scoreValue = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const fratResponseValueSchema = z.object({
  initial: scoreValue,
  final: scoreValue,
  mitigation: z.string().optional(),
});

export const fratSubmitSchema = z.object({
  type: z.enum(["TRAINING", "DAILY_OPS"]),
  pilotId: z.string().optional().nullable(),
  flightDate: z.string().min(1, "La fecha del vuelo es obligatoria"),
  base: z.string().optional(),
  aircraft: z.string().optional(),
  picName: z.string().min(1, "El nombre del Comandante (PIC) es obligatorio"),
  sicName: z.string().optional(),
  route: z.string().optional(),
  etd: z.string().optional(),
  missionType: z.string().optional(),
  responses: z.record(z.string(), fratResponseValueSchema),
  generalNotes: z.string().optional(),
  decision: z.string().optional(),
});

export type FratSubmitInput = z.infer<typeof fratSubmitSchema>;
