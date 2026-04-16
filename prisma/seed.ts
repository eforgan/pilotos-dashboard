import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

// Prisma 7 requires a driver adapter for direct SQLite connections
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const jsonPath = path.join(process.cwd(), "src", "data", "pilots.json");
  
  if (!fs.existsSync(jsonPath)) {
    console.error("No pilots.json found to seed from.");
    return;
  }

  const pilotsData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Seeding ${pilotsData.length} pilots...`);

  for (const pilot of pilotsData) {
    await prisma.pilot.upsert({
      where: { DNI: pilot.DNI || "" },
      update: {},
      create: {
        PILOTO: pilot.PILOTO,
        TELEFONO: pilot.TELEFONO,
        DNI: pilot.DNI,
        FECHA_NAC: pilot.FECHA_NAC,
        LICENCIA: pilot.LICENCIA,
        CMA: pilot.CMA,
        AW109: pilot.AW109,
        BO105: pilot.BO105,
        CONTROL_BIENAL: pilot.CONTROL_BIENAL,
        INSP_RECONOC: pilot.INSP_RECONOC,
        SIMULADOR: pilot.SIMULADOR,
        CTRL_IDONEIDAD: pilot.CTRL_IDONEIDAD,
        CTRL_RUTA: pilot.CTRL_RUTA,
        CTRL_VLO_INST: pilot.CTRL_VLO_INST,
        EXP_RECIENTE: pilot.EXP_RECIENTE,
        ULT_FOLIADO: pilot.ULT_FOLIADO,
        CRM_FFHH: pilot.CRM_FFHH,
        MERC_PELIGROSAS: pilot.MERC_PELIGROSAS,
        INTERF_ILICITA: pilot.INTERF_ILICITA,
        MOE: pilot.MOE,
        SMS: pilot.SMS,
        CURSO_AERONAVE: pilot.CURSO_AERONAVE,
        VACACIONES: pilot.VACACIONES,
        INSP_IR: pilot.INSP_IR,
        BASE: pilot.BASE,
        HUET: pilot.HUET,
        RO: pilot.RO,
      },
    });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
