import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  // On Vercel Serverless environment, copy SQLite file to writable /tmp
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    const tmpDbPath = "/tmp/dev.db";
    const srcDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (fs.existsSync(srcDbPath)) {
        fs.copyFileSync(srcDbPath, tmpDbPath);
        return `file:${tmpDbPath}`;
      }
    } catch (e) {
      console.error("Vercel SQLite sync error:", e);
    }
  }
  return process.env.DATABASE_URL || "file:./prisma/dev.db";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
