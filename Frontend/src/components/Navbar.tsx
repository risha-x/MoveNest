import { Box, CircleHelp } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Navbar() {
  const { currentUser, setActive, setShowProfile, setShowHelp } = useApp();
  return (
    <header className="topbar">
      <button className="brand-mark" onClick={() => setActive("home")} aria-label="Go to home">
        <Box size={20} />
        <span>MoveNest</span>
      </button>
      <div className="top-actions">
        <button className="icon-button" aria-label="Help" onClick={() => setShowHelp(true)}>
          <CircleHelp size={19} />
        </button>
        <button
          className="avatar"
          aria-label={`Open profile for ${currentUser.displayName}`}
          onClick={() => setShowProfile(true)}
        >
          {currentUser.displayName.trim().charAt(0).toUpperCase() || "?"}
        </button>
      </div>
    </header>
  );
}
