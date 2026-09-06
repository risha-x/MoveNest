import { ArrowLeft, ChevronRight, PackagePlus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { RoomIcon } from "../components/RoomIcon";

export function Rooms() {
  const { userRooms, boxes, items, openRoom, setShowAddRoom, setActive } = useApp();

  return (
    <section className="view-section">
      <button className="back-link" onClick={() => setActive("home")}><ArrowLeft size={14} /> Return to Home</button>
      <div className="view-toolbar">
        <div>
          <p className="eyebrow">YOUR NEW HOME</p>
          <h1>Rooms</h1>
          <p className="muted">Every destination, ready to be organized.</p>
        </div>
        <button className="soft-button" onClick={() => setShowAddRoom(true)}>
          <PackagePlus size={16} /> Add room
        </button>
      </div>
      <div className="rooms-page-grid">
        {userRooms.map((room) => (
          <button className="room-page-card" key={room.id} onClick={() => openRoom(room.id)}>
            <span className="room-page-icon" style={{ background: room.color }}>
              <RoomIcon room={room} size={24} />
            </span>
            <span>
              <strong>{room.displayName}</strong>
              <small>
                {boxes.filter((box) => box.roomId === room.id).length} boxes ·{" "}
                {items.filter((item) => item.roomId === room.id).length} items
              </small>
            </span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
    </section>
  );
}
