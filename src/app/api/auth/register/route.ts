import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // 1. Find pilot by token
    const pilot = await db.pilot.findUnique({
      where: { inviteToken: token },
      include: { user: true }
    });

    if (!pilot) {
      return NextResponse.json({ error: "Token inválido" }, { status: 404 });
    }

    if (pilot.user) {
      return NextResponse.json({ error: "Este piloto ya está registrado" }, { status: 400 });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create user and link to pilot
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        pilotId: pilot.id,
        role: "PILOT"
      }
    });

    // 4. (Optional) Clear invite token after successful registration
    // Or keep it for reference? For security, better to clear it or mark as used.
    await db.pilot.update({
      where: { id: pilot.id },
      data: { inviteToken: null }
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    if (error.code === 'P2002') {
        return NextResponse.json({ error: "Este correo electrónico ya está en uso" }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
