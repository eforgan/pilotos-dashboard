import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { db } = await import("@/lib/db");
    const userCount = await db.user.count();

    return NextResponse.json({ 
      message: "Debug FINAL Prisma Check", 
      status: "ok",
      userCount,
      env: {
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "DB Check failed", 
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DATABASE_URL_VAL: process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 200 });
  }
}
