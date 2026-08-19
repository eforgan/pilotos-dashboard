import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { token, email, password, pilotData } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Datos incompletos para el registro" }, { status: 400 });
    }

    // 1. Find pilot by invite token
    const pilot = await db.pilot.findUnique({
      where: { inviteToken: token },
      include: { user: true }
    });

    if (!pilot) {
      return NextResponse.json({ error: "Token de invitación no válido o ya utilizado" }, { status: 404 });
    }

    if (pilot.user) {
      return NextResponse.json({ error: "Este piloto ya completó su registro previo" }, { status: 400 });
    }

    // 2. Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update Pilot fields if pilotData was submitted
    if (pilotData && typeof pilotData === "object") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _, createdAt, updatedAt, documents, user, inviteToken, ...updateFields } = pilotData;
      
      // Ensure email in Pilot table matches submitted account email
      updateFields.EMAIL = email;

      await db.pilot.update({
        where: { id: pilot.id },
        data: updateFields,
      });
    }

    // 4. Create User login account linked to Pilot
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        pilotId: pilot.id,
        role: "PILOT"
      }
    });

    // 5. Clear inviteToken to prevent duplicate registrations
    await db.pilot.update({
      where: { id: pilot.id },
      data: { inviteToken: null }
    });

    return NextResponse.json({ success: true, userId: newUser.id });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "El correo electrónico o DNI ya se encuentra registrado en el sistema." }, { status: 400 });
    }
    console.error("Registration endpoint error:", error);
    return NextResponse.json({ error: "Error interno del servidor durante el registro." }, { status: 500 });
  }
}
