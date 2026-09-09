import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado. Inicie sesión para cambiar su clave." },
        { status: 401 }
      );
    }

    const { newPassword } = await request.json();

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "Debe ingresar su nueva contraseña." },
        { status: 400 }
      );
    }

    const cleanPassword = newPassword.trim();

    if (cleanPassword.length < 4) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 4 caracteres." },
        { status: 400 }
      );
    }

    if (cleanPassword.length > 8) {
      return NextResponse.json(
        { error: "La clave debe tener hasta 8 caracteres como máximo." },
        { status: 400 }
      );
    }

    // Hash new password securely
    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    // Update user record
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada con éxito.",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json(
      { error: "Error interno al intentar actualizar la contraseña." },
      { status: 500 }
    );
  }
}
