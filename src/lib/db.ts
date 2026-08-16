import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Hardcoded Supabase PostgreSQL URL — the shell env var DATABASE_URL is stale
// and points to a SQLite file, which breaks Prisma initialization.
const DATABASE_URL = "postgresql://postgres.cctlmfaylfgeiuyhaibd:rb34fQ4Shn.J%24%23G@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true";
const DIRECT_URL = "postgresql://postgres.cctlmfaylfgeiuyhaibd:rb34fQ4Shn.J%24%23G@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
