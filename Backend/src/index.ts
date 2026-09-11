import express from "express";
import cors from "cors";
import "./db/connection.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { supabaseAuth } from "./middleware/supabaseAuth.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Restrict to the Vite dev origin by default instead of reflecting any caller.
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" })); // photos are base64 data URLs, can be a few hundred KB
// Global and non-blocking: sets req.supabaseUserId when a valid Bearer token
// is sent, otherwise passes through untouched. See middleware/currentUser.ts
// for how this is used (preferred) alongside the legacy x-user-id header.
app.use(supabaseAuth);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", apiRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`MoveNest API listening on http://localhost:${PORT}`);
});
