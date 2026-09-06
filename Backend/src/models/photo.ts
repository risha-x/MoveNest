import { db } from "../db/connection.js";

export type PhotoRow = {
  id: string;
  box_id: string | null;
  item_id: string | null;
  data_url: string;
  caption: string;
  note: string;
  created_at: string;
};

const insertStmt = db.prepare(`
  INSERT INTO photos (id, box_id, item_id, data_url, caption, note, created_at)
  VALUES (@id, @box_id, @item_id, @data_url, @caption, @note, @created_at)
`);
const listByBoxStmt = db.prepare(`SELECT * FROM photos WHERE box_id = ? ORDER BY created_at DESC`);
const listByItemStmt = db.prepare(`SELECT * FROM photos WHERE item_id = ? ORDER BY created_at DESC`);
const getStmt = db.prepare(`SELECT * FROM photos WHERE id = ?`);
const updateStmt = db.prepare(`UPDATE photos SET caption = @caption, note = @note WHERE id = @id`);
const deleteStmt = db.prepare(`DELETE FROM photos WHERE id = ?`);
const countsForMoveStmt = db.prepare(`
  SELECT boxes.id as box_id, COUNT(photos.id) as count
  FROM boxes
  JOIN rooms ON boxes.room_id = rooms.id
  LEFT JOIN photos ON photos.box_id = boxes.id
  WHERE rooms.move_id = ?
  GROUP BY boxes.id
  HAVING count > 0
`);

export const photoModel = {
  insert(row: PhotoRow) {
    insertStmt.run(row);
  },
  listByBox(boxId: string): PhotoRow[] {
    return listByBoxStmt.all(boxId) as PhotoRow[];
  },
  listByItem(itemId: string): PhotoRow[] {
    return listByItemStmt.all(itemId) as PhotoRow[];
  },
  get(id: string): PhotoRow | undefined {
    return getStmt.get(id) as PhotoRow | undefined;
  },
  update(row: { id: string; caption: string; note: string }) {
    updateStmt.run(row);
  },
  delete(id: string) {
    deleteStmt.run(id);
  },
  countsForMove(moveId: string): { box_id: string; count: number }[] {
    return countsForMoveStmt.all(moveId) as { box_id: string; count: number }[];
  },
};
