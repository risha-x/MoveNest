import { Router } from "express";
import { roomController } from "../controllers/roomController.js";
import { currentUser } from "../middleware/currentUser.js";

export const roomsRouter = Router();

roomsRouter.use(currentUser);

roomsRouter.get("/", roomController.list);
roomsRouter.post("/", roomController.create);
roomsRouter.put("/:id", roomController.rename);
roomsRouter.delete("/:id", roomController.remove);
