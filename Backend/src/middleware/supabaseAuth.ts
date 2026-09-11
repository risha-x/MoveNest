import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      supabaseUserId?: string;
    }
  }
}

// Verifies a Supabase access token if one is present (Authorization: Bearer
// <token>). Does NOT reject the request if the token is missing or invalid -
// this runs ALONGSIDE the existing x-user-id trust model (see
// middleware/currentUser.ts), not in place of it yet. req.supabaseUserId is
// only ever set when a token actually verifies against Supabase.
export async function supabaseAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) {
    next();
    return;
  }
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (!error && data.user) {
    req.supabaseUserId = data.user.id;
  }
  next();
}
