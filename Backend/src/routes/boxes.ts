import { Router } from "express";
import { boxController } from "../controllers/boxController.js";
import { currentUser } from "../middleware/currentUser.js";

export const boxesRouter = Router();

boxesRouter.use(currentUser);

boxesRouter.get("/", boxController.list);
boxesRouter.post("/", boxController.create);
boxesRouter.put("/:id", boxController.update);
boxesRouter.delete("/:id", boxController.remove);
