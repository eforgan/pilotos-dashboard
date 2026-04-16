import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/auth";

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
    if (session.user.role !== "ADMIN" && (session.user as any).pilotId !== pilotId) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directories
    const relativeDir = `/uploads/documents/${pilotId}`;
    const absoluteDir = path.join(process.cwd(), "public", relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    // Filename
    const filename = `${docType}-${Date.now()}${path.extname(file.name)}`;
    const relativePath = `${relativeDir}/${filename}`;
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    await writeFile(absolutePath, buffer);

    // Record in DB
    const doc = await db.document.create({
      data: {
        type: docType,
        fileUrl: relativePath,
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
