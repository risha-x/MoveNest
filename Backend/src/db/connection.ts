import Database from "better-sqlite3";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Backend/src/db -> repo root, then into the top-level Database/ folder.
const dbPath = path.join(__dirname, "..", "..", "..", "Database", "movenest.db");

export const db = new Database(dbPath);

// SQLite ignores foreign key constraints unless explicitly turned on per connection.
db.pragma("foreign_keys = ON");

const schema = readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);
