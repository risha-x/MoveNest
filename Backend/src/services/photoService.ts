import { photoModel, type PhotoRow } from "../models/photo.js";
import { ApiError } from "../middleware/errorHandler.js";
import { newId, nowIso } from "../utils/id.js";
import { assertOwner, ownerUserIdForMove, ownerUserIdForPhotoOwner } from "../utils/ownership.js";

export type PhotoDto = {
  id: string;
  ownerType: "box" | "item";
  ownerId: string;
  dataUrl: string;
  caption?: string;
  note?: string;
  createdAt: string;
};

// Accepts common photo formats only; base64 length * 0.75 approximates decoded byte size.
const DATA_URL_RE = /^data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/]+=*)$/i;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

function validateDataUrl(dataUrl: string) {
  const match = DATA_URL_RE.exec(dataUrl ?? "");
  if (!match) throw new ApiError(400, "Photo must be a PNG, JPEG, GIF, or WEBP image.");
  const approxBytes = (match[2].length * 3) / 4;
  if (approxBytes > MAX_PHOTO_BYTES) throw new ApiError(400, "Photo is too large (max 8MB).");
}

function toDto(row: PhotoRow): PhotoDto {
  return {
    id: row.id,
    ownerType: row.box_id ? "box" : "item",
    ownerId: (row.box_id ?? row.item_id)!,
    dataUrl: row.data_url,
    caption: row.caption || undefined,
    note: row.note || undefined,
    createdAt: row.created_at,
  };
}

function ownerOf(row: PhotoRow): { ownerType: "box" | "item"; ownerId: string } {
  return row.box_id ? { ownerType: "box", ownerId: row.box_id } : { ownerType: "item", ownerId: row.item_id! };
}

export const photoService = {
  create(fields: { ownerType: "box" | "item"; ownerId: string; dataUrl: string; caption?: string; note?: string }, userId: string): PhotoDto {
    if (!fields.ownerId) throw new ApiError(400, "ownerId is required.");
    validateDataUrl(fields.dataUrl);
    const notFoundMessage = fields.ownerType === "box" ? "Box not found." : "Item not found.";
    assertOwner(ownerUserIdForPhotoOwner(fields.ownerType, fields.ownerId), userId, notFoundMessage);
    const row: PhotoRow = {
      id: newId(),
      box_id: fields.ownerType === "box" ? fields.ownerId : null,
      item_id: fields.ownerType === "item" ? fields.ownerId : null,
      data_url: fields.dataUrl,
      caption: fields.caption ?? "",
      note: fields.note ?? "",
      created_at: nowIso(),
    };
    photoModel.insert(row);
    return toDto(row);
  },
  listByOwner(ownerType: "box" | "item", ownerId: string, userId: string): PhotoDto[] {
    const notFoundMessage = ownerType === "box" ? "Box not found." : "Item not found.";
    assertOwner(ownerUserIdForPhotoOwner(ownerType, ownerId), userId, notFoundMessage);
    const rows = ownerType === "box" ? photoModel.listByBox(ownerId) : photoModel.listByItem(ownerId);
    return rows.map(toDto);
  },
  update(id: string, fields: { caption?: string; note?: string }, userId: string): PhotoDto {
    const existing = photoModel.get(id);
    if (!existing) throw new ApiError(404, "Photo not found.");
    const owner = ownerOf(existing);
    assertOwner(ownerUserIdForPhotoOwner(owner.ownerType, owner.ownerId), userId, "Photo not found.");
    const updated = { id, caption: fields.caption ?? existing.caption, note: fields.note ?? existing.note };
    photoModel.update(updated);
    return toDto({ ...existing, ...updated });
  },
  delete(id: string, userId: string) {
    const existing = photoModel.get(id);
    if (!existing) throw new ApiError(404, "Photo not found.");
    const owner = ownerOf(existing);
    assertOwner(ownerUserIdForPhotoOwner(owner.ownerType, owner.ownerId), userId, "Photo not found.");
    photoModel.delete(id);
  },
  countsForMove(moveId: string, userId: string): Record<string, number> {
    assertOwner(ownerUserIdForMove(moveId), userId, "Move not found.");
    const counts: Record<string, number> = {};
    photoModel.countsForMove(moveId).forEach((row) => {
      counts[row.box_id] = row.count;
    });
    return counts;
  },
};
