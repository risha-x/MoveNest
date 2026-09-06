import type { Request, Response } from "express";
import { photoService } from "../services/photoService.js";

export const photoController = {
  list(req: Request, res: Response) {
    const ownerType = req.query.ownerType === "item" ? "item" : "box";
    res.json(photoService.listByOwner(ownerType, String(req.query.ownerId), req.userId));
  },
  create(req: Request, res: Response) {
    res.status(201).json(photoService.create(req.body, req.userId));
  },
  update(req: Request, res: Response) {
    res.json(photoService.update(String(req.params.id), req.body, req.userId));
  },
  remove(req: Request, res: Response) {
    photoService.delete(String(req.params.id), req.userId);
    res.status(204).end();
  },
  counts(req: Request, res: Response) {
    res.json(photoService.countsForMove(String(req.query.moveId), req.userId));
  },
};
