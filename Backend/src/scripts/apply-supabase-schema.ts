import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

// Applies Database/supabase_schema.sql against the Supabase Postgres pointed
// to by DATABASE_URL, then verifies what actually landed. Never prints the
// connection string or any credential.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "..", "..", "Database", "supabase_schema.sql");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("FAIL: DATABASE_URL is not set in the environment.");
    process.exitCode = 1;
    return;
  }

  const sql = readFileSync(schemaPath, "utf8");
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    await client.query(sql);
    console.log("Schema applied.\n");

    const tables = await client.query(`
      select table_name from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `);
    console.log("Tables in public schema:", tables.rows.map((r) => r.table_name).join(", "));

    const policies = await client.query(`
      select tablename, policyname from pg_policies
      where schemaname = 'public'
      order by tablename
    `);
    console.log("\nRLS policies:");
    for (const row of policies.rows) {
      console.log(`  - ${row.tablename}: "${row.policyname}"`);
    }

    const rls = await client.query(`
      select relname, relrowsecurity from pg_class
      where relnamespace = 'public'::regnamespace and relkind = 'r'
      order by relname
    `);
    console.log("\nRow Level Security enabled:");
    for (const row of rls.rows) {
      console.log(`  - ${row.relname}: ${row.relrowsecurity ? "ON" : "OFF"}`);
    }
  } catch (err) {
    console.error("FAIL:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
