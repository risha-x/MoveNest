import { useEffect, useState } from "react";
import type { MoveDraft, User, AuthView, UserRoom } from "./types";
import { clearSessionUserId, getSessionUserId, setSessionUserId } from "./storage";
import { api } from "./services/api";
import { AppProvider, useApp } from "./context/AppContext";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Search } from "./pages/Search";
import { Boxes } from "./pages/Boxes";
import { Rooms } from "./pages/Rooms";
import { RoomDetails } from "./pages/RoomDetails";
import { BoxDetails } from "./pages/BoxDetails";
import { Move as MovePage } from "./pages/Move";
import { Navbar } from "./components/Navbar";
import { BottomNav } from "./components/BottomNav";
import { QuickAddModal } from "./components/QuickAddModal";
import { ItemModal } from "./components/ItemModal";
import { BoxModal } from "./components/BoxModal";
import { RoomModal } from "./components/RoomModal";
import { ItemPhotosModal } from "./components/ItemPhotosModal";
import { ProfileModal } from "./components/ProfileModal";
import { HelpModal } from "./components/HelpModal";
import { ErrorToast } from "./components/ErrorToast";
import "./App.css";

function AppShell() {
  const {
    active,
    userRooms,
    boxes,
    selectedRoom,
    viewedBox,
    showQuickAdd,
    setShowQuickAdd,
    showAdd,
    setShowAdd,
    showAddBox,
    setShowAddBox,
    showAddRoom,
    setShowAddRoom,
    showProfile,
    setShowProfile,
    showHelp,
    setShowHelp,
    errorMessage,
    clearError,
    conditionPhotoItem,
    setConditionPhotoItemId,
    selectedRoomId,
    addItemBoxContext,
    editingItem,
    editingBox,
    addItem,
    submitItemEdit,
    deleteItem,
    addBox,
    submitBoxEdit,
    deleteBox,
    addRoom,
    roomFor,
    currentUser,
    updateProfile,
    logout,
    setEditingItemId,
    setEditingBoxId,
  } = useApp();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        {active === "home" && <Dashboard />}
        {active === "search" && <Search />}
        {active === "boxes" && <Boxes />}
        {active === "rooms" && <Rooms />}
        {active === "room-detail" && selectedRoom && <RoomDetails />}
        {active === "box-detail" && viewedBox && <BoxDetails />}
        {active === "move" && <MovePage />}
      </main>
      <BottomNav />
      {showQuickAdd && (
        <QuickAddModal
          onClose={() => setShowQuickAdd(false)}
          onAddItem={() => { setShowQuickAdd(false); setEditingItemId(null); setShowAdd(true); }}
          onAddBox={() => { setShowQuickAdd(false); setShowAddBox(true); }}
        />
      )}
      {showAdd && (
        <ItemModal
          boxes={boxes}
          userRooms={userRooms}
          defaultRoomId={selectedRoomId ?? undefined}
          defaultBoxId={addItemBoxContext ?? undefined}
          editingItem={editingItem}
          onClose={() => { setShowAdd(false); setEditingItemId(null); }}
          onSubmit={editingItem ? submitItemEdit : addItem}
          onDelete={editingItem ? () => deleteItem(editingItem.id) : undefined}
        />
      )}
      {showAddBox && (
        <BoxModal
          userRooms={userRooms}
          defaultRoomId={selectedRoomId ?? undefined}
          editingBox={editingBox}
          onClose={() => { setShowAddBox(false); setEditingBoxId(null); }}
          onSubmit={editingBox ? submitBoxEdit : addBox}
          onDelete={editingBox ? () => deleteBox(editingBox.id) : undefined}
        />
      )}
      {showAddRoom && (
        <RoomModal onClose={() => setShowAddRoom(false)} onSubmit={addRoom} />
      )}
      {conditionPhotoItem && (
        <ItemPhotosModal
          item={conditionPhotoItem}
          room={roomFor(conditionPhotoItem.roomId) as UserRoom}
          onClose={() => setConditionPhotoItemId(null)}
        />
      )}
      {showProfile && (
        <ProfileModal
          user={currentUser}
          onClose={() => setShowProfile(false)}
          onSave={updateProfile}
          onLogout={logout}
        />
      )}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {errorMessage && <ErrorToast message={errorMessage} onDismiss={clearError} />}
    </div>
  );
}

function App() {
  const [authView, setAuthView] = useState<AuthView>("welcome");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // There's no password/login here — just a locally-remembered id telling the
  // backend which user this browser is. On load, ask the API who that is.
  useEffect(() => {
    const storedId = getSessionUserId();
    if (!storedId) {
      // oxlint-disable-next-line react/set-state-in-effect
      setSessionLoading(false);
      return;
    }
    (async () => {
      try {
        const fetchedUser = await api.getUser(storedId);
        if (fetchedUser.onboardingCompleted) {
          const move = await api.getMove();
          setCurrentUser(move ? { ...fetchedUser, move } : fetchedUser);
        } else {
          // They started onboarding and left before finishing — resume rather
          // than silently create a second orphaned user on next "Get started".
          setPendingUser(fetchedUser);
          setCurrentUser(fetchedUser);
          setAuthView(fetchedUser.displayName ? "move" : "name");
        }
      } catch {
        clearSessionUserId();
      } finally {
        setSessionLoading(false);
      }
    })();
  }, []);

  const beginOnboarding = async () => {
    try {
      const user = await api.createUser("");
      setSessionUserId(user.id);
      setPendingUser(user);
      setCurrentUser(user);
      setAuthView("name");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Couldn't get started. Please try again.");
    }
  };
  const saveName = async (name: string) => {
    const base = pendingUser || currentUser!;
    try {
      const updated = await api.updateUser(base.id, { displayName: name });
      const user = { ...base, ...updated };
      setPendingUser(user);
      setCurrentUser(user);
      setAuthView("move");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Couldn't save your name. Please try again.");
    }
  };
  const saveMove = async (move: MoveDraft) => {
    const base = pendingUser || currentUser!;
    try {
      const createdMove = await api.createMove({
        name: move.name,
        date: move.date,
        from: move.from,
        to: move.to,
        rooms: move.rooms.map((room) => ({
          name: room.name,
          type: room.type,
          icon: room.icon,
          color: room.color,
        })),
      });
      const user = { ...base, move: createdMove, onboardingCompleted: true };
      setCurrentUser(user);
      setAuthView("welcome");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Couldn't create your move. Please try again.");
    }
  };
  const logout = () => {
    clearSessionUserId();
    setCurrentUser(null);
    setPendingUser(null);
    setAuthView("welcome");
  };

  if (sessionLoading) return null;

  if (!currentUser || !currentUser.onboardingCompleted) {
    return (
      <>
        <Onboarding
          view={authView}
          onBegin={beginOnboarding}
          onName={saveName}
          onMove={saveMove}
        />
        {authError && <ErrorToast message={authError} onDismiss={() => setAuthError(null)} />}
      </>
    );
  }

  return (
    <AppProvider user={currentUser} setUser={setCurrentUser} onLogout={logout}>
      <AppShell />
    </AppProvider>
  );
}

export default App;
