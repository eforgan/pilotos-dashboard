import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
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

    // Create a unique filename
    const filename = `${pilotId}-${Date.now()}${path.extname(file.name)}`;
    const relativePath = `/uploads/profiles/${filename}`;
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    // Write to public folder
    await writeFile(absolutePath, buffer);

    // Update database
    const updatedPilot = await db.pilot.update({
      where: { id: pilotId },
      data: { imageUrl: relativePath },
    });

    return NextResponse.json({ url: relativePath });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
