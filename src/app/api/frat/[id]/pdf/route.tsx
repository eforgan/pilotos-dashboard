import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { FratPdfDocument } from "@/lib/frat-pdf";
import { FratResponses, FratType } from "@/lib/frat-data";

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

    const u = session.user as { id?: string };
    const requestingUser = await db.user.findUnique({ where: { id: u.id } });
    if (!requestingUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const form = await db.fratForm.findUnique({
      where: { id },
      include: { pilot: { select: { PILOTO: true } } },
    });

    if (!form) {
      return NextResponse.json({ error: "FRAT no encontrado" }, { status: 404 });
    }

    if (requestingUser.role !== "ADMIN" && form.pilotId !== requestingUser.pilotId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const buffer = await renderToBuffer(
      <FratPdfDocument
        type={form.type as FratType}
        flightDate={form.flightDate.toLocaleDateString("es-AR")}
        base={form.base}
        aircraft={form.aircraft}
        picName={form.picName}
        sicName={form.sicName}
        route={form.route}
        etd={form.etd}
        missionType={form.missionType}
        pilotName={form.pilot?.PILOTO}
        responses={form.responses as unknown as FratResponses}
        generalNotes={form.generalNotes}
        decision={form.decision}
        createdAt={form.createdAt.toLocaleString("es-AR")}
      />
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="FRAT-${form.picName.replace(/\s+/g, "_")}-${form.flightDate
          .toISOString()
          .slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate FRAT PDF:", error);
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 });
  }
}
