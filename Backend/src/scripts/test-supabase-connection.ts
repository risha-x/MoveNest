import { Client } from "pg";

// One-off check: confirms DATABASE_URL in .env actually reaches Supabase's
// Postgres before we build anything against it. Prints only pass/fail -
// never the connection string or any credential.
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("FAIL: DATABASE_URL is not set in the environment.");
    process.exitCode = 1;
    return;
  }

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    const result = await client.query("select 1 as ok");
    if (result.rows[0]?.ok === 1) {
      console.log("PASS: connected to Supabase Postgres and ran a query successfully.");
    } else {
      console.log("FAIL: connected, but the test query returned something unexpected.");
      process.exitCode = 1;
    }
  } catch (err) {
    console.error("FAIL: could not connect -", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
