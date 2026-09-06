import type { FormEvent } from "react";
import { ArrowUpRight, Box, Trash2, X } from "lucide-react";
import type { MoveBox, UserRoom } from "../types";

export function BoxModal({
  userRooms,
  defaultRoomId,
  editingBox,
  onClose,
  onSubmit,
  onDelete,
}: {
  userRooms: UserRoom[];
  defaultRoomId?: string;
  editingBox?: MoveBox | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
}) {
  const initialRoomId =
    (editingBox?.roomId && userRooms.some((room) => room.id === editingBox.roomId)
      ? editingBox.roomId
      : defaultRoomId && userRooms.some((room) => room.id === defaultRoomId)
        ? defaultRoomId
        : userRooms[0]?.id) ?? "";
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
        <span className="modal-icon box-option">
          <Box size={23} />
        </span>
        <p className="eyebrow">{editingBox ? "EDIT BOX" : "QUICK ADD"}</p>
        <h2>{editingBox ? "Edit box" : "Give a box a home"}</h2>
        <label>
          Box name
          <input name="name" defaultValue={editingBox?.name} placeholder="e.g. Kitchen Box 3" required />
        </label>
        <label>
          Destination room
          <select name="room" defaultValue={initialRoomId}>
            {userRooms.map((room) => (
              <option value={room.id} key={room.id}>
                {room.displayName || room.name}
              </option>
            ))}
          </select>
        </label>
        <div className="checks">
          <label>
            <input type="checkbox" name="fragile" defaultChecked={editingBox?.fragile} /> Fragile box
          </label>
          <label>
            <input type="checkbox" name="essential" defaultChecked={editingBox?.essential} /> Essential box
          </label>
        </div>
        <label>
          Notes <span className="label-optional">(optional)</span>
          <textarea name="notes" defaultValue={editingBox?.notes} placeholder="e.g. Heavier items on the bottom" rows={3} />
        </label>
        <button className="submit-button">
          {editingBox ? "Save changes" : "Create box"} <ArrowUpRight size={17} />
        </button>
        {onDelete && (
          <button type="button" className="logout-button" onClick={onDelete}>
            <Trash2 size={15} /> Delete box
          </button>
        )}
      </form>
    </div>
  );
}
