import { createClient } from "@supabase/supabase-js";

// Public, browser-safe client - built with the publishable key, which is
// meant to be visible in shipped code. Row Level Security on the database
// side is what actually protects data, not this key.
//
// Nothing in the app imports this yet (see Frontend/scripts for a smoke
// test). Wiring it into real sign-up/sign-in UI is a later, separate step.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY must be set (Frontend/.env) to use the Supabase client.",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
