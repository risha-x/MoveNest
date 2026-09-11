import { supabaseAdmin } from "../lib/supabaseAdmin.js";

// Proves the admin client can actually authenticate against Supabase (not
// just that it constructs without throwing). Prints only counts/booleans -
// never any credential, user email, or token.
async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error("FAIL: admin client could not reach Supabase Auth -", error.message);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS: admin client authenticated successfully. Auth users so far: ${data.users.length}.`);
}

main();
