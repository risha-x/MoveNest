import { Box, Grid2X2, Home, PackagePlus, Search } from "lucide-react";
import { useApp } from "../context/AppContext";

export function BottomNav() {
  const { active, setActive, setShowAdd, setShowProfile, setShowQuickAdd } = useApp();
  return (
    <nav className="bottom-nav">
      <button
        className={active === "home" ? "nav-active" : ""}
        onClick={() => setActive("home")}
      >
        <Home size={19} />
        <span>Home</span>
      </button>
      <button
        className={active === "boxes" ? "nav-active" : ""}
        onClick={() => setActive("boxes")}
      >
        <Box size={19} />
        <span>Boxes</span>
      </button>
      <button
        className="add-nav"
        onClick={() => {
          setShowAdd(false);
          setShowProfile(false);
          setShowQuickAdd(true);
        }}
      >
        <span>
          <PackagePlus size={22} />
        </span>
        <small>Add</small>
      </button>
      <button
        className={active === "search" ? "nav-active" : ""}
        onClick={() => setActive("search")}
      >
        <Search size={19} />
        <span>Search</span>
      </button>
      <button
        className={active === "move" ? "nav-active" : ""}
        onClick={() => setActive("move")}
      >
        <Grid2X2 size={19} />
        <span>Move</span>
      </button>
    </nav>
  );
}
