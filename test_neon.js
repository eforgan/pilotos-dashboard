import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = "postgresql://neondb_owner:npg_YlxtfsAoD1M4@ep-little-morning-a4qh58zw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const sql = neon(connectionString);
  const email = "admin@empresa.com";
  const pass = "adminpassword123";

  try {
    const hash = await bcrypt.hash(pass, 10);
    console.log(`Hashing '${pass}' -> ${hash}`);

    const res = await sql`UPDATE "User" SET password = ${hash} WHERE email = ${email} RETURNING id, email, role`;
    console.log("Updated rows:", res);

    if (res.length === 0) {
      console.log("Creating admin user...");
      const created = await sql`INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt") VALUES (${'admin-1'}, ${email}, ${hash}, ${'ADMIN'}, NOW(), NOW()) RETURNING id, email, role`;
      console.log("Created user:", created);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
