import express from "express";
import cors from "cors";
import "./db/connection.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Restrict to the Vite dev origin by default instead of reflecting any caller.
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" })); // photos are base64 data URLs, can be a few hundred KB

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", apiRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`MoveNest API listening on http://localhost:${PORT}`);
});
