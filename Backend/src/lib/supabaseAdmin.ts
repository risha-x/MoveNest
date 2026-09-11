import { createClient } from "@supabase/supabase-js";

// Server-only client, built with the secret key. This BYPASSES Row Level
// Security entirely - never import this into anything that runs in the
// browser, and never log or return the client's config.
//
// Nothing in the app imports this yet (see Backend/src/scripts for a smoke
// test). Wiring it into routes/middleware is a later, separate step.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY must be set (Backend/.env) to use the Supabase admin client.",
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
