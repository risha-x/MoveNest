import { ArrowLeft, Box, Check, ChevronRight, PackagePlus, Pencil, Tag, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { ItemCard } from "../components/ItemCard";

export function RoomDetails() {
  const {
    selectedRoom,
    boxes,
    items,
    setActive,
    editingRoomId,
    setEditingRoomId,
    renameRoom,
    deleteRoom,
    toggleRoomItemsPacked,
    setSelectedRoomId,
    setEditingBoxId,
    setShowAddBox,
    setAddItemBoxContext,
    setEditingItemId,
    setShowAdd,
    openBox,
    openBoxEdit,
    setConditionPhotoItemId,
    openItemEdit,
    toggleItemPacked,
  } = useApp();

  if (!selectedRoom) return null;

  const roomBoxes = boxes.filter((box) => box.roomId === selectedRoom.id);
  const roomItems = items.filter((item) => item.roomId === selectedRoom.id);
  const allRoomItemsPacked = roomItems.length > 0 && roomItems.every((item) => item.packed);

  return (
    <section className="view-section room-detail-view">
      <button className="back-link" onClick={() => setActive("home")}><ArrowLeft size={14} /> Return to Home</button>
      <div className="room-detail-heading">
        <div>
          <p className="eyebrow">{selectedRoom.type.toUpperCase()}</p>
          {editingRoomId === selectedRoom.id ? (
            <form className="room-rename" onSubmit={renameRoom}>
              <input name="roomName" aria-label="Room name" defaultValue={selectedRoom.displayName} autoFocus />
              <button aria-label="Save room name"><Check size={15} /></button>
            </form>
          ) : (
            <h1 onClick={() => setEditingRoomId(selectedRoom.id)} style={{ cursor: "pointer" }}>
              {selectedRoom.displayName}
            </h1>
          )}
        </div>
        <button
          type="button"
          className="icon-chip danger-chip"
          aria-label={`Delete ${selectedRoom.displayName}`}
          onClick={() => deleteRoom(selectedRoom.id)}
        >
          <Trash2 size={15} />
        </button>
      </div>
      <div className="room-summary">
        <strong>{roomItems.length} items</strong>
        <strong>{roomBoxes.length} boxes</strong>
        <strong>
          {roomItems.filter((item) => item.packed).length
            ? Math.round((roomItems.filter((item) => item.packed).length / Math.max(1, roomItems.length)) * 100)
            : 0}
          % packed
        </strong>
      </div>
      <div className="view-toolbar">
        <div className="section-heading compact">
          <div>
            <div className="section-kicker">ROOM CONTENTS</div>
            <h2>Boxes and items</h2>
          </div>
        </div>
        <div className="room-detail-actions">
          {roomItems.length > 0 && (
            <button
              className="soft-button ghost-button"
              onClick={() => toggleRoomItemsPacked(selectedRoom.id, !allRoomItemsPacked)}
            >
              <Check size={16} /> {allRoomItemsPacked ? "Mark all unpacked" : "Mark all packed"}
            </button>
          )}
          <button
            className="soft-button"
            onClick={() => { setSelectedRoomId(selectedRoom.id); setEditingBoxId(null); setShowAddBox(true); }}
          >
            <PackagePlus size={16} /> Add box
          </button>
          <button
            className="soft-button"
            disabled={roomBoxes.length === 0}
            title={roomBoxes.length === 0 ? "Add a box in this room first" : undefined}
            onClick={() => { setSelectedRoomId(selectedRoom.id); setAddItemBoxContext(null); setEditingItemId(null); setShowAdd(true); }}
          >
            <Tag size={16} /> Add item
          </button>
        </div>
      </div>
      <div className="box-list">
        {roomBoxes.length === 0 ? (
          <p className="muted">No boxes yet. Add a box to start packing this room.</p>
        ) : (
          roomBoxes.map((box) => (
            <button className="box-row" key={box.id} onClick={() => openBox(box.id)}>
              <span className="box-thumb" style={{ background: selectedRoom.color }}><Box size={20} /></span>
              <span className="box-copy"><strong>{box.name}</strong><small>{box.itemCount} items</small></span>
              <span className={`mini-status ${box.packed ? "ready" : ""}`}>{box.packed ? "Packed" : "Packing"}</span>
              <span
                className="icon-chip"
                role="button"
                tabIndex={0}
                aria-label={`Edit ${box.name}`}
                onClick={(event) => { event.stopPropagation(); openBoxEdit(box); }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    openBoxEdit(box);
                  }
                }}
              >
                <Pencil size={13} />
              </span>
              <ChevronRight size={16} />
            </button>
          ))
        )}
      </div>
      <div className="search-results room-items">
        {roomBoxes.length > 0 && roomItems.length === 0 && (
          <p className="muted">No items yet. Add an item to one of your boxes.</p>
        )}
        {roomItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onPhotos={() => setConditionPhotoItemId(item.id)}
            onEdit={() => openItemEdit(item)}
            onTogglePacked={() => toggleItemPacked(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
