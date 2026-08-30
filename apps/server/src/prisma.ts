import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Single shared client for the process. `tsx watch` reloads the module tree on
// change, so reuse an instance stashed on globalThis to avoid connection churn.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
