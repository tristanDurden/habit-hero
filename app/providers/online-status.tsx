"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import useHabitStore from "../habitStore";
import { Habit as dbHabit } from "@prisma/client";
import { dbHabitToUi } from "@/lib/dbformatting";
import { Habit as uiHabit } from "@/lib/types";
import { QueuedOp } from "@/lib/queueType";

type OnlineStatusContextValue = {
  isOnline: boolean;
};

const OnlineStatusContext = createContext<OnlineStatusContextValue>({
  isOnline: true,
});

export function OnlineStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const from store
  const isOnline = useHabitStore((state) => state.isOnline);
  const setOnline = useHabitStore((state) => state.setOnline);
  const syncWithDb = useHabitStore((state) => state.syncWithDb);
  const isSyncRef = useRef<boolean>(false);
  const wasOfflineRef = useRef<boolean>(false);

  // helper for fetching habits from db
  async function fetchLatestFromServer() {
    const response = await fetch("/api/habits", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch latest from db");
    const data: dbHabit[] = await response.json();
    return data;
  }

  function mergeServerToLocal(
    serverHabits: dbHabit[],
    localHabits: uiHabit[],
    queue: QueuedOp[]
  ): uiHabit[] {
    const byId = new Map<string, uiHabit>();

    // 1. Put all local habits in the map
    for (const habit of localHabits) {
      byId.set(habit.id, habit);
    }

    // 2. Process habits that exist on the server
    for (const serverHabit of serverHabits) {
      const local = byId.get(serverHabit.id);
      const serverUI = dbHabitToUi(serverHabit);

      if (!local) {
        // Habit exists only on server -> add it
        byId.set(serverUI.id, serverUI);
        continue;
      }

      // Both exist → compare updatedAt
      if (serverUI.updatedAt > local.updatedAt) {
        // Server has newer version → overwrite local
        byId.set(serverUI.id, serverUI);
      } else if (serverUI.updatedAt === local.updatedAt) {
        // Equal timestamps → prefer server (your rule)
        byId.set(serverUI.id, serverUI);
      }
      // If local is newer → keep local (it will sync later)
    }

    // 3. Process habits that exist only locally
    for (const localHabit of localHabits) {
      if (serverHabits.find((h) => h.id === localHabit.id)) continue;

      // Check if this habit has any queued operations
      // Queue payload can be: Habit (CREATE/UPDATE), {id: string} (DELETE), or {habitId, date, count} (LOGGING)
      const queued = queue.filter((op) => {
        if (op.type === "DELETE") {
          const payload = op.payload as { id: string };
          return payload.id === localHabit.id;
        } else if (op.type === "LOGGING") {
          const payload = op.payload as { habitId: string };
          return payload.habitId === localHabit.id;
        } else {
          // CREATE or UPDATE - payload is a Habit object
          const payload = op.payload as uiHabit;
          return payload.id === localHabit.id;
        }
      });

      // If queued for CREATE → keep
      if (queued.some((op) => op.type === "CREATE")) continue;

      // If queued for DELETE → remove
      if (queued.some((op) => op.type === "DELETE")) {
        byId.delete(localHabit.id);
        continue;
      }

      // Orphaned habit → keep or delete gracefully
      // You can choose depending on your app logic
      // For now: we keep it
    }

    return Array.from(byId.values());
  }

  // handle online transition
  const handleComeBackOnline = useCallback(async () => {
    // Prevent multiple simultaneous syncs
    if (isSyncRef.current) return;

    // Only sync if we transitioned from offline to online
    if (!wasOfflineRef.current) return;

    isSyncRef.current = true;
    console.log("🔄 Coming back online - starting sync...");

    try {
      // Update online status
      //setOnline(true);

      // Step 1: Fetch latest habits from database
      let serverHabits: dbHabit[] = [];
      try {
        serverHabits = await fetchLatestFromServer();
        console.log(`📥 Fetched ${serverHabits.length} habits from server`);
      } catch (err) {
        console.error("❌ Could not fetch latest habits from database:", err);
        // Continue with merge even if fetch fails - we'll still sync queue
      }

      // Step 2: Get current local state
      const store = useHabitStore.getState();
      const localHabits = store.habits || [];
      const queue = store.queue || [];

      // Step 3: Merge server habits with local habits
      if (serverHabits.length > 0 || localHabits.length > 0) {
        const mergedHabits = mergeServerToLocal(
          serverHabits,
          localHabits,
          queue
        );

        // Update store with merged habits
        useHabitStore.setState({ habits: mergedHabits });
        console.log(`✅ Merged ${mergedHabits.length} habits`);
      }

      // Step 4: Process the queue (sync local changes to server)
      if (queue.length > 0) {
        console.log(`📤 Syncing ${queue.length} queued operations...`);
        await syncWithDb();
        console.log("✅ Queue sync completed");
      } else {
        console.log("✓ No queued operations to sync");
      }
    } catch (err) {
      console.error("❌ Error during online sync:", err);
    } finally {
      // Reset sync flag after a short delay to allow for retries
      setTimeout(() => {
        isSyncRef.current = false;
      }, 1000);
    }
  }, [setOnline, syncWithDb]);

  useEffect(() => {
    const store = useHabitStore.getState();
    const initialOnline = navigator.onLine;
    store.setOnline(initialOnline);
    wasOfflineRef.current = !initialOnline;

    const goOnline = () => {
      store.setOnline(true);
      // Trigger sync if we were previously offline
      if (wasOfflineRef.current) {
        handleComeBackOnline();
      }
      wasOfflineRef.current = false;
    };

    const goOffline = () => {
      store.setOnline(false);
      wasOfflineRef.current = true;
      console.log("📴 Went offline");
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [handleComeBackOnline]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export const useOnlineStatus = () => useContext(OnlineStatusContext);
