import { ArrowLeft, PackagePlus, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";
import { BoxCard } from "../components/BoxCard";

export function Boxes() {
  const {
    boxes,
    userRoomNames,
    boxRoomFilter,
    setBoxRoomFilter,
    setAddItemBoxContext,
    setEditingItemId,
    setShowAdd,
    setEditingBoxId,
    setShowAddBox,
    roomFor,
    openBox,
    toggleBoxPacked,
    openBoxEdit,
    boxPhotoCounts,
    setActive,
  } = useApp();

  const visibleBoxes = boxRoomFilter === "all" ? boxes : boxes.filter((box) => box.roomId === boxRoomFilter);

  return (
    <section className="view-section">
      <button className="back-link" onClick={() => setActive("home")}><ArrowLeft size={14} /> Return to Home</button>
      <p className="eyebrow">EVERYTHING HAS A PLACE</p>
      <h1>Your boxes</h1>
      <div className="view-toolbar">
        <p className="muted">
          {boxes.length} boxes across {userRoomNames.length} rooms
        </p>
        <div className="room-detail-actions">
          <button
            className="soft-button"
            onClick={() => { setAddItemBoxContext(null); setEditingItemId(null); setShowAdd(true); }}
          >
            <Tag size={16} /> Add item
          </button>
          <button
            className="soft-button"
            onClick={() => { setEditingBoxId(null); setShowAddBox(true); }}
          >
            <PackagePlus size={16} /> Add box
          </button>
        </div>
      </div>
      {userRoomNames.length > 0 && (
        <div className="chip-row">
          <button
            className={boxRoomFilter === "all" ? "active" : ""}
            onClick={() => setBoxRoomFilter("all")}
          >
            All rooms
          </button>
          {userRoomNames.map((room) => (
            <button
              key={room.id}
              className={boxRoomFilter === room.id ? "active" : ""}
              onClick={() => setBoxRoomFilter(room.id)}
            >
              {room.displayName}
            </button>
          ))}
        </div>
      )}
      {visibleBoxes.length === 0 && (
        <p className="muted" style={{ marginTop: 20 }}>No boxes here yet.</p>
      )}
      <div className="box-grid">
        {visibleBoxes.map((box) => {
          const room = roomFor(box.roomId);
          return (
            <BoxCard
              key={box.id}
              box={box}
              room={room}
              photoCount={boxPhotoCounts[box.id] || 0}
              onOpen={() => openBox(box.id)}
              onTogglePacked={() => toggleBoxPacked(box.id)}
              onEdit={() => openBoxEdit(box)}
            />
          );
        })}
      </div>
    </section>
  );
}
