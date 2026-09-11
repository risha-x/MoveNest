import { createClient } from "@supabase/supabase-js";

// Proves the publishable-key client can actually reach Supabase (not just
// that it constructs without error). Run outside Vite, so it reads
// process.env directly rather than import.meta.env.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabasePublishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.error("FAIL: VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set in Frontend/.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabasePublishableKey);

const { data, error } = await supabase.auth.getSession();
if (error) {
  console.error("FAIL: client could not reach Supabase -", error.message);
  process.exit(1);
}
console.log(`PASS: publishable client reached Supabase successfully. Session: ${data.session ? "active" : "none (expected, no sign-in flow yet)"}.`);
