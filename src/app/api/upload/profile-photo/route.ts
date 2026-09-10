import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pilotId = formData.get("pilotId") as string;

    if (!file || !pilotId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const u = session.user as { role?: string; pilotId?: string | null };
    if (u.role !== "ADMIN" && u.pilotId !== pilotId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const ext = getExtension(file.name) || ".jpg";
    const filename = `profiles/${pilotId}-${Date.now()}${ext}`;
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "image/jpeg",
    });

    // Update database
    await db.pilot.update({
      where: { id: pilotId },
      data: { imageUrl: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx);
}
