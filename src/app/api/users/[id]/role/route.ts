import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const roleUpdateSchema = z.object({
  role: z.enum(["ADMIN", "BASE_SUPERVISOR", "PILOT"]),
  assignedBase: z.string().trim().nullable().optional(),
});

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
    const parsed = roleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.role !== "BASE_SUPERVISOR" && parsed.data.assignedBase) {
      return NextResponse.json(
        { error: "assignedBase solo aplica al rol BASE_SUPERVISOR" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: {
        role: parsed.data.role,
        assignedBase: parsed.data.role === "BASE_SUPERVISOR" ? parsed.data.assignedBase || null : null,
      },
    });

    const u = session.user as { id?: string };
    await logAudit({
      actorId: u.id,
      actorEmail: session.user?.email || null,
      action: "UPDATE_ROLE",
      entityType: "User",
      entityId: id,
      diff: { role: user.role, assignedBase: user.assignedBase },
    });

    return NextResponse.json({ id: user.id, role: user.role, assignedBase: user.assignedBase });
  } catch (error) {
    console.error("Failed to update user role:", error);
    return NextResponse.json({ error: "Error al actualizar el rol" }, { status: 500 });
  }
}
