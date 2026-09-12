import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabaseClient";

// Standalone proof that real Supabase Auth works end-to-end: sign up, sign
// in, sign out, and a session that survives a page refresh. Deliberately
// isolated from the real app (App.tsx / AppContext.tsx untouched) so this
// can't affect the existing onboarding flow. Reached via auth-test.html,
// not linked from the app itself.
export function AuthTest() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoadingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignUp = async () => {
    if (!supabase) return;
    setMessage(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? `Sign up failed: ${error.message}` : "Signed up. Check your email if confirmation is required, or you may already be signed in below.");
  };

  const handleSignIn = async () => {
    if (!supabase) return;
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? `Sign in failed: ${error.message}` : "Signed in.");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    setMessage(null);
    await supabase.auth.signOut();
    setMessage("Signed out.");
  };

  if (!supabase) {
    return (
      <p style={{ fontFamily: "monospace", padding: 24, color: "crimson" }}>
        Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY in Frontend/.env).
      </p>
    );
  }

  if (loadingSession) return <p style={{ fontFamily: "monospace", padding: 24 }}>Loading session…</p>;

  return (
    <div style={{ fontFamily: "monospace", maxWidth: 420, margin: "40px auto", padding: 20 }}>
      <h1 style={{ fontSize: 18 }}>Supabase Auth test</h1>
      <p style={{ color: "#666" }}>
        This page is isolated from the real MoveNest app. It only proves sign-up / sign-in / sign-out and
        session persistence work against your live Supabase project.
      </p>

      <section style={{ margin: "20px 0", padding: 12, border: "1px solid #ccc" }}>
        <strong>Current session</strong>
        <p>{session ? `Signed in as ${session.user.email}` : "Not signed in"}</p>
        {session && <button onClick={handleSignOut}>Sign out</button>}
      </section>

      {!session && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
          </label>
          <label>
            Password (min 6 characters)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              style={{ width: "100%" }}
            />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={handleSignUp}>Sign up</button>
            <button type="button" onClick={handleSignIn}>Sign in</button>
          </div>
        </div>
      )}

      {message && <p style={{ marginTop: 16 }}>{message}</p>}

      <p style={{ marginTop: 24, color: "#666" }}>
        Refresh this page after signing in - if the session shown above survives the refresh, persistence works.
      </p>
    </div>
  );
}
