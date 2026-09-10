import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id } = await params;

    const existing = await db.aircraft.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Aeronave no encontrada" }, { status: 404 });
    }

    await db.aircraft.delete({ where: { id } });

    const u = session.user as { id?: string };
    await logAudit({
      actorId: u.id,
      actorEmail: session.user?.email || null,
      action: "DELETE",
      entityType: "Aircraft",
      entityId: id,
      diff: { model: existing.model, tailNumber: existing.tailNumber, baseId: existing.baseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete aircraft:", error);
    return NextResponse.json({ error: "Error al eliminar la aeronave" }, { status: 500 });
  }
}
