import { Router } from "express";
import { userController } from "../controllers/userController.js";

export const usersRouter = Router();

usersRouter.post("/", userController.create);
usersRouter.get("/:id", userController.get);
usersRouter.put("/:id", userController.update);
