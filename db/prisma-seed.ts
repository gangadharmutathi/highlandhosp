import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

// Use DIRECT_URL for seeding — bypasses the connection pooler
// which causes ECONNREFUSED errors during seed operations
const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
