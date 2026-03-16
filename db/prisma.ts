//db/prisma.ts

import { PrismaClient } from "../db/generated/client"; // Point to your custom output
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Setup the connection pool using your DATABASE_URL (Transaction mode)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// 2. Prevent multiple instances of Prisma Client in development
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
