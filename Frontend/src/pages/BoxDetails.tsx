import { AlertTriangle, ArrowLeft, Check, Pencil, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";
import { RoomIcon } from "../components/RoomIcon";
import { ItemCard } from "../components/ItemCard";
import { PhotoUploader } from "../components/PhotoUploader";

export function BoxDetails() {
  const {
    viewedBox,
    roomFor,
    items,
    setActive,
    openBoxEdit,
    toggleBoxPacked,
    setAddItemBoxContext,
    setSelectedRoomId,
    setEditingItemId,
    setShowAdd,
    setConditionPhotoItemId,
    openItemEdit,
    toggleItemPacked,
  } = useApp();

  if (!viewedBox) return null;

  const room = roomFor(viewedBox.roomId);
  const boxItems = items.filter((item) => item.boxId === viewedBox.id);
  const boxPacked = boxItems.filter((item) => item.packed).length;
  const boxPercent = boxItems.length ? Math.round((boxPacked / boxItems.length) * 100) : 0;

  return (
    <section className="view-section room-detail-view">
      <div className="back-link-row">
        <button className="back-link" onClick={() => setActive("home")}><ArrowLeft size={14} /> Return to Home</button>
        <button className="back-link" onClick={() => setActive("boxes")}><ArrowLeft size={14} /> Back to boxes</button>
      </div>
      <div className="room-detail-heading">
        <div>
          <p className="eyebrow">
            <RoomIcon room={room} size={11} /> {room.name}
            {viewedBox.fragile && (
              <span className="fragile-badge"><AlertTriangle size={11} /> Fragile</span>
            )}
          </p>
          <h1>{viewedBox.name}</h1>
        </div>
        <div className="room-detail-actions">
          <button
            type="button"
            className="icon-chip"
            aria-label={`Edit ${viewedBox.name}`}
            onClick={() => openBoxEdit(viewedBox)}
          >
            <Pencil size={15} />
          </button>
          <button
            className={`mini-status pack-toggle ${viewedBox.packed ? "ready" : ""}`}
            onClick={() => toggleBoxPacked(viewedBox.id)}
          >
            {viewedBox.packed && <Check size={13} />}
            {viewedBox.packed ? "Packed" : "Mark packed"}
          </button>
        </div>
      </div>
      <div className="room-summary">
        <strong>{boxItems.length} items</strong>
        <strong>{boxPercent}% packed</strong>
      </div>
      {viewedBox.notes && <p className="notes-block">{viewedBox.notes}</p>}
      <div className="view-toolbar">
        <div className="section-heading compact"><div><div className="section-kicker">BOX CONTENTS</div><h2>What's inside</h2></div></div>
        <div className="room-detail-actions">
          <button
            className="soft-button"
            onClick={() => { setAddItemBoxContext(viewedBox.id); setSelectedRoomId(viewedBox.roomId); setEditingItemId(null); setShowAdd(true); }}
          >
            <Tag size={16} /> Add item
          </button>
        </div>
      </div>
      <div className="search-results room-items">
        {boxItems.length === 0 && (
          <p className="muted">No items in this box yet. Add one to get started.</p>
        )}
        {boxItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onPhotos={() => setConditionPhotoItemId(item.id)}
            onEdit={() => openItemEdit(item)}
            onTogglePacked={() => toggleItemPacked(item.id)}
          />
        ))}
      </div>
      <div className="section-heading compact"><div><div className="section-kicker">PHOTOS</div><h2>Box contents photos</h2></div></div>
      <PhotoUploader ownerType="box" ownerId={viewedBox.id} mode="box" />
    </section>
  );
}
