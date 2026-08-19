import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const pilotId = formData.get("pilotId") as string;

    if (!file || !pilotId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let imageUrl = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

    // Try saving locally for persistent static serve if filesystem is writable
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
      await mkdir(uploadDir, { recursive: true });
      const filename = `${pilotId}-${Date.now()}${path.extname(file.name) || ".jpg"}`;
      const absolutePath = path.join(uploadDir, filename);
      await writeFile(absolutePath, buffer);
      imageUrl = `/uploads/profiles/${filename}`;
    } catch {
      // Fallback to base64 data URI for serverless production (Vercel)
    }

    // Update database
    await db.pilot.update({
      where: { id: pilotId },
      data: { imageUrl },
    });

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
