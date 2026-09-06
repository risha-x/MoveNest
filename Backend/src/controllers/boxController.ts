import type { Request, Response } from "express";
import { boxService } from "../services/boxService.js";

export const boxController = {
  list(req: Request, res: Response) {
    if (req.query.roomId) {
      res.json(boxService.listByRoom(String(req.query.roomId), req.userId));
      return;
    }
    res.json(boxService.listByMove(String(req.query.moveId), req.userId));
  },
  create(req: Request, res: Response) {
    const { roomId, name, fragile, notes } = req.body;
    res.status(201).json(boxService.create(roomId, { name, fragile, notes }, req.userId));
  },
  update(req: Request, res: Response) {
    res.json(boxService.update(String(req.params.id), req.body, req.userId));
  },
  remove(req: Request, res: Response) {
    boxService.delete(String(req.params.id), req.userId);
    res.status(204).end();
  },
};
