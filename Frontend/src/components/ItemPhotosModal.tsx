import { Camera, X } from "lucide-react";
import type { Item, UserRoom } from "../types";
import { PhotoUploader } from "./PhotoUploader";

export function ItemPhotosModal({
  item,
  room,
  onClose,
}: {
  item: Item;
  room: UserRoom;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose}>
          <X size={19} />
        </button>
        <span className="modal-icon">
          <Camera size={23} />
        </span>
        <p className="eyebrow">CONDITION PHOTOS</p>
        <h2>{item.name}</h2>
        <p className="muted" style={{ marginBottom: 20 }}>{room.displayName}</p>
        <PhotoUploader ownerType="item" ownerId={item.id} mode="condition" />
      </div>
    </div>
  );
}
