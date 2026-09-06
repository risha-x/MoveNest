import type { Request, Response } from "express";
import { userService } from "../services/userService.js";

export const userController = {
  create(req: Request, res: Response) {
    const displayName = String(req.body.displayName ?? "");
    res.status(201).json(userService.create(displayName));
  },
  get(req: Request, res: Response) {
    res.json(userService.get(String(req.params.id)));
  },
  update(req: Request, res: Response) {
    res.json(userService.update(String(req.params.id), req.body));
  },
};
