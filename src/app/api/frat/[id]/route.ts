import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

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

    const u = session.user as { id?: string };
    const requestingUser = await db.user.findUnique({ where: { id: u.id } });
    if (!requestingUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const form = await db.fratForm.findUnique({
      where: { id },
      include: {
        pilot: { select: { id: true, PILOTO: true, BASE: true } },
        createdBy: { select: { id: true, email: true } },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "FRAT no encontrado" }, { status: 404 });
    }

    if (requestingUser.role !== "ADMIN" && form.pilotId !== requestingUser.pilotId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Failed to fetch FRAT form:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
