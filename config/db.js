import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// ES module imports are hoisted and evaluated before any of the importing
// module's own top-level statements run — so relying on the caller's own
// dotenv.config() call isn't safe. Load .env here too so DATABASE_URL is
// always set before the client is constructed, regardless of import order.
dotenv.config();

// Single shared Prisma Client instance for the whole process — every model
// imports `prisma` from here instead of instantiating its own client.
export const prisma = new PrismaClient();

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL Connected (Prisma)");
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};
