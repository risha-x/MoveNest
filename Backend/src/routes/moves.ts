import { Router } from "express";
import { moveController } from "../controllers/moveController.js";
import { currentUser } from "../middleware/currentUser.js";

export const movesRouter = Router();

movesRouter.post("/", currentUser, moveController.create);
movesRouter.get("/", currentUser, moveController.getForUser);
movesRouter.put("/:id", currentUser, moveController.update);
