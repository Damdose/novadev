import { PrismaClient } from "../generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

// Use Turso in production, local SQLite file in dev
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const adapter = tursoUrl
  ? new PrismaLibSql({ url: tursoUrl, authToken: tursoToken })
  : new PrismaLibSql({ url: `file:${path.resolve(process.cwd(), "dev.db")}` });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Ensure default settings row exists
export async function ensureSettings() {
  const existing = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!existing) {
    await prisma.settings.create({ data: { id: "default" } });
  }
  return prisma.settings.findUnique({ where: { id: "default" } });
}
