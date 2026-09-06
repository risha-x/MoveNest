import type { ReactNode } from "react";
import { Camera, Check, Pencil, StickyNote, Star, Tag } from "lucide-react";
import type { Item } from "../types";

export function ItemCard({
  item,
  subtitle,
  onOpen,
  onPhotos,
  onEdit,
  onTogglePacked,
}: {
  item: Item;
  subtitle?: ReactNode;
  onOpen?: () => void;
  onPhotos: () => void;
  onEdit: () => void;
  onTogglePacked: () => void;
}) {
  return (
    <div className="result-row">
      {onOpen ? (
        <button className="result-body" onClick={onOpen}>
          <span className="result-symbol">
            <Tag size={18} />
          </span>
          <div>
            <strong>
              {item.name} {item.essential && <Star size={12} className="essential-star" />}
              {item.notes && <StickyNote size={12} className="notes-indicator" aria-label="Has notes" />}
            </strong>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </button>
      ) : (
        <>
          <span className="result-symbol">
            <Tag size={18} />
          </span>
          <div>
            <strong>
              {item.name} {item.essential && <Star size={12} className="essential-star" />}
              {item.notes && <StickyNote size={12} className="notes-indicator" aria-label="Has notes" />}
            </strong>
          </div>
        </>
      )}
      <span className="row-actions">
        <button
          type="button"
          className="icon-chip"
          aria-label={`Condition photos for ${item.name}`}
          onClick={onPhotos}
        >
          <Camera size={13} />
        </button>
        <button
          type="button"
          className="icon-chip"
          aria-label={`Edit ${item.name}`}
          onClick={onEdit}
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          className={`item-check ${item.packed ? "checked" : ""}`}
          aria-pressed={item.packed}
          aria-label={item.packed ? `Mark ${item.name} as not packed` : `Mark ${item.name} as packed`}
          onClick={onTogglePacked}
        >
          {item.packed && <Check size={13} />}
        </button>
      </span>
    </div>
  );
}
