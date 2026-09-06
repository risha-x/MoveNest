import { Check, Trash2, X } from "lucide-react";
import type { Photo } from "../types";

export function PhotoLightbox({
  photo,
  mode,
  onClose,
  onDelete,
  onSave,
}: {
  photo: Photo;
  mode: "box" | "condition";
  onClose: () => void;
  onDelete: () => void;
  onSave: (fields: { caption?: string; note?: string }) => void;
}) {
  const takenDate = new Date(photo.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal photo-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose}>
          <X size={19} />
        </button>
        <img className="photo-modal-image" src={photo.dataUrl} alt={photo.caption || "Photo"} />
        <p className="muted photo-modal-date">{takenDate}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            onSave({
              caption: String(data.get("caption") || "").trim(),
              note: mode === "condition" ? String(data.get("note") || "").trim() : photo.note,
            });
          }}
        >
          <label>
            Caption
            <input name="caption" defaultValue={photo.caption} placeholder="e.g. Dishes wrapped in towels" />
          </label>
          {mode === "condition" && (
            <label>
              Condition notes
              <textarea name="note" defaultValue={photo.note} placeholder="e.g. Small scratch on bottom-left corner" />
            </label>
          )}
          <button className="submit-button">
            Save <Check size={17} />
          </button>
        </form>
        <button type="button" className="logout-button" onClick={onDelete}>
          <Trash2 size={15} /> Delete photo
        </button>
      </div>
    </div>
  );
}
