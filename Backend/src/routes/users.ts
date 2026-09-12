import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { currentUser } from "../middleware/currentUser.js";

export const usersRouter = Router();

// POST stays unauthenticated - it's the legacy anonymous-create path, called
// before any session/header exists. GET/PUT go through currentUser so a
// brand-new Supabase login gets its local profile row auto-provisioned the
// first time the frontend fetches it (see middleware/currentUser.ts).
usersRouter.post("/", userController.create);
usersRouter.get("/:id", currentUser, userController.get);
usersRouter.put("/:id", currentUser, userController.update);
