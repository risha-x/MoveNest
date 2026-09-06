import { userModel, type UserRow } from "../models/user.js";
import { ApiError } from "../middleware/errorHandler.js";
import { newId, nowIso } from "../utils/id.js";

export type UserDto = {
  id: string;
  displayName: string;
  email: string;
  onboardingCompleted: boolean;
  createdAt: string;
};

function toDto(row: UserRow): UserDto {
  return {
    id: row.id,
    displayName: row.name,
    email: row.email,
    onboardingCompleted: Boolean(row.onboarding_completed),
    createdAt: row.created_at,
  };
}

export const userService = {
  create(displayName: string): UserDto {
    const row: UserRow = {
      id: newId(),
      name: displayName,
      email: "",
      onboarding_completed: 0,
      created_at: nowIso(),
    };
    userModel.insert(row);
    return toDto(row);
  },
  get(id: string): UserDto {
    const row = userModel.get(id);
    if (!row) throw new ApiError(404, "User not found.");
    return toDto(row);
  },
  update(id: string, fields: { displayName?: string; email?: string; onboardingCompleted?: boolean }): UserDto {
    const existing = userModel.get(id);
    if (!existing) throw new ApiError(404, "User not found.");
    const updated = {
      id,
      name: fields.displayName ?? existing.name,
      email: fields.email ?? existing.email,
      onboarding_completed: fields.onboardingCompleted !== undefined
        ? (fields.onboardingCompleted ? 1 : 0)
        : existing.onboarding_completed,
    };
    userModel.update(updated);
    return toDto({ ...existing, ...updated });
  },
};
