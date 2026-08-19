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
    const u = session.user as { id?: string; pilotId?: string; role?: string };
    if (u.role !== "ADMIN" && u.id !== id && u.pilotId !== id) {
        // Checking both userId and pilotId for flexibility
        const user = await db.user.findUnique({ where: { id: u.id } });
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
  } catch {
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
    const u = session.user as { id?: string; role?: string };
    if (u.role !== "ADMIN") {
        const user = await db.user.findUnique({ where: { id: u.id } });
        if (user?.pilotId !== id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }
    }

    const data = await request.json();
    
    // Remove metadata and relation fields from update data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, createdAt, updatedAt, documents, user, ...updateData } = data;
    
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Delete associated documents first
    await db.document.deleteMany({
      where: { pilotId: id },
    });

    // Delete associated user account if exists
    await db.user.deleteMany({
      where: { pilotId: id },
    });

    // Delete pilot record
    await db.pilot.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Piloto eliminado correctamente" });
  } catch (error) {
    console.error("Delete pilot failed:", error);
    return NextResponse.json({ error: "Error al eliminar piloto", details: String(error) }, { status: 500 });
  }
}
