import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler.js";
import { userModel } from "../models/user.js";
import { nowIso } from "../utils/id.js";

// Two ways to identify the caller, checked in order:
//   1. A verified Supabase session (req.supabaseUserId, set by
//      middleware/supabaseAuth.ts if a valid Bearer token was sent).
//   2. The legacy x-user-id header the frontend generates itself and trusts
//      unverified - kept as a fallback until the real app sends Supabase
//      tokens for every request instead.
// This is a no-op for anything not sending a Bearer token, so existing
// x-user-id traffic behaves exactly as before.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function currentUser(req: Request, _res: Response, next: NextFunction) {
  if (req.supabaseUserId) {
    // First time we've seen this Supabase user: create their local profile
    // row so ownership checks (which all chain through the local users
    // table) have something to key off of.
    if (!userModel.get(req.supabaseUserId)) {
      userModel.insert({
        id: req.supabaseUserId,
        name: "",
        email: "",
        onboarding_completed: 0,
        created_at: nowIso(),
      });
    }
    req.userId = req.supabaseUserId;
    next();
    return;
  }

  const userId = req.header("x-user-id");
  if (!userId) {
    throw new ApiError(401, "Missing x-user-id header.");
  }
  req.userId = userId;
  next();
}
