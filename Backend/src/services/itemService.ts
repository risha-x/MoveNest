import { itemModel, type ItemRowWithRoom } from "../models/item.js";
import { ApiError } from "../middleware/errorHandler.js";
import { newId, nowIso } from "../utils/id.js";
import { assertOwner, ownerUserIdForBox, ownerUserIdForMove, ownerUserIdForRoom } from "../utils/ownership.js";

export type ItemDto = {
  id: string;
  name: string;
  boxId: string;
  roomId: string;
  packed: boolean;
  unpacked: boolean;
  fragile: boolean;
  essential: boolean;
  notes: string;
};

function toDto(row: ItemRowWithRoom): ItemDto {
  return {
    id: row.id,
    name: row.name,
    boxId: row.box_id,
    roomId: row.room_id,
    packed: Boolean(row.packed),
    unpacked: Boolean(row.unpacked),
    fragile: Boolean(row.fragile),
    essential: Boolean(row.essential),
    notes: row.notes,
  };
}

export const itemService = {
  create(fields: { boxId: string; name: string; fragile?: boolean; essential?: boolean; notes?: string }, userId: string): ItemDto {
    if (!fields.boxId) throw new ApiError(400, "boxId is required.");
    if (!fields.name?.trim()) throw new ApiError(400, "Item name is required.");
    assertOwner(ownerUserIdForBox(fields.boxId), userId, "Box not found.");
    const row = {
      id: newId(),
      box_id: fields.boxId,
      name: fields.name.trim(),
      packed: 0,
      unpacked: 0,
      fragile: fields.fragile ? 1 : 0,
      essential: fields.essential ? 1 : 0,
      notes: fields.notes?.trim() ?? "",
      created_at: nowIso(),
    };
    itemModel.insert(row);
    return toDto(itemModel.get(row.id)!);
  },
  listByBox(boxId: string, userId: string): ItemDto[] {
    assertOwner(ownerUserIdForBox(boxId), userId, "Box not found.");
    return itemModel.listByBox(boxId).map(toDto);
  },
  listByMove(moveId: string, userId: string): ItemDto[] {
    assertOwner(ownerUserIdForMove(moveId), userId, "Move not found.");
    return itemModel.listByMove(moveId).map(toDto);
  },
  search(moveId: string, query: string, userId: string): ItemDto[] {
    assertOwner(ownerUserIdForMove(moveId), userId, "Move not found.");
    return itemModel.searchByMove(moveId, query).map(toDto);
  },
  update(
    id: string,
    fields: { name?: string; boxId?: string; packed?: boolean; unpacked?: boolean; fragile?: boolean; essential?: boolean; notes?: string },
    userId: string,
  ): ItemDto {
    const existing = itemModel.get(id);
    if (!existing) throw new ApiError(404, "Item not found.");
    assertOwner(ownerUserIdForRoom(existing.room_id), userId, "Item not found.");
    if (fields.boxId && fields.boxId !== existing.box_id) {
      assertOwner(ownerUserIdForBox(fields.boxId), userId, "Box not found.");
    }
    if (fields.name !== undefined && !fields.name.trim()) {
      throw new ApiError(400, "Item name is required.");
    }
    const updated = {
      id,
      name: fields.name?.trim() ?? existing.name,
      box_id: fields.boxId ?? existing.box_id,
      packed: fields.packed !== undefined ? (fields.packed ? 1 : 0) : existing.packed,
      unpacked: fields.unpacked !== undefined ? (fields.unpacked ? 1 : 0) : existing.unpacked,
      fragile: fields.fragile !== undefined ? (fields.fragile ? 1 : 0) : existing.fragile,
      essential: fields.essential !== undefined ? (fields.essential ? 1 : 0) : existing.essential,
      notes: fields.notes ?? existing.notes,
    };
    itemModel.update(updated);
    return toDto(itemModel.get(id)!);
  },
  delete(id: string, userId: string) {
    const existing = itemModel.get(id);
    if (!existing) throw new ApiError(404, "Item not found.");
    assertOwner(ownerUserIdForRoom(existing.room_id), userId, "Item not found.");
    itemModel.delete(id);
  },
  bulkSetPackedForRoom(roomId: string, packed: boolean, userId: string) {
    assertOwner(ownerUserIdForRoom(roomId), userId, "Room not found.");
    itemModel.setPackedForRoom(roomId, packed);
  },
  bulkSetUnpackedForRoom(roomId: string, unpacked: boolean, userId: string) {
    assertOwner(ownerUserIdForRoom(roomId), userId, "Room not found.");
    itemModel.setUnpackedForRoom(roomId, unpacked);
  },
};
