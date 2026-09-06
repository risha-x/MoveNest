import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { Item, MoveBox, Room, User, UserRoom } from "../types";
import { rooms } from "../storage";
import { api } from "../services/api";

export type SearchFilter = "essential" | "fragile" | "unpacked" | "all";
export type MoveTask = { label: string; detail: string; action: () => void };

type AppContextValue = {
  currentUser: User;
  boxes: MoveBox[];
  items: Item[];
  active: string;
  setActive: (view: string) => void;
  search: string;
  setSearch: (value: string) => void;
  showAdd: boolean;
  setShowAdd: (value: boolean) => void;
  showQuickAdd: boolean;
  setShowQuickAdd: (value: boolean) => void;
  showAddBox: boolean;
  setShowAddBox: (value: boolean) => void;
  showProfile: boolean;
  setShowProfile: (value: boolean) => void;
  showHelp: boolean;
  setShowHelp: (value: boolean) => void;
  selectedRoomId: string | null;
  setSelectedRoomId: (id: string | null) => void;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  viewedBoxId: string | null;
  searchFilter: SearchFilter;
  setSearchFilter: (filter: SearchFilter) => void;
  boxRoomFilter: string;
  setBoxRoomFilter: (id: string) => void;
  addItemBoxContext: string | null;
  setAddItemBoxContext: (id: string | null) => void;
  editingItemId: string | null;
  setEditingItemId: (id: string | null) => void;
  editingBoxId: string | null;
  setEditingBoxId: (id: string | null) => void;
  showAddRoom: boolean;
  setShowAddRoom: (value: boolean) => void;
  conditionPhotoItemId: string | null;
  setConditionPhotoItemId: (id: string | null) => void;
  boxPhotoCounts: Record<string, number>;
  filteredItems: Item[];
  packed: number;
  totalItems: number;
  progress: number;
  userRooms: UserRoom[];
  roomFor: (id: string) => Room | UserRoom;
  moveName: string;
  moveDate: string;
  userRoomNames: UserRoom[];
  daysUntil: number;
  today: string;
  addItem: (event: FormEvent<HTMLFormElement>) => void;
  addBox: (event: FormEvent<HTMLFormElement>) => void;
  submitItemEdit: (event: FormEvent<HTMLFormElement>) => void;
  deleteItem: (id: string) => void;
  submitBoxEdit: (event: FormEvent<HTMLFormElement>) => void;
  deleteBox: (id: string) => void;
  addRoom: (name: string, icon: Room["icon"]) => void;
  deleteRoom: (id: string) => void;
  openAdd: () => void;
  openRoom: (id: string) => void;
  openBox: (id: string) => void;
  openSearchFilter: (filter: SearchFilter) => void;
  openItemEdit: (item: Item) => void;
  openBoxEdit: (box: MoveBox) => void;
  toggleItemPacked: (id: string) => void;
  toggleBoxPacked: (id: string) => void;
  toggleRoomItemsPacked: (roomId: string, packed: boolean) => void;
  selectedRoom: UserRoom | undefined;
  viewedBox: MoveBox | undefined;
  editingItem: Item | null;
  editingBox: MoveBox | null;
  conditionPhotoItem: Item | null;
  visibleTasks: MoveTask[];
  renameRoom: (event: FormEvent<HTMLFormElement>) => void;
  updateProfile: (updates: {
    displayName: string;
    email: string;
    move: { name: string; date: string; from: string; to: string };
  }) => void;
  logout: () => void;
  errorMessage: string | null;
  clearError: () => void;
  reportError: (err: unknown, fallback?: string) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

// oxlint-disable-next-line react/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({
  user,
  setUser,
  onLogout,
  children,
}: {
  user: User;
  setUser: (user: User) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const [boxes, setBoxes] = useState<MoveBox[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState("home");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAddBox, setShowAddBox] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [viewedBoxId, setViewedBoxId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("essential");
  const [boxRoomFilter, setBoxRoomFilter] = useState<string>("all");
  const [addItemBoxContext, setAddItemBoxContext] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [conditionPhotoItemId, setConditionPhotoItemId] = useState<string | null>(null);
  const [boxPhotoCounts, setBoxPhotoCounts] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [todayTimestamp] = useState(() => Date.now());

  const clearError = useCallback(() => setErrorMessage(null), []);
  const reportError = useCallback((err: unknown, fallback = "Something went wrong. Please try again.") => {
    console.error(err);
    setErrorMessage(err instanceof Error ? err.message : fallback);
  }, []);

  const moveId = user.move?.id;
  const userRooms = useMemo(() => user.move?.rooms || [], [user.move]);

  // Boxes and items now live in SQLite behind the API — this is the one place
  // that fetches them, and every mutation below re-calls it so local state
  // always matches what the server just persisted.
  const refreshRequestId = useRef(0);
  const refreshInventory = useCallback(async () => {
    const requestId = ++refreshRequestId.current;
    if (!moveId) {
      // oxlint-disable-next-line react/set-state-in-effect
      setBoxes([]);
      // oxlint-disable-next-line react/set-state-in-effect
      setItems([]);
      return;
    }
    try {
      const [nextBoxes, nextItems] = await Promise.all([
        api.getBoxesByMove(moveId),
        api.getItemsByMove(moveId),
      ]);
      // A newer refresh may have started (and even resolved) while this one was
      // in flight - drop this result rather than clobber fresher state with it.
      if (requestId !== refreshRequestId.current) return;
      // oxlint-disable-next-line react/set-state-in-effect
      setBoxes(nextBoxes);
      // oxlint-disable-next-line react/set-state-in-effect
      setItems(nextItems);
    } catch (err) {
      if (requestId !== refreshRequestId.current) return;
      reportError(err, "Couldn't load your boxes and items. Please refresh.");
    }
  }, [moveId, reportError]);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    refreshInventory();
  }, [refreshInventory]);

  useEffect(() => {
    if (active === "boxes" && moveId) {
      api.getPhotoCounts(moveId).then(setBoxPhotoCounts);
    }
  }, [active, moveId, boxes]);

  const filteredItems = useMemo(
    () => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const packed = items.filter((item) => item.packed).length;
  const totalItems = items.length;
  const progress = totalItems ? Math.round((packed / totalItems) * 100) : 0;
  const roomFor = (id: string) => userRooms.find((room) => room.id === id) || userRooms[0] || rooms[0];
  const moveName = user.move?.name || "My move";
  const moveDate = user.move?.date
    ? new Date(`${user.move.date}T12:00:00`).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Your moving day";
  const userRoomNames = userRooms;
  const daysUntil = user.move?.date
    ? Math.max(0, Math.ceil((new Date(`${user.move.date}T12:00:00`).getTime() - todayTimestamp) / 86400000))
    : 0;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const addItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.createItem({
        boxId: String(data.get("box")),
        name: String(data.get("name")),
        essential: data.get("essential") === "on",
        fragile: data.get("fragile") === "on",
        notes: String(data.get("notes") ?? "").trim(),
      });
      await refreshInventory();
      setShowAdd(false);
    } catch (err) {
      reportError(err, "Couldn't add that item. Please try again.");
    }
  };
  const addBox = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.createBox({
        roomId: String(data.get("room")),
        name: String(data.get("name")),
        fragile: data.get("fragile") === "on",
        notes: String(data.get("notes") ?? "").trim(),
      });
      await refreshInventory();
      setShowAddBox(false);
    } catch (err) {
      reportError(err, "Couldn't add that box. Please try again.");
    }
  };
  const submitItemEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingItemId) return;
    const data = new FormData(event.currentTarget);
    try {
      await api.updateItem(editingItemId, {
        name: String(data.get("name")),
        boxId: String(data.get("box")),
        fragile: data.get("fragile") === "on",
        essential: data.get("essential") === "on",
        notes: String(data.get("notes") ?? "").trim(),
      });
      await refreshInventory();
      setEditingItemId(null);
      setShowAdd(false);
    } catch (err) {
      reportError(err, "Couldn't save that item. Please try again.");
    }
  };
  const deleteItem = async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await api.deleteItem(id);
      await refreshInventory();
      setEditingItemId(null);
      setShowAdd(false);
    } catch (err) {
      reportError(err, "Couldn't delete that item. Please try again.");
    }
  };
  const submitBoxEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingBoxId) return;
    const data = new FormData(event.currentTarget);
    try {
      await api.updateBox(editingBoxId, {
        name: String(data.get("name")),
        roomId: String(data.get("room")),
        fragile: data.get("fragile") === "on",
        notes: String(data.get("notes") ?? "").trim(),
      });
      await refreshInventory();
      setEditingBoxId(null);
      setShowAddBox(false);
    } catch (err) {
      reportError(err, "Couldn't save that box. Please try again.");
    }
  };
  const deleteBox = async (id: string) => {
    const box = boxes.find((entry) => entry.id === id);
    if (!box) return;
    const message = box.itemCount > 0
      ? `Delete "${box.name}" and its ${box.itemCount} item${box.itemCount === 1 ? "" : "s"}?`
      : `Delete "${box.name}"?`;
    if (!confirm(message)) return;
    try {
      await api.deleteBox(id);
      await refreshInventory();
      setEditingBoxId(null);
      setShowAddBox(false);
      if (viewedBoxId === id) {
        setViewedBoxId(null);
        setActive("boxes");
      }
    } catch (err) {
      reportError(err, "Couldn't delete that box. Please try again.");
    }
  };
  const addRoom = async (name: string, icon: Room["icon"]) => {
    if (!user.move) return;
    const colors: Record<Room["icon"], string> = {
      bed: "#b9e8dc",
      utensils: "#f5c563",
      home: "#f6c9b8",
      archive: "#c7e6e2",
    };
    try {
      const created = await api.createRoom({ moveId: user.move.id, name, type: icon, icon, color: colors[icon] });
      setUser({ ...user, move: { ...user.move, rooms: [...userRooms, created] } });
      setShowAddRoom(false);
    } catch (err) {
      reportError(err, "Couldn't add that room. Please try again.");
    }
  };
  const deleteRoom = async (id: string) => {
    if (!user.move) return;
    if (userRooms.length <= 1) {
      alert("You need at least one room. Add another room before deleting this one.");
      return;
    }
    const room = userRooms.find((entry) => entry.id === id);
    if (!room) return;
    const roomBoxCount = boxes.filter((box) => box.roomId === id).length;
    const roomItemCount = items.filter((item) => item.roomId === id).length;
    const message = roomBoxCount > 0 || roomItemCount > 0
      ? `Delete "${room.displayName}" and its ${roomBoxCount} box${roomBoxCount === 1 ? "" : "es"} and ${roomItemCount} item${roomItemCount === 1 ? "" : "s"}?`
      : `Delete "${room.displayName}"?`;
    if (!confirm(message)) return;
    try {
      await api.deleteRoom(id);
      setUser({ ...user, move: { ...user.move, rooms: userRooms.filter((entry) => entry.id !== id) } });
      await refreshInventory();
      setActive("rooms");
    } catch (err) {
      reportError(err, "Couldn't delete that room. Please try again.");
    }
  };
  const openAdd = () => {
    setShowAdd(false);
    setShowAddBox(false);
    setShowQuickAdd(true);
  };
  const openRoom = (id: string) => {
    setSelectedRoomId(id);
    setActive("room-detail");
  };
  const openBox = (id: string) => {
    setViewedBoxId(id);
    setActive("box-detail");
  };
  const openSearchFilter = (filter: SearchFilter) => {
    setSearchFilter(filter);
    setSearch("");
    setActive("search");
  };
  const openItemEdit = (item: Item) => {
    setEditingItemId(item.id);
    setSelectedRoomId(item.roomId);
    setAddItemBoxContext(item.boxId);
    setShowAdd(true);
  };
  const openBoxEdit = (box: MoveBox) => {
    setEditingBoxId(box.id);
    setShowAddBox(true);
  };
  const toggleItemPacked = async (id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    const nextPacked = !item.packed;
    setItems((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, packed: nextPacked } : entry)),
    );
    try {
      await api.updateItem(id, { packed: nextPacked });
    } catch (err) {
      setItems((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, packed: item.packed } : entry)),
      );
      reportError(err, "Couldn't update that item. Please try again.");
    }
  };
  const toggleBoxPacked = async (id: string) => {
    const box = boxes.find((entry) => entry.id === id);
    if (!box) return;
    const nextPacked = !box.packed;
    setBoxes((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, packed: nextPacked } : entry)),
    );
    try {
      await api.updateBox(id, { packed: nextPacked });
      // Sealing a box cascades to mark its items packed server-side — refetch to see it.
      if (nextPacked) await refreshInventory();
    } catch (err) {
      setBoxes((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, packed: box.packed } : entry)),
      );
      reportError(err, "Couldn't update that box. Please try again.");
    }
  };
  const toggleRoomItemsPacked = async (roomId: string, packedValue: boolean) => {
    const previousById = new Map(
      items.filter((entry) => entry.roomId === roomId).map((entry) => [entry.id, entry.packed] as const),
    );
    setItems((current) =>
      current.map((entry) => (entry.roomId === roomId ? { ...entry, packed: packedValue } : entry)),
    );
    try {
      await api.setRoomItemsPacked(roomId, packedValue);
    } catch (err) {
      setItems((current) =>
        current.map((entry) =>
          previousById.has(entry.id) ? { ...entry, packed: previousById.get(entry.id)! } : entry,
        ),
      );
      reportError(err, "Couldn't update those items. Please try again.");
    }
  };

  const selectedRoom = userRooms.find((room) => room.id === selectedRoomId);
  const viewedBox = boxes.find((box) => box.id === viewedBoxId);
  const editingItem = items.find((item) => item.id === editingItemId) ?? null;
  const editingBox = boxes.find((box) => box.id === editingBoxId) ?? null;
  const conditionPhotoItem = items.find((item) => item.id === conditionPhotoItemId) ?? null;

  const moveTasks: MoveTask[] = [];
  const openBoxCount = boxes.filter((box) => !box.packed).length;
  if (openBoxCount > 0) {
    moveTasks.push({
      label: "Seal your open boxes",
      detail: `${openBoxCount} box${openBoxCount === 1 ? " still needs" : "es still need"} packing`,
      action: () => setActive("boxes"),
    });
  }
  const essentialLeft = items.filter((item) => item.essential && !item.packed).length;
  if (essentialLeft > 0) {
    moveTasks.push({
      label: "Pack your essentials",
      detail: `${essentialLeft} essential item${essentialLeft === 1 ? "" : "s"} still unpacked`,
      action: () => openSearchFilter("essential"),
    });
  }
  const roomProgress = userRoomNames
    .map((room) => {
      const roomItems = items.filter((item) => item.roomId === room.id);
      const roomPacked = roomItems.filter((item) => item.packed).length;
      const percent = roomItems.length ? Math.round((roomPacked / roomItems.length) * 100) : 0;
      return { room, percent, hasItems: roomItems.length > 0 };
    })
    .filter((entry) => entry.hasItems && entry.percent < 100)
    .sort((a, b) => a.percent - b.percent);
  if (roomProgress[0]) {
    const { room, percent } = roomProgress[0];
    moveTasks.push({
      label: `Finish packing ${room.displayName}`,
      detail: `${percent}% packed`,
      action: () => openRoom(room.id),
    });
  }
  const visibleTasks = moveTasks.slice(0, 3);

  const renameRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRoom || !user.move) return;
    const name = String(new FormData(event.currentTarget).get("roomName")).trim();
    if (!name) return;
    try {
      const updated = await api.renameRoom(selectedRoom.id, name);
      setUser({
        ...user,
        move: { ...user.move, rooms: userRooms.map((room) => (room.id === selectedRoom.id ? updated : room)) },
      });
      setEditingRoomId(null);
    } catch (err) {
      reportError(err, "Couldn't rename that room. Please try again.");
    }
  };

  const updateProfile = async (updates: {
    displayName: string;
    email: string;
    move: { name: string; date: string; from: string; to: string };
  }) => {
    try {
      const updatedUser = await api.updateUser(user.id, { displayName: updates.displayName, email: updates.email });
      const updatedMove = user.move ? await api.updateMove(user.move.id, updates.move) : undefined;
      setUser({
        ...user,
        displayName: updatedUser.displayName,
        email: updatedUser.email,
        move: updatedMove ? { ...user.move!, ...updatedMove } : user.move,
      });
      setShowProfile(false);
    } catch (err) {
      reportError(err, "Couldn't save your changes. Please try again.");
    }
  };

  const value: AppContextValue = {
    currentUser: user,
    boxes,
    items,
    active,
    setActive,
    search,
    setSearch,
    showAdd,
    setShowAdd,
    showQuickAdd,
    setShowQuickAdd,
    showAddBox,
    setShowAddBox,
    showProfile,
    setShowProfile,
    showHelp,
    setShowHelp,
    selectedRoomId,
    setSelectedRoomId,
    editingRoomId,
    setEditingRoomId,
    viewedBoxId,
    searchFilter,
    setSearchFilter,
    boxRoomFilter,
    setBoxRoomFilter,
    addItemBoxContext,
    setAddItemBoxContext,
    editingItemId,
    setEditingItemId,
    editingBoxId,
    setEditingBoxId,
    showAddRoom,
    setShowAddRoom,
    conditionPhotoItemId,
    setConditionPhotoItemId,
    boxPhotoCounts,
    filteredItems,
    packed,
    totalItems,
    progress,
    userRooms,
    roomFor,
    moveName,
    moveDate,
    userRoomNames,
    daysUntil,
    today,
    addItem,
    addBox,
    submitItemEdit,
    deleteItem,
    submitBoxEdit,
    deleteBox,
    addRoom,
    deleteRoom,
    openAdd,
    openRoom,
    openBox,
    openSearchFilter,
    openItemEdit,
    openBoxEdit,
    toggleItemPacked,
    toggleBoxPacked,
    toggleRoomItemsPacked,
    selectedRoom,
    viewedBox,
    editingItem,
    editingBox,
    conditionPhotoItem,
    visibleTasks,
    renameRoom,
    updateProfile,
    logout: onLogout,
    errorMessage,
    clearError,
    reportError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
