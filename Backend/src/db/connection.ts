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

// Keep existing local databases compatible as the persisted model grows.
function addColumnIfMissing(table: string, column: string, definition: string) {
	const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
	if (!columns.some((entry) => entry.name === column)) {
		db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
	}
}

addColumnIfMissing("boxes", "unpacked", "INTEGER NOT NULL DEFAULT 0");
addColumnIfMissing("boxes", "essential", "INTEGER NOT NULL DEFAULT 0");
addColumnIfMissing("items", "unpacked", "INTEGER NOT NULL DEFAULT 0");
