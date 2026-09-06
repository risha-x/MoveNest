import {
  AlertTriangle,
  ArrowUpRight,
  Box,
  CalendarDays,
  ChevronRight,
  Lightbulb,
  MapPin,
  PackagePlus,
  Search,
  Star,
  Tag,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { RoomIcon } from "../components/RoomIcon";
import { RoomCard } from "../components/RoomCard";
import { ProgressCard } from "../components/ProgressCard";

export function Dashboard() {
  const {
    currentUser,
    today,
    moveName,
    moveDate,
    daysUntil,
    setShowAdd,
    setEditingItemId,
    setAddItemBoxContext,
    setShowAddBox,
    setEditingBoxId,
    openSearchFilter,
    setActive,
    setShowProfile,
    progress,
    packed,
    totalItems,
    boxes,
    items,
    userRoomNames,
    roomFor,
    openRoom,
    openBox,
    openAdd,
  } = useApp();

  return (
    <>
      <section className="welcome-row">
        <div>
          <p className="eyebrow">{today.toUpperCase()}</p>
          <h1>
            Hey, {currentUser.displayName}!{" "}
            <span className="wave">✦</span>
          </h1>
          <p className="muted">Here is your moving day at a glance.</p>
        </div>
        <button className="move-selector" onClick={() => setShowProfile(true)}>
          <span className="status-dot" />
          {moveName}
          <ChevronRight size={15} />
        </button>
      </section>
      <section className="hero-card">
        <div>
          <span className="pill sage-pill">
            <CalendarDays size={13} /> MOVING DAY
          </span>
          <h2>{moveDate}</h2>
          <p>You've got this. One box at a time.</p>
          <div className="hero-meta">
            <span>
              <MapPin size={14} /> {currentUser.move?.from || "Current home"}
            </span>
            <ArrowUpRight size={14} />
            <span>{currentUser.move?.to || "New home"}</span>
          </div>
        </div>
        <div className="countdown">
          <strong>{daysUntil}</strong>
          <span>days to go</span>
        </div>
        <div className="hills" />
      </section>
      <section className="quick-grid">
        <button
          onClick={() => { setAddItemBoxContext(null); setEditingItemId(null); setShowAdd(true); }}
          className="quick-action primary-action"
        >
          <span className="action-icon">
            <Tag size={22} />
          </span>
          <span>
            <strong>Add item</strong>
            <small>Put something in a box</small>
          </span>
          <ChevronRight size={17} />
        </button>
        <button onClick={() => { setEditingBoxId(null); setShowAddBox(true); }} className="quick-action">
          <span className="action-icon box-option">
            <PackagePlus size={22} />
          </span>
          <span>
            <strong>Add box</strong>
            <small>Create a new destination</small>
          </span>
          <ChevronRight size={17} />
        </button>
        <button onClick={() => openSearchFilter("all")} className="quick-action">
          <span className="action-icon search-icon">
            <Search size={22} />
          </span>
          <span>
            <strong>Find an item</strong>
            <small>Search everything packed</small>
          </span>
          <ChevronRight size={17} />
        </button>
      </section>
      <div className="section-heading">
        <div>
          <div className="section-kicker">YOUR MOVE</div>
          <h2>What still needs doing?</h2>
        </div>
        <button className="text-button" onClick={() => setActive("move")}>
          View progress <ArrowUpRight size={15} />
        </button>
      </div>
      <section className="stats-grid">
        <ProgressCard progress={progress} packed={packed} totalItems={totalItems} />
        <button className="stat-card stat-card-button" onClick={() => setActive("boxes")}>
          <div className="stat-top">
            <span>Boxes ready</span>
            <Box size={17} />
          </div>
          <strong className="stat-number">
            {boxes.filter((box) => box.packed).length}
            <small> / {boxes.length}</small>
          </strong>
          <p className="stat-note">boxes ready to go</p>
        </button>
        <button className="stat-card amber-card stat-card-button" onClick={() => openSearchFilter("fragile")}>
          <div className="stat-top">
            <span>Fragile</span>
            <AlertTriangle size={17} />
          </div>
          <strong className="stat-number">{items.filter((item) => item.fragile).length}</strong>
          <p className="stat-note">handle with care</p>
        </button>
        <button className="stat-card amber-card stat-card-button" onClick={() => openSearchFilter("essential")}>
          <div className="stat-top">
            <span>Keep close</span>
            <Star size={17} />
          </div>
          <strong className="stat-number">{items.filter((item) => item.essential).length}</strong>
          <p className="stat-note">essential items</p>
        </button>
      </section>
      <section className="room-strip">
        <div className="section-kicker">YOUR NEW HOME</div>
        <div className="room-cards">
          {userRoomNames.map((room) => {
            const roomItems = items.filter((item) => item.roomId === room.id);
            const roomPacked = roomItems.filter((item) => item.packed).length;
            const roomPercent = roomItems.length ? Math.round((roomPacked / roomItems.length) * 100) : 0;
            return (
              <RoomCard
                key={room.id}
                room={room}
                boxCount={boxes.filter((box) => box.roomId === room.id).length}
                percent={roomPercent}
                onClick={() => openRoom(room.id)}
              />
            );
          })}
        </div>
      </section>
      <div className="content-columns">
        <section>
          <div className="section-heading compact">
            <div>
              <div className="section-kicker">RECENTLY PACKED</div>
              <h2>Boxes with a story</h2>
            </div>
            <button className="text-button" onClick={() => setActive("boxes")}>
              See all <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="box-list">
            {boxes.slice(0, 3).map((box) => {
              const room = roomFor(box.roomId);
              return (
                <button className="box-row" key={box.id} onClick={() => openBox(box.id)}>
                  <span className="box-thumb" style={{ background: room.color }}>
                    <Box size={20} />
                  </span>
                  <span className="box-copy">
                    <strong>{box.name}</strong>
                    <small>
                      <RoomIcon room={room} size={13} /> {room.name} · {box.itemCount} items
                    </small>
                  </span>
                  <span className={`mini-status ${box.packed ? "ready" : ""}`}>
                    {box.packed ? "Packed" : "Open"}
                  </span>
                  <ChevronRight size={16} />
                </button>
              );
            })}
          </div>
        </section>
        <aside className="tip-card">
          <div className="tip-title">
            <span className="tip-icon">
              <Lightbulb size={18} />
            </span>
            <span>PACKING TIP</span>
          </div>
          <h3>Pack a “first night” box</h3>
          <p>Keep chargers, toiletries, a clean shirt, and snacks together.</p>
          <button className="tip-link" onClick={openAdd}>
            Add to essentials <ArrowUpRight size={15} />
          </button>
        </aside>
      </div>
    </>
  );
}
