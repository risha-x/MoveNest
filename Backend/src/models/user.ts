import { db } from "../db/connection.js";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  onboarding_completed: number;
  created_at: string;
};

const insertStmt = db.prepare(`
  INSERT INTO users (id, name, email, onboarding_completed, created_at)
  VALUES (@id, @name, @email, @onboarding_completed, @created_at)
`);
const getStmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
const updateStmt = db.prepare(`
  UPDATE users SET name = @name, email = @email, onboarding_completed = @onboarding_completed
  WHERE id = @id
`);

export const userModel = {
  insert(row: UserRow) {
    insertStmt.run(row);
  },
  get(id: string): UserRow | undefined {
    return getStmt.get(id) as UserRow | undefined;
  },
  update(row: { id: string; name: string; email: string; onboarding_completed: number }) {
    updateStmt.run(row);
  },
};
