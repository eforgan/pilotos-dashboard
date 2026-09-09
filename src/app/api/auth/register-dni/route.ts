import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sanitizeDni, isAdminDni, findPilotByDni } from "@/lib/dni";

export async function POST(request: Request) {
  try {
    const { dni, password, email } = await request.json();

    if (!dni || !password) {
      return NextResponse.json(
        { error: "Debe proporcionar su N° de DNI y una contraseña." },
        { status: 400 }
      );
    }

    const cleanDni = sanitizeDni(String(dni));

    if (!cleanDni || cleanDni.length < 6 || cleanDni.length > 10) {
      return NextResponse.json(
        { error: "El N° de DNI ingresado no es válido. Debe tener entre 6 y 10 dígitos numéricos." },
        { status: 400 }
      );
    }

    const cleanPassword = String(password).trim();
    if (cleanPassword.length < 4 || cleanPassword.length > 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener entre 4 y 8 caracteres." },
        { status: 400 }
      );
    }

    const userEmail = email && String(email).trim() !== "" ? String(email).trim() : `${cleanDni}@modena.com`;

    // 1. Check if user already exists (by email or DNI)
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { email: cleanDni },
          { pilot: { DNI: cleanDni } },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: `El DNI ${cleanDni} ya se encuentra registrado. Ingrese con su contraseña o contacte al administrador.` },
        { status: 400 }
      );
    }

    // 2. Determine role & find the matching Pilot record by DNI
    const userRole = isAdminDni(cleanDni) ? "ADMIN" : "PILOT";
    const pilot = await findPilotByDni(db, cleanDni);

    // 3. Securely hash password
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // 4. Create User linked to Pilot record
    const newUser = await db.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        role: userRole,
        pilotId: pilot ? pilot.id : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registro completado con éxito",
      userId: newUser.id,
      role: newUser.role,
      pilotId: newUser.pilotId,
    });
  } catch (error) {
    console.error("Error en registro por DNI:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Este DNI o correo electrónico ya cuenta con un usuario registrado." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor durante el registro." },
      { status: 500 }
    );
  }
}
