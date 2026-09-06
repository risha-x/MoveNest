import { ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { SearchBar } from "../components/SearchBar";
import { ItemCard } from "../components/ItemCard";

const FILTER_LABELS = { all: "All", essential: "Essential", fragile: "Fragile", unpacked: "Unpacked" } as const;

export function Search() {
  const {
    search,
    setSearch,
    filteredItems,
    items,
    searchFilter,
    setSearchFilter,
    packed,
    boxes,
    roomFor,
    openBox,
    setActive,
    setConditionPhotoItemId,
    openItemEdit,
    toggleItemPacked,
    toggleItemUnpacked,
  } = useApp();

  const searchResults = search
    ? filteredItems
    : items.filter((item) =>
        searchFilter === "all"
          ? true
          : searchFilter === "essential"
            ? item.essential
            : searchFilter === "fragile"
              ? item.fragile
              : !item.unpacked,
      );

  return (
    <section className="view-section">
      <button className="back-link" onClick={() => setActive("home")}><ArrowLeft size={14} /> Return to Home</button>
      <p className="eyebrow">THE LOST AND FOUND</p>
      <h1>Find my item</h1>
      <p className="muted">Search by item name, room, or box.</p>
      <SearchBar value={search} onChange={setSearch} />
      <div className="chip-row">
        {(["all", "essential", "fragile", "unpacked"] as const).map((filter) => (
          <button
            key={filter}
            className={searchFilter === filter ? "active" : ""}
            onClick={() => setSearchFilter(filter)}
          >
            {FILTER_LABELS[filter]}
          </button>
        ))}
      </div>
      <div className="results-header">
        <span>{search ? `${searchResults.length} matches` : `${searchResults.length} items`}</span>
        <span className="muted">{packed} items packed</span>
      </div>
      <div className="search-results">
        {searchResults.length === 0 && (
          <p className="muted" style={{ padding: "15px 6px" }}>No items match yet.</p>
        )}
        {searchResults.map((item) => {
          const box = boxes.find((entry) => entry.id === item.boxId);
          const room = roomFor(item.roomId);
          return (
            <ItemCard
              key={item.id}
              item={item}
              subtitle={
                <>
                  {box?.name || "Unassigned"} <span>→</span> {room.name}
                </>
              }
              onOpen={() => (item.boxId ? openBox(item.boxId) : setActive("boxes"))}
              onPhotos={() => setConditionPhotoItemId(item.id)}
              onEdit={() => openItemEdit(item)}
              onTogglePacked={() => toggleItemPacked(item.id)}
              onToggleUnpacked={() => toggleItemUnpacked(item.id)}
            />
          );
        })}
      </div>
    </section>
  );
}
