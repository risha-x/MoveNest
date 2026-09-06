import { Router } from "express";
import { photoController } from "../controllers/photoController.js";
import { currentUser } from "../middleware/currentUser.js";

export const photosRouter = Router();

photosRouter.use(currentUser);

photosRouter.get("/counts", photoController.counts);
photosRouter.get("/", photoController.list);
photosRouter.post("/", photoController.create);
photosRouter.put("/:id", photoController.update);
photosRouter.delete("/:id", photoController.remove);
