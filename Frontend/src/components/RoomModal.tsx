import { ArrowUpRight, Home, X } from "lucide-react";
import type { Room } from "../types";

export function RoomModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (name: string, icon: Room["icon"]) => void;
}) {
  const roomTypes: { icon: Room["icon"]; label: string }[] = [
    { icon: "bed", label: "Bedroom" },
    { icon: "utensils", label: "Kitchen" },
    { icon: "home", label: "Living room" },
    { icon: "archive", label: "Other" },
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const name = String(data.get("name")).trim();
          const icon = String(data.get("icon")) as Room["icon"];
          if (!name) return;
          onSubmit(name, icon);
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="close-button" onClick={onClose}>
          <X size={19} />
        </button>
        <span className="modal-icon box-option">
          <Home size={23} />
        </span>
        <p className="eyebrow">NEW DESTINATION</p>
        <h2>Add a room</h2>
        <label>
          Room name
          <input name="name" placeholder="e.g. Garage" required />
        </label>
        <label>
          Room type
          <select name="icon" defaultValue="archive">
            {roomTypes.map((type) => (
              <option value={type.icon} key={type.icon}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <button className="submit-button">
          Add room <ArrowUpRight size={17} />
        </button>
      </form>
    </div>
  );
}
