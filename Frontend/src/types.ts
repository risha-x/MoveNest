export type Room = {
  id: string;
  name: string;
  icon: "utensils" | "bed" | "home" | "archive";
  color: string;
};
export type UserRoom = Room & { type: string; defaultName: string; displayName: string };
export type Item = {
  id: string;
  name: string;
  boxId: string;
  roomId: string;
  fragile?: boolean;
  essential?: boolean;
  packed: boolean;
  notes?: string;
};
export type MoveBox = {
  id: string;
  name: string;
  roomId: string;
  packed: boolean;
  fragile: boolean;
  itemCount: number;
  items: string[];
  notes?: string;
};
export type Photo = {
  id: string;
  ownerType: "box" | "item";
  ownerId: string;
  dataUrl: string;
  caption?: string;
  note?: string;
  createdAt: string;
};
export type Move = {
  id: string;
  name: string;
  date: string;
  from: string;
  to: string;
  rooms: UserRoom[];
};
// What onboarding builds client-side, before the backend has assigned a real id.
export type MoveDraft = {
  name: string;
  date: string;
  from: string;
  to: string;
  rooms: UserRoom[];
};
export type User = {
  id: string;
  email: string;
  displayName: string;
  onboardingCompleted: boolean;
  createdAt: string;
  move?: Move;
};
export type AuthView = "welcome" | "name" | "move";
