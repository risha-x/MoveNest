import type { Item, Move, MoveBox, Photo, UserRoom } from "../types";
import { getSessionUserId } from "../storage";

const BASE = "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const userId = getSessionUserId();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type ApiUser = {
  id: string;
  displayName: string;
  email: string;
  onboardingCompleted: boolean;
  createdAt: string;
};

export const api = {
  // --- users ---
  createUser(displayName: string) {
    return request<ApiUser>("/users", { method: "POST", body: JSON.stringify({ displayName }) });
  },
  getUser(id: string) {
    return request<ApiUser>(`/users/${id}`);
  },
  updateUser(id: string, fields: { displayName?: string; email?: string; onboardingCompleted?: boolean }) {
    return request<ApiUser>(`/users/${id}`, { method: "PUT", body: JSON.stringify(fields) });
  },

  // --- moves ---
  createMove(
    data: { name: string; date: string; from: string; to: string; rooms: { name: string; type: string; icon: string; color: string }[] },
  ) {
    return request<Move>("/moves", { method: "POST", body: JSON.stringify(data) });
  },
  getMove() {
    return request<Move | null>("/moves");
  },
  updateMove(id: string, fields: { name?: string; date?: string; from?: string; to?: string }) {
    return request<Move>(`/moves/${id}`, { method: "PUT", body: JSON.stringify(fields) });
  },

  // --- rooms ---
  createRoom(data: { moveId: string; name: string; type: string; icon: string; color: string }) {
    return request<UserRoom>("/rooms", { method: "POST", body: JSON.stringify(data) });
  },
  renameRoom(id: string, name: string) {
    return request<UserRoom>(`/rooms/${id}`, { method: "PUT", body: JSON.stringify({ name }) });
  },
  deleteRoom(id: string) {
    return request<void>(`/rooms/${id}`, { method: "DELETE" });
  },

  // --- boxes ---
  getBoxesByMove(moveId: string) {
    return request<MoveBox[]>(`/boxes?moveId=${moveId}`);
  },
  createBox(data: { roomId: string; name: string; fragile?: boolean; notes?: string }) {
    return request<MoveBox>("/boxes", { method: "POST", body: JSON.stringify(data) });
  },
  updateBox(id: string, fields: { name?: string; roomId?: string; packed?: boolean; fragile?: boolean; notes?: string }) {
    return request<MoveBox>(`/boxes/${id}`, { method: "PUT", body: JSON.stringify(fields) });
  },
  deleteBox(id: string) {
    return request<void>(`/boxes/${id}`, { method: "DELETE" });
  },

  // --- items ---
  getItemsByMove(moveId: string) {
    return request<Item[]>(`/items?moveId=${moveId}`);
  },
  createItem(data: { boxId: string; name: string; fragile?: boolean; essential?: boolean; notes?: string }) {
    return request<Item>("/items", { method: "POST", body: JSON.stringify(data) });
  },
  updateItem(
    id: string,
    fields: { name?: string; boxId?: string; packed?: boolean; fragile?: boolean; essential?: boolean; notes?: string },
  ) {
    return request<Item>(`/items/${id}`, { method: "PUT", body: JSON.stringify(fields) });
  },
  deleteItem(id: string) {
    return request<void>(`/items/${id}`, { method: "DELETE" });
  },
  setRoomItemsPacked(roomId: string, packed: boolean) {
    return request<void>(`/items/pack-all/${roomId}`, { method: "PUT", body: JSON.stringify({ packed }) });
  },

  // --- photos ---
  getPhotos(ownerType: "box" | "item", ownerId: string) {
    return request<Photo[]>(`/photos?ownerType=${ownerType}&ownerId=${ownerId}`);
  },
  getPhotoCounts(moveId: string) {
    return request<Record<string, number>>(`/photos/counts?moveId=${moveId}`);
  },
  addPhoto(data: { ownerType: "box" | "item"; ownerId: string; dataUrl: string; caption?: string; note?: string }) {
    return request<Photo>("/photos", { method: "POST", body: JSON.stringify(data) });
  },
  updatePhoto(id: string, fields: { caption?: string; note?: string }) {
    return request<Photo>(`/photos/${id}`, { method: "PUT", body: JSON.stringify(fields) });
  },
  deletePhoto(id: string) {
    return request<void>(`/photos/${id}`, { method: "DELETE" });
  },

  // --- search ---
  searchItems(moveId: string, query: string) {
    return request<Item[]>(`/search?moveId=${moveId}&q=${encodeURIComponent(query)}`);
  },
};
