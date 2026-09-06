import type { Request, Response } from "express";
import { moveService } from "../services/moveService.js";

export const moveController = {
  create(req: Request, res: Response) {
    res.status(201).json(moveService.create(req.userId, req.body));
  },
  getForUser(req: Request, res: Response) {
    res.json(moveService.getByUser(req.userId));
  },
  update(req: Request, res: Response) {
    res.json(moveService.update(String(req.params.id), req.body, req.userId));
  },
};
