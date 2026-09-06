import { moveModel } from "../models/move.js";
import { roomModel } from "../models/room.js";
import { boxModel } from "../models/box.js";
import { itemModel } from "../models/item.js";
import { ApiError } from "../middleware/errorHandler.js";

// Rooms/boxes/items/photos don't carry a user_id of their own - ownership is
// derived by walking up the FK chain to the move that has one.
export function ownerUserIdForMove(moveId: string): string | undefined {
  return moveModel.getById(moveId)?.user_id;
}

export function ownerUserIdForRoom(roomId: string): string | undefined {
  const room = roomModel.get(roomId);
  return room ? ownerUserIdForMove(room.move_id) : undefined;
}

export function ownerUserIdForBox(boxId: string): string | undefined {
  const box = boxModel.get(boxId);
  return box ? ownerUserIdForRoom(box.room_id) : undefined;
}

export function ownerUserIdForItem(itemId: string): string | undefined {
  const item = itemModel.get(itemId);
  return item ? ownerUserIdForRoom(item.room_id) : undefined;
}

export function ownerUserIdForPhotoOwner(ownerType: "box" | "item", ownerId: string): string | undefined {
  return ownerType === "box" ? ownerUserIdForBox(ownerId) : ownerUserIdForItem(ownerId);
}

// Throws a 404 (not 403) so a guessed id can't be used to confirm another
// user's resource exists.
export function assertOwner(actualOwnerUserId: string | undefined, userId: string, notFoundMessage: string) {
  if (!actualOwnerUserId || actualOwnerUserId !== userId) {
    throw new ApiError(404, notFoundMessage);
  }
}
