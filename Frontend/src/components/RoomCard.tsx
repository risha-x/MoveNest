import { Home } from "lucide-react";
import type { UserRoom } from "../types";

export function RoomCard({
  room,
  boxCount,
  percent,
  onClick,
}: {
  room: UserRoom;
  boxCount: number;
  percent: number;
  onClick: () => void;
}) {
  return (
    <button className="room-card" onClick={onClick}>
      <Home size={16} />
      <strong>{room.displayName}</strong>
      <small>
        {boxCount} boxes · {percent}% packed
      </small>
    </button>
  );
}
