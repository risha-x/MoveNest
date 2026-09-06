import { Router } from "express";
import { searchController } from "../controllers/searchController.js";
import { currentUser } from "../middleware/currentUser.js";

export const searchRouter = Router();

searchRouter.get("/", currentUser, searchController.search);
