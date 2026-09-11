import { Router } from "express";

export const authTestRouter = Router();

// Isolated proof route: requires a valid Supabase access token, returns 401
// if missing/invalid, otherwise echoes back the verified user id.
// req.supabaseUserId is set globally in index.ts (see supabaseAuth), so no
// extra middleware is needed here.
authTestRouter.get("/whoami", (req, res) => {
  if (!req.supabaseUserId) {
    res.status(401).json({ error: "No valid Supabase session." });
    return;
  }
  res.json({ supabaseUserId: req.supabaseUserId });
});
