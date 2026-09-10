import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { baseSubmitSchema } from "@/lib/base-schema";
import { logAudit } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { id } = await params;

    const body = await request.json();
    const parsed = baseSubmitSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const base = await db.base.update({ where: { id }, data: parsed.data });

    const u = session.user as { id?: string };
    await logAudit({
      actorId: u.id,
      actorEmail: session.user?.email || null,
      action: "UPDATE",
      entityType: "Base",
      entityId: id,
      diff: parsed.data,
    });

    return NextResponse.json(base);
  } catch (error) {
    console.error("Failed to update base:", error);
    return NextResponse.json({ error: "Error al actualizar la base" }, { status: 500 });
  }
}

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

    const existing = await db.base.findUnique({
      where: { id },
      include: { aircraft: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Base no encontrada" }, { status: 404 });
    }

    await db.aircraft.deleteMany({ where: { baseId: id } });
    await db.base.delete({ where: { id } });

    const u = session.user as { id?: string };
    await logAudit({
      actorId: u.id,
      actorEmail: session.user?.email || null,
      action: "DELETE",
      entityType: "Base",
      entityId: id,
      diff: {
        name: existing.name,
        client: existing.client,
        aircraft: existing.aircraft.map((a) => `${a.model} ${a.tailNumber}`),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete base:", error);
    return NextResponse.json({ error: "Error al eliminar la base" }, { status: 500 });
  }
}
