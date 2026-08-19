import { neon } from "@neondatabase/serverless";

async function main() {
  const connectionString = "postgresql://neondb_owner:npg_YlxtfsAoD1M4@ep-little-morning-a4qh58zw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const sql = neon(connectionString);
  const email = "admin@empresa.com";
  try {
    const results = await sql`SELECT * FROM "User" WHERE email = ${email}`;
    console.log("Results:", results);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
