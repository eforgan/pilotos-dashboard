import { z } from "zod";
import { TRACKABLE_FIELDS } from "./types";

// The trackable certification fields drive the alert/expiration engine
// (see getPilotExpirations in utils.ts), so their values must be either a
// clean ISO date or one of the two sentinels it understands — "N.A."
// (not applicable) and "CURRENT" (indefinite validity, no expiration).
// Other Pilot fields (VACACIONES, RO, INSP_RECONOC, aircraft ratings, etc.)
// hold free-form operational notes in practice and are intentionally left
// unvalidated here.
export const dateOrSentinel = z
  .union([
    z.literal(""),
    z.literal("N.A."),
    z.literal("CURRENT"),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (usar AAAA-MM-DD)"),
  ])
  .nullable()
  .optional();

const trackableFieldShape = Object.fromEntries(
  TRACKABLE_FIELDS.map((f) => [f.key, dateOrSentinel])
);

export const pilotPatchSchema = z.object(trackableFieldShape).passthrough();
