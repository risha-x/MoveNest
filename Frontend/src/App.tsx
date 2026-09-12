import { useEffect, useState } from "react";
import type { MoveDraft, User, AuthView, UserRoom } from "./types";
import { clearSessionUserId, getSessionUserId } from "./storage";
import { api } from "./services/api";
import { supabase } from "./lib/supabaseClient";
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

  // Fetches the user for an id and puts the app in the right place for them:
  // straight to the dashboard if onboarding is done, or resume onboarding
  // where they left off. Shared by session bootstrap and the log-in form.
  const loadUserSession = async (userId: string) => {
    const fetchedUser = await api.getUser(userId);
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
  };

  // Prefer a real Supabase session; fall back to the legacy locally-remembered
  // id (pre-real-auth accounts) if none exists. Either way, ask the API who
  // that is - api.ts sends whichever credential is available on every call.
  useEffect(() => {
    (async () => {
      try {
        const supabaseSession = supabase ? (await supabase.auth.getSession()).data.session : null;
        const storedId = supabaseSession ? supabaseSession.user.id : getSessionUserId();
        if (!storedId) {
          return;
        }
        await loadUserSession(storedId);
      } catch {
        clearSessionUserId();
      } finally {
        setSessionLoading(false);
      }
    })();
  }, []);

  const beginOnboarding = () => {
    setAuthView("name");
  };
  const signUp = async (fields: { name: string; email: string; password: string }) => {
    if (!supabase) {
      setAuthError("Sign-up isn't available right now - Supabase isn't configured.");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signUp({ email: fields.email, password: fields.password });
      if (error) throw error;
      if (!data.session) throw new Error("Sign-up succeeded but no session was returned. Please try signing in.");
      const fetchedUser = await api.getUser(data.session.user.id);
      const updated = await api.updateUser(fetchedUser.id, { displayName: fields.name, email: fields.email });
      const user = { ...fetchedUser, ...updated };
      setPendingUser(user);
      setCurrentUser(user);
      setAuthView("move");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Couldn't create your account. Please try again.");
    }
  };
  const logIn = async (fields: { email: string; password: string }) => {
    if (!supabase) {
      setAuthError("Log in isn't available right now - Supabase isn't configured.");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword(fields);
      if (error) throw error;
      await loadUserSession(data.user.id);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Couldn't log in. Check your email and password.");
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
    supabase?.auth.signOut();
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
          onSignUp={signUp}
          onMove={saveMove}
          onShowLogin={() => setAuthView("login")}
          onBackToWelcome={() => setAuthView("welcome")}
          onLogin={logIn}
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
