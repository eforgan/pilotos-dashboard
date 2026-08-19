import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

async function main() {
  const connectionString = "postgresql://neondb_owner:npg_YlxtfsAoD1M4@ep-little-morning-a4qh58zw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const pool = new Pool({ connectionString });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaNeon(pool as any);
  const prisma = new PrismaClient({ adapter });

  const adminEmail = "admin@empresa.com";
  const adminPasswordHash = "$2b$10$m3cEHqTKimr2nJRQL/0pLeeZEK51/NTZfx9/xdMwJFKCgthed1Mhe";

  try {
    console.log("Upserting admin user into Neon...");
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: adminPasswordHash,
            role: "ADMIN",
        },
        create: {
            email: adminEmail,
            password: adminPasswordHash,
            role: "ADMIN",
        },
    });
    console.log("SUCCESS: Admin user seeded:", admin.email);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("FATAL ERROR during seed:", e);
  process.exit(1);
});
