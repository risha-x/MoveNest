import type { Request, Response } from "express";
import { itemService } from "../services/itemService.js";

export const searchController = {
  search(req: Request, res: Response) {
    const moveId = String(req.query.moveId ?? "");
    const query = String(req.query.q ?? "");
    res.json(itemService.search(moveId, query, req.userId));
  },
};
