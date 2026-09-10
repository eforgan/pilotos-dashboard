import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { logAudit } from "@/lib/audit";
import { canAccessBase } from "@/lib/auth-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const u = session.user as { id?: string; role?: string; assignedBase?: string | null };

    const existingDoc = await db.document.findUnique({
      where: { id },
      select: { pilot: { select: { BASE: true } } },
    });
    if (!existingDoc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }
    if (!canAccessBase(u, existingDoc.pilot.BASE)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const data = await request.json();
    const verified = Boolean(data.verified);
    const signature = typeof data.signature === "string" ? data.signature : null;

    const doc = await db.document.update({
      where: { id },
      data: {
        verified,
        verifiedSignature: verified ? signature : null,
      },
    });

    await logAudit({
      actorId: u.id,
      actorEmail: session.user?.email || null,
      action: verified ? "VERIFY" : "UNVERIFY",
      entityType: "Document",
      entityId: id,
      diff: { pilotId: doc.pilotId, type: doc.type },
    });

    return NextResponse.json({ success: true, document: doc });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
