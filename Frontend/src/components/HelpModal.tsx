import { CircleHelp, X } from "lucide-react";

const TIPS = [
  { title: "Rooms → Boxes → Items", body: "Every move is organized this way. Add a room, add boxes to it, then add items to a box." },
  { title: "Box contents photos", body: "Snap a photo of what's inside before you seal a box, so you never have to reopen it to check." },
  { title: "Condition photos", body: "For valuables, add a condition photo before the move — useful for insurance if anything gets damaged in transit." },
  { title: "Quick add", body: "The + button in the bottom nav is the fastest way to add an item or box from anywhere in the app." },
  { title: "Search", body: "Find any item by name, room, or box, or filter by Essential / Fragile / Unpacked." },
];

export function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose}>
          <X size={19} />
        </button>
        <span className="modal-icon">
          <CircleHelp size={22} />
        </span>
        <p className="eyebrow">QUICK TIPS</p>
        <h2>How MoveNest works</h2>
        <ul className="help-tip-list">
          {TIPS.map((tip) => (
            <li key={tip.title}>
              <strong>{tip.title}</strong>
              <p>{tip.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
