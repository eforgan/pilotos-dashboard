import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { aircraftSchema } from "@/lib/base-schema";

export async function POST(
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
    const parsed = aircraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const aircraft = await db.aircraft.create({
      data: { model: parsed.data.model, tailNumber: parsed.data.tailNumber, baseId: id },
    });

    return NextResponse.json(aircraft, { status: 201 });
  } catch (error) {
    console.error("Failed to create aircraft:", error);
    return NextResponse.json({ error: "Error al agregar la aeronave" }, { status: 500 });
  }
}
