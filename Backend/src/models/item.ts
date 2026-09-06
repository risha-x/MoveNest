import { db } from "../db/connection.js";

export type ItemRow = {
  id: string;
  box_id: string;
  name: string;
  packed: number;
  unpacked: number;
  fragile: number;
  essential: number;
  notes: string;
  created_at: string;
};

export type ItemRowWithRoom = ItemRow & { room_id: string };

const insertStmt = db.prepare(`
  INSERT INTO items (id, box_id, name, packed, unpacked, fragile, essential, notes, created_at)
  VALUES (@id, @box_id, @name, @packed, @unpacked, @fragile, @essential, @notes, @created_at)
`);
const listByBoxStmt = db.prepare(`
  SELECT items.*, boxes.room_id as room_id FROM items
  JOIN boxes ON items.box_id = boxes.id
  WHERE items.box_id = ? ORDER BY items.created_at
`);
const listByMoveStmt = db.prepare(`
  SELECT items.*, boxes.room_id as room_id FROM items
  JOIN boxes ON items.box_id = boxes.id
  JOIN rooms ON boxes.room_id = rooms.id
  WHERE rooms.move_id = ? ORDER BY items.created_at
`);
const searchByMoveStmt = db.prepare(`
  SELECT items.*, boxes.room_id as room_id FROM items
  JOIN boxes ON items.box_id = boxes.id
  JOIN rooms ON boxes.room_id = rooms.id
  WHERE rooms.move_id = ? AND items.name LIKE ?
  ORDER BY items.created_at
`);
const getStmt = db.prepare(`
  SELECT items.*, boxes.room_id as room_id FROM items
  JOIN boxes ON items.box_id = boxes.id
  WHERE items.id = ?
`);
const updateStmt = db.prepare(`
  UPDATE items SET name = @name, box_id = @box_id, packed = @packed, unpacked = @unpacked, fragile = @fragile,
    essential = @essential, notes = @notes
  WHERE id = @id
`);
const deleteStmt = db.prepare(`DELETE FROM items WHERE id = ?`);
const setPackedForBoxStmt = db.prepare(`UPDATE items SET packed = ? WHERE box_id = ?`);
const setPackedForRoomStmt = db.prepare(`
  UPDATE items SET packed = ?
  WHERE box_id IN (SELECT id FROM boxes WHERE room_id = ?)
`);
const setUnpackedForBoxStmt = db.prepare(`UPDATE items SET unpacked = ? WHERE box_id = ?`);
const setUnpackedForRoomStmt = db.prepare(`
  UPDATE items SET unpacked = ?
  WHERE box_id IN (SELECT id FROM boxes WHERE room_id = ?)
`);

export const itemModel = {
  insert(row: ItemRow) {
    insertStmt.run(row);
  },
  listByBox(boxId: string): ItemRowWithRoom[] {
    return listByBoxStmt.all(boxId) as ItemRowWithRoom[];
  },
  listByMove(moveId: string): ItemRowWithRoom[] {
    return listByMoveStmt.all(moveId) as ItemRowWithRoom[];
  },
  searchByMove(moveId: string, query: string): ItemRowWithRoom[] {
    return searchByMoveStmt.all(moveId, `%${query}%`) as ItemRowWithRoom[];
  },
  get(id: string): ItemRowWithRoom | undefined {
    return getStmt.get(id) as ItemRowWithRoom | undefined;
  },
  update(row: { id: string; name: string; box_id: string; packed: number; unpacked: number; fragile: number; essential: number; notes: string }) {
    updateStmt.run(row);
  },
  delete(id: string) {
    deleteStmt.run(id);
  },
  setPackedForBox(boxId: string, packed: boolean) {
    setPackedForBoxStmt.run(packed ? 1 : 0, boxId);
  },
  setPackedForRoom(roomId: string, packed: boolean) {
    setPackedForRoomStmt.run(packed ? 1 : 0, roomId);
  },
  setUnpackedForBox(boxId: string, unpacked: boolean) {
    setUnpackedForBoxStmt.run(unpacked ? 1 : 0, boxId);
  },
  setUnpackedForRoom(roomId: string, unpacked: boolean) {
    setUnpackedForRoomStmt.run(unpacked ? 1 : 0, roomId);
  },
};
