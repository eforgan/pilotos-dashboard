import { neon } from "@neondatabase/serverless";

const bases = [
  "Base Núñez",
  "Base Rosario",
  "Base Neuquén",
  "Base Cabo Vírgenes",
  "Base Sierra Grande",
  "Base El Calafate"
];

async function main() {
  const connectionString = "postgresql://neondb_owner:npg_YlxtfsAoD1M4@ep-little-morning-a4qh58zw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const sql = neon(connectionString);

  try {
    const pilots = await sql`SELECT id, "PILOTO", "BASE", "AW109", "BO105", "RH44", "BN2B" FROM "Pilot"`;
    console.log(`Found ${pilots.length} pilots in database.`);

    for (let i = 0; i < pilots.length; i++) {
      const p = pilots[i];
      const assignedBase = bases[i % bases.length];
      
      // Update base if unassigned or placeholder
      await sql`UPDATE "Pilot" SET "BASE" = ${assignedBase} WHERE id = ${p.id}`;
      console.log(`Updated ${p.PILOTO} -> ${assignedBase}`);
    }

    console.log("All pilots successfully updated with official company bases!");
  } catch (e) {
    console.error("Error updating bases:", e);
  }
}

main();
