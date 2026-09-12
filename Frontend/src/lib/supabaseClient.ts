import { createClient } from "@supabase/supabase-js";

// Public, browser-safe client - built with the publishable key, which is
// meant to be visible in shipped code. Row Level Security on the database
// side is what actually protects data, not this key.
//
// Exported as possibly-null rather than throwing at import time: services/api.ts
// now imports this on every request, so a missing/misconfigured env var must
// degrade gracefully (falls back to the legacy session id) instead of
// crashing the whole app.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = supabaseUrl && supabasePublishableKey
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

if (!supabase) {
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are not set - Supabase auth is disabled, falling back to the legacy session id.",
  );
}
