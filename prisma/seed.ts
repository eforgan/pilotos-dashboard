import "dotenv/config";
import * as path from "path";
import * as fs from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

// Load .env explicitly from root
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in .env");
}
const prisma = new PrismaClient({
  adapter: new PrismaNeon(new Pool({ connectionString }))
});

async function main() {
  const jsonPath = path.join(process.cwd(), "src", "data", "pilots.json");
  
  if (!fs.existsSync(jsonPath)) {
    console.error("No pilots.json found to seed from.");
    return;
  }

  const pilotsData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  console.log(`Seeding ${pilotsData.length} pilots to Neon (PostgreSQL)...`);

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
