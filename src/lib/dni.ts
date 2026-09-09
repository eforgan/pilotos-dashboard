import type { PrismaClient } from "@prisma/client";

/** Strips dots, spaces and hyphens from a DNI (or DNI-as-password) input. */
export function sanitizeDni(input: string): string {
  return String(input).trim().replace(/[\s.-]/g, "");
}

/**
 * DNIs allowed to auto-provision as ADMIN on first login / self-registration.
 * Configurable via ADMIN_DNIS (comma-separated) so it isn't a literal baked into source.
 */
export const ADMIN_DNIS = (process.env.ADMIN_DNIS || "12572581")
  .split(",")
  .map((d) => sanitizeDni(d))
  .filter(Boolean);

export function isAdminDni(cleanDni: string): boolean {
  return ADMIN_DNIS.includes(cleanDni);
}

export interface PilotDniMatch {
  id: string;
  PILOTO: string;
  DNI: string | null;
  EMAIL: string | null;
}

/**
 * Finds a Pilot by DNI, tolerant of punctuation stored in the DNI column
 * (e.g. "12.572.581"). Tries the indexed exact match first, and only falls
 * back to a single punctuation-insensitive SQL query (never a full-table scan).
 */
export async function findPilotByDni(
  db: PrismaClient,
  cleanDni: string
): Promise<PilotDniMatch | null> {
  const exact = await db.pilot.findFirst({
    where: { DNI: cleanDni },
    select: { id: true, PILOTO: true, DNI: true, EMAIL: true },
  });
  if (exact) return exact;

  const rows = await db.$queryRaw<PilotDniMatch[]>`
    SELECT id, "PILOTO", "DNI", "EMAIL"
    FROM "Pilot"
    WHERE REPLACE(REPLACE(REPLACE("DNI", '.', ''), ' ', ''), '-', '') = ${cleanDni}
    LIMIT 1
  `;
  return rows[0] ?? null;
}
