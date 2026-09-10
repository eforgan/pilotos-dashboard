import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { pilotPatchSchema } from "@/lib/pilot-schema";
import { logAudit } from "@/lib/audit";
import { canAccessBase } from "@/lib/auth-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const pilot = await db.pilot.findUnique({
      where: { id },
      include: {
        documents: true,
        user: true,
      }
    });

    if (!pilot) {
      return NextResponse.json({ error: "Pilot not found" }, { status: 404 });
    }

    // Role-based check: ADMIN sees everyone, BASE_SUPERVISOR sees their base,
    // a pilot sees their own legajo.
    const u = session.user as { id?: string; pilotId?: string; role?: string; assignedBase?: string | null };
    if (!canAccessBase(u, pilot.BASE) && u.id !== id && u.pilotId !== id) {
      const user = await db.user.findUnique({ where: { id: u.id } });
      if (user?.pilotId !== id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
      }
    }

    return NextResponse.json(pilot);
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const existingPilot = await db.pilot.findUnique({ where: { id }, select: { BASE: true } });
    if (!existingPilot) {
      return NextResponse.json({ error: "Piloto no encontrado" }, { status: 404 });
    }

    // Role-based check
    const u = session.user as { id?: string; role?: string; assignedBase?: string | null };
    if (!canAccessBase(u, existingPilot.BASE)) {
        const user = await db.user.findUnique({ where: { id: u.id } });
        if (user?.pilotId !== id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
    }

    const data = await request.json();

    // Remove metadata and relation fields from update data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, createdAt, updatedAt, documents, user, ...updateData } = data;

    const parsed = pilotPatchSchema.safeParse(updateData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const pilot = await db.pilot.update({
      where: { id },
      data: parsed.data,
    });

    await logAudit({
      actorId: u.id,
      actorEmail: session.user?.email || null,
      action: "UPDATE",
      entityType: "Pilot",
      entityId: id,
      diff: parsed.data,
    });

    return NextResponse.json(pilot);
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Failed to update pilot" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Delete associated documents first
    await db.document.deleteMany({
      where: { pilotId: id },
    });

    // Delete associated user account if exists
    await db.user.deleteMany({
      where: { pilotId: id },
    });

    // Delete pilot record
    await db.pilot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Piloto eliminado correctamente" });
  } catch (error) {
    console.error("Delete pilot failed:", error);
    return NextResponse.json({ error: "Error al eliminar piloto", details: String(error) }, { status: 500 });
  }
}
