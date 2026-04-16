import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
    // Determine path based on environment
    // In dev/build, the file is in the root
    const dbPath = path.join(process.cwd(), "dev.db");
    
    const adapter = new PrismaBetterSqlite3({
        url: `file:${dbPath}`
    });
    
    return new PrismaClient({ adapter });
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
