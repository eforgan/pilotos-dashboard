import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await db.user.update({
      where: { email: "admin@empresa.com" },
      data: { password: "$2b$10$m3cEHqTKimr2nJRQL/0pLeeZEK51/NTZfx9/xdMwJFKCgthed1Mhe" }
    });
    return NextResponse.json({ success: true, message: "Admin password reset successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
