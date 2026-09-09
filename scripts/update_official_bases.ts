import { db } from "../src/lib/db";

async function updateBases() {
  console.log("=== UPDATING OFFICIAL PILOT BASES ===");

  const updates = [
    { nameMatch: "FORGAN", base: "Base Núñez" },
    { nameMatch: "CORNEJO", base: "Base BRM" },
    { nameMatch: "GALLO", base: "Base Neuquén" },
    { nameMatch: "GUERRERO", base: "Base Sierra Grande" },
    { nameMatch: "DIAZ", base: "Base Don Torcuato" },
    { nameMatch: "GRASSANO", base: "Base BRM" },
    { nameMatch: "PEREZ", base: "Base Rosario" },
    { nameMatch: "ROLLE", base: "Base El Calafate" },
    { nameMatch: "MARTIN", base: "Base El Calafate" },
  ];

  for (const item of updates) {
    const pilot = await db.pilot.findFirst({
      where: { PILOTO: { contains: item.nameMatch } }
    });

    if (pilot) {
      await db.pilot.update({
        where: { id: pilot.id },
        data: { BASE: item.base }
      });
      console.log(`Updated ${pilot.PILOTO} -> ${item.base}`);
    }
  }

  console.log("=== PILOT BASES UPDATED SUCCESSFULLY ===");
}

updateBases().catch(console.error);
