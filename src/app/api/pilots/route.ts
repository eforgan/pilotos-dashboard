import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const pilots = await db.pilot.findMany({
      orderBy: { PILOTO: "asc" },
    });
    return NextResponse.json(pilots);
  } catch (error) {
    console.error("Failed to fetch pilots:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Simple bulk/upsert logic could go here if needed
    return NextResponse.json({ message: "Not implemented. Use PATCH /[id] for updates." }, { status: 501 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
