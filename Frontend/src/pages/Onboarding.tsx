import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, Box, MapPin, Sparkles } from "lucide-react";
import type { AuthView, MoveDraft, UserRoom } from "../types";

function AuthFrame({ children }: { children: ReactNode }) {
  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Box size={20} /> MoveNest
      </div>
      {children}
      <p className="auth-footer">Every box has a home.</p>
    </main>
  );
}

export function Onboarding({
  view,
  onBegin,
  onName,
  onMove,
}: {
  view: AuthView;
  onBegin: () => void;
  onName: (name: string) => void;
  onMove: (move: MoveDraft) => void;
}) {
  const [error, setError] = useState("");
  const [counts, setCounts] = useState({
    Bedrooms: 1,
    Bathrooms: 1,
    "Living Rooms": 1,
    Kitchens: 1,
    Offices: 0,
  });
  const [customRooms, setCustomRooms] = useState<
    { name: string; quantity: number }[]
  >([]);
  const changeCount = (name: string, amount: number) =>
    setCounts((current) => ({
      ...current,
      [name]: Math.max(
        0,
        (current[name as keyof typeof current] || 0) + amount,
      ),
    }));
  const roomLabel = (name: string) => name.replace(/s$/, "");
  if (view === "name")
    return (
      <AuthFrame>
        <form
          className="auth-card"
          onSubmit={(event) => {
            event.preventDefault();
            const name = String(
              new FormData(event.currentTarget).get("name"),
            ).trim();
            if (name) {
              onName(name);
            } else {
              setError("Tell us what to call you.");
            }
          }}
        >
          <span className="auth-icon">
            <Sparkles size={24} />
          </span>
          <p className="eyebrow">NICE TO MEET YOU</p>
          <h1>What should we call you?</h1>
          <p className="auth-subtitle">Let’s make MoveNest feel like home.</p>
          <label>
            Your name
            <input name="name" autoFocus placeholder="e.g. Alex" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="auth-submit">
            Continue <ArrowUpRight size={17} />
          </button>
        </form>
      </AuthFrame>
    );
  if (view === "move")
    return (
      <AuthFrame>
        <form
          className="auth-card wide-auth"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const generated = Object.entries(counts).flatMap(
              ([type, quantity]) =>
                Array.from({ length: quantity }, (_, index) =>
                  ({ id: `room-${Date.now()}-${type}-${index}`, type: type.toLowerCase().replace(/s$/, ""), defaultName: quantity === 1 ? type.replace(/s$/, "") : `${type.replace(/s$/, "")} ${index + 1}`, displayName: quantity === 1 ? type.replace(/s$/, "") : `${type.replace(/s$/, "")} ${index + 1}`, name: quantity === 1 ? type.replace(/s$/, "") : `${type.replace(/s$/, "")} ${index + 1}`, icon: type.includes("Bedroom") ? "bed" : type.includes("Kitchen") ? "utensils" : type.includes("Living") ? "home" : "archive", color: type.includes("Bedroom") ? "#b9e8dc" : type.includes("Kitchen") ? "#f5c563" : type.includes("Living") ? "#f6c9b8" : "#c7e6e2" } as UserRoom),
                ),
            );
            const custom = customRooms.flatMap((room) =>
              Array.from({ length: room.quantity }, (_, index) =>
                ({ id: `room-${Date.now()}-custom-${index}`, type: room.name.toLowerCase(), defaultName: room.quantity === 1 ? room.name : `${room.name} ${index + 1}`, displayName: room.quantity === 1 ? room.name : `${room.name} ${index + 1}`, name: room.quantity === 1 ? room.name : `${room.name} ${index + 1}`, icon: "archive", color: "#c7e6e2" } as UserRoom),
              ),
            );
            onMove({
              name: String(data.get("moveName")),
              date: String(data.get("date")),
              from: String(data.get("from")),
              to: String(data.get("to")),
              rooms: [...generated, ...custom],
            });
          }}
        >
          <span className="auth-icon">
            <MapPin size={24} />
          </span>
          <p className="eyebrow">ONE LAST THING</p>
          <h1>Tell us about your new place</h1>
          <p className="auth-subtitle">
            A few details help us organize every box around your home.
          </p>
          <label>
            What should we call this move?
            <input name="moveName" autoComplete="off" required placeholder="My New Apartment" />
          </label>
          <label>
            When is moving day?
            <input name="date" autoComplete="off" type="date" required />
          </label>
          <div className="room-counts">
            <p className="room-count-title">How many rooms?</p>
            {Object.entries(counts).map(([name, quantity]) => (
              <div className="room-stepper" key={name}>
                  <span>{roomLabel(name)}</span>
                <span className="step-controls">
                  <button
                    type="button"
                    aria-label={`Decrease ${name}`}
                    onClick={() => changeCount(name, -1)}
                  >
                    -
                  </button>
                  <strong>{quantity}</strong>
                  <button
                    type="button"
                    aria-label={`Increase ${name}`}
                    onClick={() => changeCount(name, 1)}
                  >
                    +
                  </button>
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="add-room-button"
            onClick={() =>
              setCustomRooms((current) => [
                ...current,
                { name: "New room", quantity: 1 },
              ])
            }
          >
            + Add another room type
          </button>
          {customRooms.map((room, index) => (
            <div className="custom-room-row" key={index}>
              <input
                aria-label="Room type"
                value={room.name}
                onChange={(event) =>
                  setCustomRooms((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index
                        ? { ...entry, name: event.target.value }
                        : entry,
                    ),
                  )
                }
              />
              <span className="step-controls">
                <button
                  type="button"
                  onClick={() =>
                    setCustomRooms((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index
                          ? {
                              ...entry,
                              quantity: Math.max(0, entry.quantity - 1),
                            }
                          : entry,
                      ),
                    )
                  }
                >
                  -
                </button>
                <strong>{room.quantity}</strong>
                <button
                  type="button"
                  onClick={() =>
                    setCustomRooms((current) =>
                      current.map((entry, entryIndex) =>
                        entryIndex === index
                          ? { ...entry, quantity: entry.quantity + 1 }
                          : entry,
                      ),
                    )
                  }
                >
                  +
                </button>
              </span>
            </div>
          ))}
          <div className="form-row">
            <label>
              Moving from
              <input name="from" placeholder="Optional" />
            </label>
            <label>
              Moving to
              <input name="to" placeholder="Optional" />
            </label>
          </div>
          <button className="auth-submit">
            Start my move <ArrowUpRight size={17} />
          </button>
        </form>
      </AuthFrame>
    );
  if (view === "welcome")
    return (
      <AuthFrame>
        <div className="welcome-card">
          <span className="welcome-box">
            <Box size={35} />
          </span>
          <p className="eyebrow">MOVING, MADE HUMAN</p>
          <h1>MoveNest</h1>
          <p className="tagline">Every box has a home.</p>
          <div className="welcome-illustration">
            <div className="illustration-house">⌂</div>
            <div className="illustration-box">
              <Box size={42} />
            </div>
          </div>
          <button className="auth-submit" onClick={onBegin}>
            Get started <ArrowUpRight size={17} />
          </button>
        </div>
      </AuthFrame>
    );
  return null;
}
