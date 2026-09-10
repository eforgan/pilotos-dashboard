import { NextResponse } from "next/server";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { pilotImportRowSchema, PILOT_IMPORT_COLUMNS } from "@/lib/pilot-import-schema";
import { logAudit } from "@/lib/audit";

interface RowError {
  row: number;
  dni?: string;
  error: string;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string })?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    const text = await file.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: "Error al leer el CSV", details: parsed.errors.slice(0, 5) },
        { status: 400 }
      );
    }

    const unknownColumns = (parsed.meta.fields || []).filter(
      (f) => !(PILOT_IMPORT_COLUMNS as readonly string[]).includes(f)
    );

    const errors: RowError[] = [];
    let created = 0;
    let updated = 0;

    const u = session.user as { id?: string };

    for (let i = 0; i < parsed.data.length; i++) {
      const rawRow = parsed.data[i];
      const rowNum = i + 2; // +1 for header row, +1 for 1-indexing

      const cleaned = Object.fromEntries(
        Object.entries(rawRow).map(([k, v]) => [k, (v ?? "").trim()])
      );

      const result = pilotImportRowSchema.safeParse(cleaned);
      if (!result.success) {
        errors.push({
          row: rowNum,
          dni: cleaned.DNI,
          error: Object.values(result.error.flatten().fieldErrors).flat().join("; "),
        });
        continue;
      }

      const { DNI, ...rest } = result.data;

      try {
        const existing = await db.pilot.findUnique({ where: { DNI } });
        const data = Object.fromEntries(
          Object.entries(rest).filter(([, v]) => v !== undefined && v !== "")
        );

        if (existing) {
          await db.pilot.update({ where: { DNI }, data });
          updated++;
          await logAudit({
            actorId: u.id,
            actorEmail: session.user?.email || null,
            action: "IMPORT_UPDATE",
            entityType: "Pilot",
            entityId: existing.id,
          });
        } else {
          const createdPilot = await db.pilot.create({
            data: { PILOTO: result.data.PILOTO, DNI, ...data },
          });
          created++;
          await logAudit({
            actorId: u.id,
            actorEmail: session.user?.email || null,
            action: "IMPORT_CREATE",
            entityType: "Pilot",
            entityId: createdPilot.id,
          });
        }
      } catch (err) {
        errors.push({
          row: rowNum,
          dni: DNI,
          error: err instanceof Error ? err.message : "Error al guardar la fila",
        });
      }
    }

    return NextResponse.json({
      created,
      updated,
      errorCount: errors.length,
      errors: errors.slice(0, 50),
      unknownColumns,
    });
  } catch (error) {
    console.error("Pilot import failed:", error);
    return NextResponse.json({ error: "Error al importar el archivo" }, { status: 500 });
  }
}
