import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { fratSubmitSchema } from "@/lib/frat-schema";
import { allItems, computeFratScore, getFratSheet } from "@/lib/frat-data";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const u = session.user as { id?: string; role?: string };
    const requestingUser = await db.user.findUnique({ where: { id: u.id } });
    if (!requestingUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pilotIdParam = searchParams.get("pilotId");
    const typeParam = searchParams.get("type");
    const riskLevelParam = searchParams.get("riskLevel");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};

    if (requestingUser.role !== "ADMIN") {
      if (!requestingUser.pilotId) {
        return NextResponse.json([]);
      }
      where.pilotId = requestingUser.pilotId;
    } else if (pilotIdParam) {
      where.pilotId = pilotIdParam;
    }

    if (typeParam) where.type = typeParam;
    if (riskLevelParam) where.finalRiskLevel = riskLevelParam;
    if (from || to) {
      where.flightDate = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const forms = await db.fratForm.findMany({
      where,
      orderBy: { flightDate: "desc" },
      include: {
        pilot: { select: { id: true, PILOTO: true } },
        createdBy: { select: { id: true, email: true } },
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Failed to fetch FRAT forms:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const parsed = fratSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // El piloto no puede cargar un FRAT a nombre de otro piloto.
    let pilotId: string | null = data.pilotId ?? null;
    if (requestingUser.role !== "ADMIN") {
      if (!requestingUser.pilotId) {
        return NextResponse.json(
          { error: "Tu usuario no está vinculado a ningún legajo de piloto" },
          { status: 403 }
        );
      }
      pilotId = requestingUser.pilotId;
    }

    const sheet = getFratSheet(data.type);
    const items = allItems(sheet);
    const itemIds = new Set(items.map((i) => i.id));

    // Todas las preguntas del formulario deben tener respuesta.
    const missing = items.filter((i) => !data.responses[i.id]);
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Faltan responder ${missing.length} pregunta(s) del FRAT` },
        { status: 400 }
      );
    }
    // Descartar cualquier respuesta que no corresponda al formulario elegido.
    for (const key of Object.keys(data.responses)) {
      if (!itemIds.has(key)) delete data.responses[key];
    }

    // Todo ítem que arroje 2 (rojo) en el puntaje inicial requiere mitigación cargada.
    const unmitigated = items.filter((i) => {
      const r = data.responses[i.id];
      return r.initial === 2 && !r.mitigation?.trim();
    });
    if (unmitigated.length > 0) {
      return NextResponse.json(
        {
          error: `Debe cargar una acción de mitigación para: ${unmitigated
            .map((i) => i.label)
            .join(", ")}`,
        },
        { status: 400 }
      );
    }

    const score = computeFratScore(sheet, data.responses);

    if (score.finalLevel !== "ACCEPTABLE" && !data.decision?.trim()) {
      return NextResponse.json(
        {
          error:
            "El puntaje final requiere dejar constancia de la decisión tomada (autorización o cancelación del vuelo)",
        },
        { status: 400 }
      );
    }

    const form = await db.fratForm.create({
      data: {
        type: data.type,
        pilotId,
        createdById: requestingUser.id,
        flightDate: new Date(data.flightDate),
        base: data.base || null,
        aircraft: data.aircraft || null,
        picName: data.picName.trim(),
        sicName: data.sicName?.trim() || null,
        route: data.route?.trim() || null,
        etd: data.etd?.trim() || null,
        missionType: data.missionType?.trim() || null,
        crewModality: data.crewModality?.trim() || null,
        responses: data.responses,
        initialScore: score.initialScore,
        finalScore: score.finalScore,
        maxScore: score.max,
        riskLevel: score.initialLevel,
        finalRiskLevel: score.finalLevel,
        generalNotes: data.generalNotes?.trim() || null,
        decision: data.decision?.trim() || null,
        picSignature: data.picSignature || null,
      },
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error("Failed to create FRAT form:", error);
    return NextResponse.json({ error: "Error al registrar el FRAT" }, { status: 500 });
  }
}
