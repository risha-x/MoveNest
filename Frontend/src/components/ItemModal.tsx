import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowUpRight, PackagePlus, Trash2, X } from "lucide-react";
import type { Item, MoveBox, UserRoom } from "../types";

export function ItemModal({
  boxes,
  userRooms,
  defaultRoomId,
  defaultBoxId,
  editingItem,
  onClose,
  onSubmit,
  onDelete,
}: {
  boxes: MoveBox[];
  userRooms: UserRoom[];
  defaultRoomId?: string;
  defaultBoxId?: string;
  editingItem?: Item | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
}) {
  const [selectedRoomId, setSelectedRoomId] = useState(
    (defaultRoomId && userRooms.some((room) => room.id === defaultRoomId)
      ? defaultRoomId
      : userRooms[0]?.id) ?? "",
  );
  const [selectedBoxId, setSelectedBoxId] = useState(
    (defaultBoxId && boxes.some((box) => box.id === defaultBoxId)) ? defaultBoxId : "",
  );

  const effectiveRoomId = userRooms.some((room) => room.id === selectedRoomId)
    ? selectedRoomId
    : userRooms[0]?.id ?? "";
  const roomBoxes = boxes.filter((box) => box.roomId === effectiveRoomId);
  const effectiveBoxId = roomBoxes.some((box) => box.id === selectedBoxId)
    ? selectedBoxId
    : roomBoxes[0]?.id ?? "";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onSubmit={onSubmit}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="close-button" onClick={onClose}>
          <X size={19} />
        </button>
        <span className="modal-icon">
          <PackagePlus size={23} />
        </span>
        <p className="eyebrow">{editingItem ? "EDIT ITEM" : "QUICK ADD"}</p>
        <h2>{editingItem ? "Edit item" : "Give it a home"}</h2>
        <label>
          Item name
          <input name="name" defaultValue={editingItem?.name} placeholder="e.g. Coffee maker" required />
        </label>
        <div className="form-row">
          <label>
            Box
            <select
              name="box"
              value={effectiveBoxId}
              onChange={(event) => setSelectedBoxId(event.target.value)}
              disabled={roomBoxes.length === 0}
            >
              {roomBoxes.length > 0 ? (
                roomBoxes.map((box) => (
                  <option value={box.id} key={box.id}>
                    {box.name}
                  </option>
                ))
              ) : (
                <option value="">No boxes in this room yet</option>
              )}
            </select>
          </label>
          <label>
            Room
            <select
              name="room"
              value={effectiveRoomId}
              onChange={(event) => setSelectedRoomId(event.target.value)}
            >
              {userRooms.map((room) => (
                <option value={room.id} key={room.id}>
                  {room.displayName || room.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="checks">
          <label>
            <input type="checkbox" name="fragile" defaultChecked={editingItem?.fragile} /> Fragile
          </label>
          <label>
            <input type="checkbox" name="essential" defaultChecked={editingItem?.essential} /> Essential
          </label>
        </div>
        <label>
          Notes <span className="label-optional">(optional)</span>
          <textarea name="notes" defaultValue={editingItem?.notes} placeholder="e.g. Needs new batteries" rows={3} />
        </label>
        <button className="submit-button" disabled={roomBoxes.length === 0}>
          {editingItem ? "Save changes" : "Add to my move"} <ArrowUpRight size={17} />
        </button>
        {onDelete && (
          <button type="button" className="logout-button" onClick={onDelete}>
            <Trash2 size={15} /> Delete item
          </button>
        )}
      </form>
    </div>
  );
}
