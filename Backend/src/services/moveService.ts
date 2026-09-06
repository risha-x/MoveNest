import { db } from "../db/connection.js";
import { moveModel, type MoveRow } from "../models/move.js";
import { roomModel, type RoomRow } from "../models/room.js";
import { userModel } from "../models/user.js";
import { ApiError } from "../middleware/errorHandler.js";
import { newId, nowIso } from "../utils/id.js";
import { roomService, type RoomDto } from "./roomService.js";

export type MoveDto = {
  id: string;
  userId: string;
  name: string;
  date: string;
  from: string;
  to: string;
  rooms: RoomDto[];
};

function toDto(row: MoveRow, rooms: RoomDto[]): MoveDto {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    date: row.move_date,
    from: row.origin,
    to: row.destination,
    rooms,
  };
}

const createWithRooms = db.transaction(
  (moveRow: MoveRow, roomRows: RoomRow[]) => {
    moveModel.insert(moveRow);
    roomRows.forEach((room) => roomModel.insert(room));
    userModel.update({
      id: moveRow.user_id,
      name: userModel.get(moveRow.user_id)!.name,
      email: userModel.get(moveRow.user_id)!.email,
      onboarding_completed: 1,
    });
  },
);

export const moveService = {
  create(
    userId: string,
    fields: {
      name: string;
      date: string;
      from: string;
      to: string;
      rooms: { name: string; type: string; icon: string; color: string }[];
    },
  ): MoveDto {
    const moveRow: MoveRow = {
      id: newId(),
      user_id: userId,
      name: fields.name,
      move_date: fields.date,
      origin: fields.from,
      destination: fields.to,
      created_at: nowIso(),
    };
    const roomRows: RoomRow[] = fields.rooms.map((room) => ({
      id: newId(),
      move_id: moveRow.id,
      name: room.name,
      type: room.type,
      display_name: room.name,
      icon: room.icon,
      color: room.color,
    }));
    createWithRooms(moveRow, roomRows);
    return toDto(moveRow, roomService.listByMove(moveRow.id, userId));
  },
  getByUser(userId: string): MoveDto | null {
    const row = moveModel.getByUser(userId);
    if (!row) return null;
    return toDto(row, roomService.listByMove(row.id, userId));
  },
  update(
    id: string,
    fields: { name?: string; date?: string; from?: string; to?: string },
    userId: string,
  ): MoveDto {
    const existing = moveModel.getById(id);
    if (!existing) throw new ApiError(404, "Move not found.");
    if (existing.user_id !== userId) throw new ApiError(404, "Move not found.");
    const updated = {
      id,
      name: fields.name ?? existing.name,
      move_date: fields.date ?? existing.move_date,
      origin: fields.from ?? existing.origin,
      destination: fields.to ?? existing.destination,
    };
    moveModel.update(updated);
    return toDto({ ...existing, ...updated }, roomService.listByMove(id, userId));
  },
};
