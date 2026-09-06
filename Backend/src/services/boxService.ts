import { db } from "../db/connection.js";
import { boxModel, type BoxRow } from "../models/box.js";
import { itemModel } from "../models/item.js";
import { ApiError } from "../middleware/errorHandler.js";
import { newId, nowIso } from "../utils/id.js";
import { assertOwner, ownerUserIdForMove, ownerUserIdForRoom } from "../utils/ownership.js";

export type BoxDto = {
  id: string;
  roomId: string;
  name: string;
  packed: boolean;
  fragile: boolean;
  notes: string;
  itemCount: number;
  items: string[];
};

function toDto(row: BoxRow): BoxDto {
  return {
    id: row.id,
    roomId: row.room_id,
    name: row.name,
    packed: Boolean(row.packed),
    fragile: Boolean(row.fragile),
    notes: row.notes,
    itemCount: boxModel.itemCount(row.id),
    items: boxModel.itemNames(row.id),
  };
}

// Batched: avoids the N+1 query pattern of calling toDto() per row for a list.
function toDtoList(rows: BoxRow[]): BoxDto[] {
  const ids = rows.map((row) => row.id);
  const counts = boxModel.itemCountsForBoxes(ids);
  const names = boxModel.itemNamesForBoxes(ids);
  return rows.map((row) => ({
    id: row.id,
    roomId: row.room_id,
    name: row.name,
    packed: Boolean(row.packed),
    fragile: Boolean(row.fragile),
    notes: row.notes,
    itemCount: counts[row.id] ?? 0,
    items: names[row.id] ?? [],
  }));
}

// Sealing a box (packed false -> true) also packs everything inside it, so
// both writes must succeed or fail together.
const sealBox = db.transaction((id: string, updated: Parameters<typeof boxModel.update>[0]) => {
  boxModel.update(updated);
  itemModel.setPackedForBox(id, true);
});

export const boxService = {
  create(roomId: string, fields: { name: string; fragile?: boolean; notes?: string }, userId: string): BoxDto {
    if (!roomId) throw new ApiError(400, "roomId is required.");
    if (!fields.name?.trim()) throw new ApiError(400, "Box name is required.");
    assertOwner(ownerUserIdForRoom(roomId), userId, "Room not found.");
    const row: BoxRow = {
      id: newId(),
      room_id: roomId,
      name: fields.name.trim(),
      packed: 0,
      fragile: fields.fragile ? 1 : 0,
      notes: fields.notes?.trim() ?? "",
      created_at: nowIso(),
    };
    boxModel.insert(row);
    return toDto(row);
  },
  listByRoom(roomId: string, userId: string): BoxDto[] {
    assertOwner(ownerUserIdForRoom(roomId), userId, "Room not found.");
    return toDtoList(boxModel.listByRoom(roomId));
  },
  listByMove(moveId: string, userId: string): BoxDto[] {
    assertOwner(ownerUserIdForMove(moveId), userId, "Move not found.");
    return toDtoList(boxModel.listByMove(moveId));
  },
  update(
    id: string,
    fields: { name?: string; roomId?: string; packed?: boolean; fragile?: boolean; notes?: string },
    userId: string,
  ): BoxDto {
    const existing = boxModel.get(id);
    if (!existing) throw new ApiError(404, "Box not found.");
    assertOwner(ownerUserIdForRoom(existing.room_id), userId, "Box not found.");
    if (fields.roomId && fields.roomId !== existing.room_id) {
      assertOwner(ownerUserIdForRoom(fields.roomId), userId, "Room not found.");
    }
    if (fields.name !== undefined && !fields.name.trim()) {
      throw new ApiError(400, "Box name is required.");
    }
    const updated = {
      id,
      name: fields.name?.trim() ?? existing.name,
      room_id: fields.roomId ?? existing.room_id,
      packed: fields.packed !== undefined ? (fields.packed ? 1 : 0) : existing.packed,
      fragile: fields.fragile !== undefined ? (fields.fragile ? 1 : 0) : existing.fragile,
      notes: fields.notes ?? existing.notes,
    };
    if (fields.packed === true && !existing.packed) {
      sealBox(id, updated);
    } else {
      boxModel.update(updated);
    }
    return toDto(boxModel.get(id)!);
  },
  delete(id: string, userId: string) {
    const existing = boxModel.get(id);
    if (!existing) throw new ApiError(404, "Box not found.");
    assertOwner(ownerUserIdForRoom(existing.room_id), userId, "Box not found.");
    boxModel.delete(id);
  },
};
