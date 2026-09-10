import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { LogbookPdfDocument, LogbookPdfRow } from "@/lib/logbook-pdf";
import { formatDate } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const u = session.user as { id?: string };
    const requestingUser = await db.user.findUnique({ where: { id: u.id } });
    if (!requestingUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pilotIdParam = searchParams.get("pilotId");

    const where: Record<string, unknown> = {};
    let title = "Registro completo de la flota";

    if (requestingUser.role !== "ADMIN") {
      if (!requestingUser.pilotId) {
        return NextResponse.json({ error: "Tu usuario no está vinculado a ningún legajo de piloto" }, { status: 403 });
      }
      where.pilotId = requestingUser.pilotId;
    } else if (pilotIdParam && pilotIdParam !== "all") {
      where.pilotId = pilotIdParam;
    }

    if (where.pilotId) {
      const pilot = await db.pilot.findUnique({ where: { id: where.pilotId as string }, select: { PILOTO: true } });
      title = pilot ? `Piloto: ${pilot.PILOTO}` : title;
    }

    const logs = await db.flightLog.findMany({
      where,
      orderBy: { date: "desc" },
    });

    const rows: LogbookPdfRow[] = logs.map((l) => ({
      date: formatDate(l.date.toISOString()),
      pilotName: l.pilotName,
      aircraft: l.aircraft,
      tailNumber: l.tailNumber,
      route: l.route,
      dayHours: l.dayHours,
      nightHours: l.nightHours,
      totalHours: l.totalHours,
    }));

    // renderToBuffer offscreen-renders to a PDF buffer server-side — there's no
    // live DOM tree for an error boundary to protect, so this lint rule doesn't apply.
    const buffer = await renderToBuffer(
      // eslint-disable-next-line react-hooks/error-boundaries
      <LogbookPdfDocument title={title} rows={rows} createdAt={new Date().toLocaleString("es-AR")} />
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Logbook-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate logbook PDF:", error);
    return NextResponse.json({ error: "Error al generar el PDF" }, { status: 500 });
  }
}
