import { db } from "../db/connection.js";

export type MoveRow = {
  id: string;
  user_id: string;
  name: string;
  move_date: string;
  origin: string;
  destination: string;
  created_at: string;
};

const insertStmt = db.prepare(`
  INSERT INTO moves (id, user_id, name, move_date, origin, destination, created_at)
  VALUES (@id, @user_id, @name, @move_date, @origin, @destination, @created_at)
`);
const getByUserStmt = db.prepare(`SELECT * FROM moves WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`);
const getByIdStmt = db.prepare(`SELECT * FROM moves WHERE id = ?`);
const updateStmt = db.prepare(`
  UPDATE moves SET name = @name, move_date = @move_date, origin = @origin, destination = @destination
  WHERE id = @id
`);

export const moveModel = {
  insert(row: MoveRow) {
    insertStmt.run(row);
  },
  getByUser(userId: string): MoveRow | undefined {
    return getByUserStmt.get(userId) as MoveRow | undefined;
  },
  getById(id: string): MoveRow | undefined {
    return getByIdStmt.get(id) as MoveRow | undefined;
  },
  update(row: { id: string; name: string; move_date: string; origin: string; destination: string }) {
    updateStmt.run(row);
  },
};
