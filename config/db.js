import dotenv from "dotenv";
import pg from "pg";

// ES module imports are hoisted and evaluated before any of the importing
// module's own top-level statements run — so server.js's `dotenv.config()`
// call executes AFTER this module (and its `new Pool(...)` below) has
// already loaded if we relied on the caller for it. Load .env here too so
// DATABASE_URL is always set before the pool is constructed, regardless of
// import order.
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL client error:", err.message);
});

// Thin wrapper so modules never import `pg` directly.
export const query = (text, params) => pool.query(text, params);

export const connectDB = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL Connected");
  } catch (error) {
    console.error("❌ DB Connection Failed:", error.message);
    process.exit(1);
  }
};
