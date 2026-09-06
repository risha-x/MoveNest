import { Box, Camera, ChevronRight, Pencil } from "lucide-react";
import type { MoveBox, Room } from "../types";
import { RoomIcon } from "./RoomIcon";

export function BoxCard({
  box,
  room,
  photoCount,
  onOpen,
  onTogglePacked,
  onToggleUnpacked,
  onEdit,
}: {
  box: MoveBox;
  room: Room;
  photoCount: number;
  onOpen: () => void;
  onTogglePacked: () => void;
  onToggleUnpacked: () => void;
  onEdit: () => void;
}) {
  return (
    <button className="large-box-card box-card-button" onClick={onOpen}>
      <div className="large-box-top">
        <span className="box-thumb" style={{ background: room.color }}>
          <Box size={22} />
        </span>
        <span className="large-box-top-actions">
          <span
            className={`mini-status ${box.packed ? "ready" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={box.packed ? `Mark ${box.name} as in progress` : `Mark ${box.name} as packed`}
            onClick={(event) => {
              event.stopPropagation();
              onTogglePacked();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onTogglePacked();
              }
            }}
          >
            {box.packed ? "Packed" : "In progress"}
          </span>
          <span
            className={`mini-status ${box.unpacked ? "ready" : ""}`}
            role="button"
            tabIndex={0}
            aria-label={box.unpacked ? `Mark ${box.name} as not unpacked` : `Mark ${box.name} as unpacked`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleUnpacked();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onToggleUnpacked();
              }
            }}
          >
            {box.unpacked ? "Unpacked" : "To unpack"}
          </span>
          <span
            className="icon-chip"
            role="button"
            tabIndex={0}
            aria-label={`Edit ${box.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onEdit();
              }
            }}
          >
            <Pencil size={13} />
          </span>
        </span>
      </div>
      <h3>{box.name}</h3>
      <p>
        <RoomIcon room={room} size={14} /> {room.name} ·{" "}
        {box.itemCount} items
        {box.essential && <span className="essential-star">Essential</span>}
        {photoCount > 0 && (
          <span className="photo-count-badge"><Camera size={11} /> {photoCount}</span>
        )}
      </p>
      <div className="item-chips">
        {box.items.slice(0, 3).map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
      <span className="card-link">
        Open box <ChevronRight size={15} />
      </span>
    </button>
  );
}
