import { db } from "../src/lib/db";

async function generateTokens() {
  console.log("Generating tokens for pilots...");
  
  const pilots = await db.pilot.findMany({
    where: { inviteToken: null }
  });

  console.log(`Found ${pilots.length} pilots without tokens.`);

  for (const pilot of pilots) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await db.pilot.update({
      where: { id: pilot.id },
      data: { inviteToken: token }
    });
    console.log(`Token generated for ${pilot.PILOTO}: ${token}`);
  }

  console.log("Token generation complete.");
}

generateTokens()
  .catch(err => console.error(err))
  .finally(() => process.exit(0));
