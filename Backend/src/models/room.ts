import { db } from "../db/connection.js";

export type RoomRow = {
  id: string;
  move_id: string;
  name: string;
  type: string;
  display_name: string;
  icon: string;
  color: string;
};

const insertStmt = db.prepare(`
  INSERT INTO rooms (id, move_id, name, type, display_name, icon, color)
  VALUES (@id, @move_id, @name, @type, @display_name, @icon, @color)
`);
const listByMoveStmt = db.prepare(`SELECT * FROM rooms WHERE move_id = ?`);
const getStmt = db.prepare(`SELECT * FROM rooms WHERE id = ?`);
const renameStmt = db.prepare(`UPDATE rooms SET name = @name, display_name = @display_name WHERE id = @id`);
const deleteStmt = db.prepare(`DELETE FROM rooms WHERE id = ?`);

export const roomModel = {
  insert(row: RoomRow) {
    insertStmt.run(row);
  },
  listByMove(moveId: string): RoomRow[] {
    return listByMoveStmt.all(moveId) as RoomRow[];
  },
  get(id: string): RoomRow | undefined {
    return getStmt.get(id) as RoomRow | undefined;
  },
  rename(row: { id: string; name: string; display_name: string }) {
    renameStmt.run(row);
  },
  delete(id: string) {
    deleteStmt.run(id);
  },
};
