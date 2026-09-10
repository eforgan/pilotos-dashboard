import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { flightLogSubmitSchema } from "@/lib/logbook-schema";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const u = session.user as { id?: string };
    const requestingUser = await db.user.findUnique({ where: { id: u.id } });
    if (!requestingUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pilotIdParam = searchParams.get("pilotId");

    const where: Record<string, unknown> = {};
    if (requestingUser.role !== "ADMIN") {
      if (!requestingUser.pilotId) {
        return NextResponse.json([]);
      }
      where.pilotId = requestingUser.pilotId;
    } else if (pilotIdParam && pilotIdParam !== "all") {
      where.pilotId = pilotIdParam;
    }

    const logs = await db.flightLog.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch flight logs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const u = session.user as { id?: string };
    const requestingUser = await db.user.findUnique({ where: { id: u.id } });
    if (!requestingUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = flightLogSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // Un piloto no-admin solo puede cargar vuelos a su propio legajo.
    let pilotId: string | null = data.pilotId ?? null;
    if (requestingUser.role !== "ADMIN") {
      if (!requestingUser.pilotId) {
        return NextResponse.json(
          { error: "Tu usuario no está vinculado a ningún legajo de piloto" },
          { status: 403 }
        );
      }
      pilotId = requestingUser.pilotId;
    }

    const totalHours = data.dayHours + data.nightHours;

    const log = await db.flightLog.create({
      data: {
        pilotId,
        pilotName: data.pilotName,
        createdById: requestingUser.id,
        date: new Date(data.date),
        aircraft: data.aircraft,
        tailNumber: data.tailNumber,
        route: data.route || null,
        dayHours: data.dayHours,
        nightHours: data.nightHours,
        ifrHours: data.ifrHours,
        landings: data.landings,
        totalHours,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Failed to create flight log:", error);
    return NextResponse.json({ error: "Error al registrar el vuelo" }, { status: 500 });
  }
}
