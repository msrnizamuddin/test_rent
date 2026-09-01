import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { pool } from "../config/db.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const run = async () => {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");
  try {
    await pool.query(sql);
    console.log("✅ Schema applied successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

run();
