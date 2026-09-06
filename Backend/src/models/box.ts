import { db } from "../db/connection.js";

export type BoxRow = {
  id: string;
  room_id: string;
  name: string;
  packed: number;
  unpacked: number;
  fragile: number;
  essential: number;
  notes: string;
  created_at: string;
};

const insertStmt = db.prepare(`
  INSERT INTO boxes (id, room_id, name, packed, unpacked, fragile, essential, notes, created_at)
  VALUES (@id, @room_id, @name, @packed, @unpacked, @fragile, @essential, @notes, @created_at)
`);
const listByRoomStmt = db.prepare(`SELECT * FROM boxes WHERE room_id = ? ORDER BY created_at`);
const listByMoveStmt = db.prepare(`
  SELECT boxes.* FROM boxes
  JOIN rooms ON boxes.room_id = rooms.id
  WHERE rooms.move_id = ?
  ORDER BY boxes.created_at
`);
const getStmt = db.prepare(`SELECT * FROM boxes WHERE id = ?`);
const updateStmt = db.prepare(`
  UPDATE boxes SET name = @name, room_id = @room_id, packed = @packed, unpacked = @unpacked,
    fragile = @fragile, essential = @essential, notes = @notes
  WHERE id = @id
`);
const deleteStmt = db.prepare(`DELETE FROM boxes WHERE id = ?`);
const itemNamesStmt = db.prepare(`SELECT name FROM items WHERE box_id = ? ORDER BY created_at LIMIT 3`);
const itemCountStmt = db.prepare(`SELECT COUNT(*) as count FROM items WHERE box_id = ?`);

// Batched variants for listing many boxes at once: one query per column instead
// of 2 queries per box (was 1 + 2N for a list of N boxes).
function itemCountsForBoxes(boxIds: string[]): Record<string, number> {
  if (boxIds.length === 0) return {};
  const placeholders = boxIds.map(() => "?").join(",");
  const rows = db
    .prepare(`SELECT box_id, COUNT(*) as count FROM items WHERE box_id IN (${placeholders}) GROUP BY box_id`)
    .all(...boxIds) as { box_id: string; count: number }[];
  const counts: Record<string, number> = {};
  rows.forEach((row) => { counts[row.box_id] = row.count; });
  return counts;
}

function itemNamesForBoxes(boxIds: string[]): Record<string, string[]> {
  if (boxIds.length === 0) return {};
  const placeholders = boxIds.map(() => "?").join(",");
  const rows = db
    .prepare(`
      SELECT box_id, name FROM (
        SELECT box_id, name, ROW_NUMBER() OVER (PARTITION BY box_id ORDER BY created_at) as rn
        FROM items WHERE box_id IN (${placeholders})
      ) WHERE rn <= 3
    `)
    .all(...boxIds) as { box_id: string; name: string }[];
  const names: Record<string, string[]> = {};
  rows.forEach((row) => { (names[row.box_id] ??= []).push(row.name); });
  return names;
}

export const boxModel = {
  insert(row: BoxRow) {
    insertStmt.run(row);
  },
  listByRoom(roomId: string): BoxRow[] {
    return listByRoomStmt.all(roomId) as BoxRow[];
  },
  listByMove(moveId: string): BoxRow[] {
    return listByMoveStmt.all(moveId) as BoxRow[];
  },
  get(id: string): BoxRow | undefined {
    return getStmt.get(id) as BoxRow | undefined;
  },
  update(row: { id: string; name: string; room_id: string; packed: number; unpacked: number; fragile: number; essential: number; notes: string }) {
    updateStmt.run(row);
  },
  delete(id: string) {
    deleteStmt.run(id);
  },
  itemNames(boxId: string): string[] {
    return (itemNamesStmt.all(boxId) as { name: string }[]).map((row) => row.name);
  },
  itemCount(boxId: string): number {
    return (itemCountStmt.get(boxId) as { count: number }).count;
  },
  itemCountsForBoxes,
  itemNamesForBoxes,
};
