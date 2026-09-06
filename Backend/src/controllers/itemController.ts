import type { Request, Response } from "express";
import { itemService } from "../services/itemService.js";

export const itemController = {
  list(req: Request, res: Response) {
    if (req.query.boxId) {
      res.json(itemService.listByBox(String(req.query.boxId), req.userId));
      return;
    }
    res.json(itemService.listByMove(String(req.query.moveId), req.userId));
  },
  create(req: Request, res: Response) {
    res.status(201).json(itemService.create(req.body, req.userId));
  },
  update(req: Request, res: Response) {
    res.json(itemService.update(String(req.params.id), req.body, req.userId));
  },
  remove(req: Request, res: Response) {
    itemService.delete(String(req.params.id), req.userId);
    res.status(204).end();
  },
  bulkSetPackedForRoom(req: Request, res: Response) {
    itemService.bulkSetPackedForRoom(String(req.params.roomId), Boolean(req.body.packed), req.userId);
    res.status(204).end();
  },
};
