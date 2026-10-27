import { NextResponse } from "next/server";
import { ACCESS_GATE_COOKIE, checkAccessPassword, computeAccessGateToken } from "@/lib/access-gate";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || !checkAccessPassword(String(password))) {
      return NextResponse.json({ error: "Clave de acceso incorrecta." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ACCESS_GATE_COOKIE, computeAccessGateToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
}
