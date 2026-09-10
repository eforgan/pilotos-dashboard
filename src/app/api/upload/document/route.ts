import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { put } from "@vercel/blob";
import { auth } from "@/auth";
import { canAccessBase } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pilotId = formData.get("pilotId") as string;
    const docType = formData.get("type") as string; // CMA, LICENCIA, etc.

    if (!file || !pilotId || !docType) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Security check
    const u = session.user as { role?: string; pilotId?: string; assignedBase?: string | null };
    if (u.role !== "ADMIN" && u.pilotId !== pilotId) {
        const targetPilot = await db.pilot.findUnique({ where: { id: pilotId }, select: { BASE: true } });
        if (!canAccessBase(u, targetPilot?.BASE)) {
          return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
    }

    const filename = `documents/${pilotId}/${docType}-${Date.now()}${getExtension(file.name)}`;
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // Record in DB
    const doc = await db.document.create({
      data: {
        type: docType,
        fileUrl: blob.url,
        fileName: file.name,
        pilotId: pilotId,
      },
    });

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Document upload failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.slice(idx);
}
