import { Router } from "express";
import { itemController } from "../controllers/itemController.js";
import { currentUser } from "../middleware/currentUser.js";

export const itemsRouter = Router();

itemsRouter.use(currentUser);

itemsRouter.get("/", itemController.list);
itemsRouter.post("/", itemController.create);
itemsRouter.put("/pack-all/:roomId", itemController.bulkSetPackedForRoom);
itemsRouter.put("/:id", itemController.update);
itemsRouter.delete("/:id", itemController.remove);
