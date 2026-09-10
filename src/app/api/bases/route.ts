import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { baseSubmitSchema } from "@/lib/base-schema";

// Bases are read by any authenticated user (FRAT wizard, base coverage
// matrix), but only ADMIN can create/edit/delete them.
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const bases = await db.base.findMany({
      include: { aircraft: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(bases);
  } catch (error) {
    console.error("Failed to fetch bases:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = baseSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const base = await db.base.create({ data: parsed.data });
    return NextResponse.json(base, { status: 201 });
  } catch (error) {
    console.error("Failed to create base:", error);
    return NextResponse.json({ error: "Error al crear la base" }, { status: 500 });
  }
}
