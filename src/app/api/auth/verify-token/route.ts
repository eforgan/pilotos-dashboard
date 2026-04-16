import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token faltante" }, { status: 400 });
  }

  try {
    const pilot = await db.pilot.findUnique({
      where: { inviteToken: token },
      select: { 
        id: true, 
        PILOTO: true, 
        DNI: true,
        user: true 
      }
    });

    if (!pilot) {
      return NextResponse.json({ error: "Enlace de invitación no válido" }, { status: 404 });
    }

    if (pilot.user) {
      return NextResponse.json({ error: "Este piloto ya está registrado" }, { status: 400 });
    }

    return NextResponse.json({ pilot });
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
