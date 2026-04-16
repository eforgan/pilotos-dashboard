import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await db.user.update({
      where: { email: "admin@empresa.com" },
      data: { password: "$2b$10$3H/t4pkG1pFkB6F0LgO54eHTlpx5noLIDItN7y1OLYML5vasqKjHe" }
    });
    return NextResponse.json({ success: true, message: "Admin password reset successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
  }
}
