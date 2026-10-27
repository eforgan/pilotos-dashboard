import { db } from "../src/lib/db";

// One-time backfill: seed BASES_OPERATIVAS with each pilot's current single
// BASE value, so the new assignment grid starts pre-checked instead of blank.
// Safe to re-run: only touches pilots whose BASES_OPERATIVAS is still empty.
async function main() {
  const pilots = await db.pilot.findMany({
    select: { id: true, PILOTO: true, BASE: true, BASES_OPERATIVAS: true },
  });

  let updated = 0;
  for (const p of pilots) {
    if (p.BASES_OPERATIVAS.length > 0) continue;
    if (!p.BASE || !p.BASE.trim()) continue;

    await db.pilot.update({
      where: { id: p.id },
      data: { BASES_OPERATIVAS: [p.BASE.trim()] },
    });
    console.log(`OK: ${p.PILOTO} -> [${p.BASE.trim()}]`);
    updated++;
  }

  console.log(`\nTotal pilotos actualizados: ${updated}`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
