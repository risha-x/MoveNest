import { Check, Settings, X } from "lucide-react";
import type { User } from "../types";

export function ProfileModal({
  user,
  onClose,
  onSave,
  onLogout,
}: {
  user: User;
  onClose: () => void;
  onSave: (updates: {
    displayName: string;
    email: string;
    move: { name: string; date: string; from: string; to: string };
  }) => void;
  onLogout: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          onSave({
            displayName: String(data.get("name")).trim(),
            email: String(data.get("email")).trim(),
            move: {
              name: String(data.get("moveName")).trim(),
              date: String(data.get("moveDate")),
              from: String(data.get("moveFrom")).trim(),
              to: String(data.get("moveTo")).trim(),
            },
          });
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="close-button" onClick={onClose}>
          <X size={19} />
        </button>
        <span className="modal-icon">
          <Settings size={22} />
        </span>
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h2>Profile & settings</h2>

        <label>
          Display name
          <input name="name" defaultValue={user.displayName} required />
        </label>
        <label>
          Email
          <input name="email" type="email" defaultValue={user.email || ""} placeholder="you@example.com" />
        </label>

        <div className="profile-details-card">
          <p className="profile-section-label">Move details</p>
          <label>
            Move name
            <input name="moveName" defaultValue={user.move?.name || ""} placeholder="My New Apartment" />
          </label>
          <label>
            Moving day
            <input name="moveDate" type="date" defaultValue={user.move?.date || ""} />
          </label>
          <div className="form-row">
            <label>
              From
              <input name="moveFrom" defaultValue={user.move?.from || ""} placeholder="Current home" />
            </label>
            <label>
              To
              <input name="moveTo" defaultValue={user.move?.to || ""} placeholder="New home" />
            </label>
          </div>
        </div>

        <button className="submit-button">
          Save changes <Check size={17} />
        </button>
        <button type="button" className="logout-button" onClick={onLogout}>
          Log out
        </button>
      </form>
    </div>
  );
}
