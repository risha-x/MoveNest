import type { Request, Response } from "express";
import { roomService } from "../services/roomService.js";

export const roomController = {
  list(req: Request, res: Response) {
    res.json(roomService.listByMove(String(req.query.moveId), req.userId));
  },
  create(req: Request, res: Response) {
    const { moveId, name, type, icon, color } = req.body;
    res.status(201).json(roomService.create(moveId, { name, type, icon, color }, req.userId));
  },
  rename(req: Request, res: Response) {
    res.json(roomService.rename(String(req.params.id), req.body.name, req.userId));
  },
  remove(req: Request, res: Response) {
    roomService.delete(String(req.params.id), req.userId);
    res.status(204).end();
  },
};
