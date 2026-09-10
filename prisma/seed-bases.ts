import { db } from "../src/lib/db";

interface SeedBase {
  name: string;
  client: string;
  location: string;
  description: string;
  aircraft: { model: string; tailNumber: string }[];
}

// Snapshot of the fleet/base data that used to live hardcoded in src/lib/types.ts
// (COMPANY_BASES), plus Base Cabo Vírgenes which was already in production use
// by 5 pilots but missing from that constant.
const BASES: SeedBase[] = [
  {
    name: "Base Sierra Grande",
    client: "YPF Vmos",
    location: "Sierra Grande (Río Negro)",
    description: "Contrato con YPF Vmos operando con helicóptero BO105 (LV-CSM).",
    aircraft: [{ model: "BO105", tailNumber: "LV-CSM" }],
  },
  {
    name: "Base BRM",
    client: "BRM",
    location: "Bahía Rincón / BRM",
    description: "Operaciones de la base BRM equipada con 2 helicópteros AgustaWestland AW109SP (LV-WLO y LV-WLP).",
    aircraft: [
      { model: "AW109SP", tailNumber: "LV-WLO" },
      { model: "AW109SP", tailNumber: "LV-WLP" },
    ],
  },
  {
    name: "Base Cabo Vírgenes",
    client: "PSM",
    location: "Base BRM Cabo Vírgenes, Santa Cruz",
    description: "Contrato con PSM operando con 2 helicópteros AgustaWestland AW109SP (LV-GWO y LV-GWP).",
    aircraft: [
      { model: "AW109SP", tailNumber: "LV-GWO" },
      { model: "AW109SP", tailNumber: "LV-GWP" },
    ],
  },
  {
    name: "Base Neuquén",
    client: "Vista Energy",
    location: "Neuquén (Vaca Muerta)",
    description: "Contrato con Vista Energy operando con AW109E (LV-KCR) y BO105 (LV-GID).",
    aircraft: [
      { model: "AW109E", tailNumber: "LV-KCR" },
      { model: "BO105", tailNumber: "LV-GID" },
    ],
  },
  {
    name: "Base Don Torcuato",
    client: "Mantenimiento / Operativa",
    location: "Don Torcuato (Buenos Aires)",
    description: "Base operativa y centro técnico operando con AW109E (LV-KNS) y AW109C (LV-WAE).",
    aircraft: [
      { model: "AW109E", tailNumber: "LV-KNS" },
      { model: "AW109C", tailNumber: "LV-WAE" },
    ],
  },
  {
    name: "Base Núñez",
    client: "SAME AÉREO",
    location: "Buenos Aires (Núñez / HEMS)",
    description: "Contrato con SAME AÉREO para evacuaciones aeromédicas urbanas HEMS 24/7 operando con BO105 (LV-FKS).",
    aircraft: [{ model: "BO105", tailNumber: "LV-FKS" }],
  },
  {
    name: "Base Rosario",
    client: "UTV Emergencias",
    location: "Aeropuerto de Rosario (SAAR)",
    description: "Contrato con UTV Emergencias desde el Aeropuerto de Rosario operando con BO105 (LV-GIE).",
    aircraft: [{ model: "BO105", tailNumber: "LV-GIE" }],
  },
  {
    name: "Base El Calafate",
    client: "Solo Patagonia",
    location: "El Calafate (SAWC)",
    description: "Contrato con Solo Patagonia operando avión BN2N (LV-WFR) y helicóptero RH44 (LV-CCV).",
    aircraft: [
      { model: "BN2N", tailNumber: "LV-WFR" },
      { model: "RH44", tailNumber: "LV-CCV" },
    ],
  },
];

async function main() {
  for (const b of BASES) {
    const existing = await db.base.findFirst({ where: { name: b.name } });
    const base = existing
      ? await db.base.update({
          where: { id: existing.id },
          data: { client: b.client, location: b.location, description: b.description },
        })
      : await db.base.create({
          data: { name: b.name, client: b.client, location: b.location, description: b.description },
        });

    for (const ac of b.aircraft) {
      await db.aircraft.upsert({
        where: { tailNumber: ac.tailNumber },
        create: { model: ac.model, tailNumber: ac.tailNumber, baseId: base.id },
        update: { model: ac.model, baseId: base.id },
      });
    }

    console.log(`Seeded ${b.name} (${b.aircraft.length} aeronaves)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
