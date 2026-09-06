import { Archive, BedDouble, Home, Utensils } from "lucide-react";
import type { Room } from "../types";

export function RoomIcon({ room, size = 18 }: { room: Room; size?: number }) {
  const Icon =
    room.icon === "utensils"
      ? Utensils
      : room.icon === "bed"
        ? BedDouble
        : room.icon === "home"
          ? Home
          : Archive;
  return <Icon size={size} strokeWidth={1.8} />;
}
