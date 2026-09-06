import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errorHandler.js";

// No password/session auth here (see the plan). The frontend generates a random id
// on first launch and sends it on every request; we trust it and scope all queries
// to it. This is intentionally simple, not secure — fine for a local/demo project.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

export function currentUser(req: Request, _res: Response, next: NextFunction) {
  const userId = req.header("x-user-id");
  if (!userId) {
    throw new ApiError(401, "Missing x-user-id header.");
  }
  req.userId = userId;
  next();
}
