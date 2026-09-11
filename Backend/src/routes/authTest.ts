import { Router } from "express";
import { supabaseAuth } from "../middleware/supabaseAuth.js";

export const authTestRouter = Router();

// Isolated proof route: requires a valid Supabase access token, returns 401
// if missing/invalid, otherwise echoes back the verified user id. Not used
// by any real resource route yet - exists purely to test supabaseAuth in
// isolation, same spirit as Frontend/auth-test.html.
authTestRouter.get("/whoami", supabaseAuth, (req, res) => {
  if (!req.supabaseUserId) {
    res.status(401).json({ error: "No valid Supabase session." });
    return;
  }
  res.json({ supabaseUserId: req.supabaseUserId });
});
