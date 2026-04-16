import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Role-based check
    if (session.user.role !== "ADMIN" && (session.user as any).id !== id && (session.user as any).pilotId !== id) {
        // Checking both userId and pilotId for flexibility
        const user = await db.user.findUnique({ where: { id: (session.user as any).id } });
        if (user?.pilotId !== id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
    }

    const pilot = await db.pilot.findUnique({
      where: { id },
      include: { 
        documents: true,
        user: true,
      }
    });
    
    if (!pilot) {
      return NextResponse.json({ error: "Pilot not found" }, { status: 404 });
    }
    
    return NextResponse.json(pilot);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Role-based check
    if (session.user.role !== "ADMIN") {
        const user = await db.user.findUnique({ where: { id: (session.user as any).id } });
        if (user?.pilotId !== id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
    }

    const data = await request.json();
    
    // Remove metadata fields from update data if present
    const { id: _, createdAt, updatedAt, ...updateData } = data;
    
    const pilot = await db.pilot.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json(pilot);
  } catch (error) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: "Failed to update pilot" }, { status: 500 });
  }
}
