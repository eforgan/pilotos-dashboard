import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const hash = await bcrypt.hash("adminpassword123", 10);
    const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_YlxtfsAoD1M4@ep-little-morning-a4qh58zw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
    const sql = neon(connectionString);

    const email = "admin@empresa.com";
    await sql`UPDATE "User" SET password = ${hash} WHERE email = ${email}`;

    return NextResponse.json({ 
      success: true, 
      message: "Admin password reset successfully to 'adminpassword123'",
      user: email,
      password: "adminpassword123"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Error" }, { status: 500 });
  }
}
