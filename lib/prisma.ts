import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const dbUrl = new URL(process.env.DATABASE_URL);
  dbUrl.searchParams.delete("sslmode");

  const adapter = new PrismaPg({
    connectionString: dbUrl.toString(),
    ssl: { rejectUnauthorized: false }
  });

  const prisma = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
