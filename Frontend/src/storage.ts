import type { Room } from "./types";

// Default room-type colors, used for onboarding and when adding a room later.
export const rooms: Room[] = [
  { id: "kitchen", name: "Kitchen", icon: "utensils", color: "#f5c563" },
  { id: "bedroom", name: "Bedroom", icon: "bed", color: "#b9e8dc" },
  { id: "living", name: "Living room", icon: "home", color: "#f6c9b8" },
  { id: "bathroom", name: "Bathroom", icon: "archive", color: "#c7e6e2" },
];

// All real data now lives in the backend/SQLite. The only thing this browser
// still remembers on its own is *which* user it is, so it knows who to ask
// the API for on the next visit — there's no password/session, just this id.
const SESSION_KEY = "movenest-user-id";

export const getSessionUserId = (): string | null => localStorage.getItem(SESSION_KEY);
export const setSessionUserId = (id: string) => localStorage.setItem(SESSION_KEY, id);
export const clearSessionUserId = () => localStorage.removeItem(SESSION_KEY);
