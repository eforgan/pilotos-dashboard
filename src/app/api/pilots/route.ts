import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const u = session.user as { role?: string; assignedBase?: string | null };
    const where = u.role === "BASE_SUPERVISOR" ? { BASE: u.assignedBase || "__none__" } : {};

    const pilots = await db.pilot.findMany({
      where,
      orderBy: { PILOTO: "asc" },
      include: {
        user: { select: { id: true, email: true, role: true, assignedBase: true } },
      },
    });
    return NextResponse.json(pilots);
  } catch (error) {
    console.error("Failed to fetch pilots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const data = await request.json();
    
    if (!data.PILOTO || typeof data.PILOTO !== "string" || !data.PILOTO.trim()) {
      return NextResponse.json({ error: "El nombre del piloto es obligatorio" }, { status: 400 });
    }

    if (!data.EMAIL || typeof data.EMAIL !== "string" || !data.EMAIL.trim().includes("@")) {
      return NextResponse.json({ error: "El correo electrónico es obligatorio" }, { status: 400 });
    }

    const inviteToken = crypto.randomUUID();

    const pilot = await db.pilot.create({
      data: {
        PILOTO: data.PILOTO.trim().toUpperCase(),
        DNI: data.DNI?.trim() || null,
        EMAIL: data.EMAIL.trim(),
        TELEFONO: data.TELEFONO?.trim() || null,
        BASE: data.BASE?.trim() || null,
        LICENCIA: data.LICENCIA?.trim() || null,
        CMA: data.CMA?.trim() || null,
        AW109: data.AW109 || null,
        BO105: data.BO105 || null,
        RH44: data.RH44 || null,
        BN2B: data.BN2B || null,
        inviteToken,
      },
    });

    const u = session.user as { id?: string };
    await logAudit({
      actorId: u.id,
      actorEmail: session.user?.email || null,
      action: "CREATE_INVITE",
      entityType: "Pilot",
      entityId: pilot.id,
      diff: { PILOTO: pilot.PILOTO, DNI: pilot.DNI },
    });

    return NextResponse.json(pilot, { status: 201 });
  } catch (error) {
    console.error("Failed to create pilot:", error);
    return NextResponse.json({ error: "Error al crear el piloto", details: String(error) }, { status: 500 });
  }
}
