import { roomModel, type RoomRow } from "../models/room.js";
import { ApiError } from "../middleware/errorHandler.js";
import { newId } from "../utils/id.js";
import { assertOwner, ownerUserIdForMove, ownerUserIdForRoom } from "../utils/ownership.js";

export type RoomDto = {
  id: string;
  moveId: string;
  name: string;
  type: string;
  displayName: string;
  defaultName: string;
  icon: string;
  color: string;
};

function toDto(row: RoomRow): RoomDto {
  return {
    id: row.id,
    moveId: row.move_id,
    name: row.name,
    type: row.type,
    displayName: row.display_name,
    defaultName: row.name,
    icon: row.icon,
    color: row.color,
  };
}

export const roomService = {
  create(moveId: string, fields: { name: string; type: string; icon: string; color: string }, userId: string): RoomDto {
    if (!moveId) throw new ApiError(400, "moveId is required.");
    if (!fields.name?.trim()) throw new ApiError(400, "Room name is required.");
    assertOwner(ownerUserIdForMove(moveId), userId, "Move not found.");
    const row: RoomRow = {
      id: newId(),
      move_id: moveId,
      name: fields.name.trim(),
      type: fields.type || "other",
      display_name: fields.name.trim(),
      icon: fields.icon || "",
      color: fields.color || "",
    };
    roomModel.insert(row);
    return toDto(row);
  },
  listByMove(moveId: string, userId: string): RoomDto[] {
    assertOwner(ownerUserIdForMove(moveId), userId, "Move not found.");
    return roomModel.listByMove(moveId).map(toDto);
  },
  rename(id: string, name: string, userId: string): RoomDto {
    if (!name?.trim()) throw new ApiError(400, "Room name is required.");
    const existing = roomModel.get(id);
    if (!existing) throw new ApiError(404, "Room not found.");
    assertOwner(ownerUserIdForRoom(id), userId, "Room not found.");
    const trimmed = name.trim();
    roomModel.rename({ id, name: trimmed, display_name: trimmed });
    return toDto({ ...existing, name: trimmed, display_name: trimmed });
  },
  delete(id: string, userId: string) {
    const existing = roomModel.get(id);
    if (!existing) throw new ApiError(404, "Room not found.");
    assertOwner(ownerUserIdForRoom(id), userId, "Room not found.");
    const siblingCount = roomModel.listByMove(existing.move_id).length;
    if (siblingCount <= 1) {
      throw new ApiError(400, "You need at least one room. Add another room before deleting this one.");
    }
    roomModel.delete(id);
  },
};
