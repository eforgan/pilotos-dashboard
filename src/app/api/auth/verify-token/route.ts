import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token de invitación no especificado" }, { status: 400 });
  }

  try {
    const pilot = await db.pilot.findUnique({
      where: { inviteToken: token },
      include: { 
        user: true,
        documents: true,
      }
    });

    if (!pilot) {
      return NextResponse.json({ error: "Enlace de invitación no válido o expirado" }, { status: 404 });
    }

    if (pilot.user) {
      return NextResponse.json({ error: "Este piloto ya completó su registro e inició sesión previa" }, { status: 400 });
    }

    return NextResponse.json({ pilot });
  } catch (err) {
    console.error("Token verification error:", err);
    return NextResponse.json({ error: "Error del servidor al verificar invitación" }, { status: 500 });
  }
}
