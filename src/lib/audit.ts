import { db } from "./db";
import type { Prisma } from "@prisma/client";

export interface AuditEntry {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  diff?: Prisma.InputJsonValue | null;
}

// Fire-and-forget: an audit write failing should never block the action it's
// recording, so errors are logged but not thrown.
export async function logAudit(entry: AuditEntry) {
  try {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actorEmail: entry.actorEmail ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        diff: entry.diff ?? undefined,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
