import { Router } from "express";
import { usersRouter } from "./users.js";
import { movesRouter } from "./moves.js";
import { roomsRouter } from "./rooms.js";
import { boxesRouter } from "./boxes.js";
import { itemsRouter } from "./items.js";
import { photosRouter } from "./photos.js";
import { searchRouter } from "./search.js";

export const apiRouter = Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/moves", movesRouter); // currentUser middleware applied per-route inside movesRouter
apiRouter.use("/rooms", roomsRouter);
apiRouter.use("/boxes", boxesRouter);
apiRouter.use("/items", itemsRouter);
apiRouter.use("/photos", photosRouter);
apiRouter.use("/search", searchRouter);
