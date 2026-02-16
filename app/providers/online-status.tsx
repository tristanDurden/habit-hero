"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import useHabitStore from "../habitStore";
import useListsStore from "../listsStore";
import { Habit as dbHabit, Folder as dbFolder, HabitLog as dbHabitLog } from "@prisma/client";
import { dbListWithItems } from "@/lib/dbformatting";
import { Habit as uiHabit, Folder as uiFolder } from "@/lib/types";
import { QueuedOp } from "@/lib/queuedOps";
import {
  mergeServerFoldersToLocal,
  mergeServerHabitsToLocal,
  mergeServerHabitLogToLocal,
  mergeServerListsToLocal,
} from "@/lib/onlineFunc";

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
  async function fetchLatestDataFromServer() {
    const response = await fetch("/api/sync-data", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch latest data from db");
    const data: { habits: dbHabit[]; folders: dbFolder[]; habitLog: dbHabitLog[]; lists: dbListWithItems[] } =
      await response.json();
    return data;
  }

  async function pingBackend(): Promise<boolean> {
    try {
      const res = await fetch("/api/health", {
        method: "GET",
        cache: "no-store",
      });
      return res.ok;
    } catch {
      return false;
    }
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

      // Fetch latest habits, folders, and habit logs from database
      let serverHabits: dbHabit[] = [];
      let serverFolders: dbFolder[] = [];
      let serverHabitLog: dbHabitLog[] = [];
      let serverLists: dbListWithItems[] = [];
      try {
        const data = await fetchLatestDataFromServer();
        serverHabits = data.habits;
        serverFolders = data.folders;
        serverHabitLog = data.habitLog || [];
        serverLists = data.lists || [];
        console.log(
          `📥 Fetched ${serverHabits.length} habits, ${serverFolders.length} folders, ${serverHabitLog.length} habit logs, and ${serverLists.length} lists from server`
        );
      } catch (err) {
        console.error("❌ Could not fetch latest data from database:", err);
      }

      // Get current local state
      const store = useHabitStore.getState();
      const localHabits = store.habits || [];
      const localFolders = store.folders || [];
      const localHabitLog = store.habitLog || {};
      const queue = store.queue || [];

      // Merge server habits with local habits
      if (serverHabits.length > 0 || localHabits.length > 0) {
        const mergedHabits = mergeServerHabitsToLocal(
          serverHabits,
          localHabits,
          queue
        );

        // Update store with merged habits
        useHabitStore.setState({ habits: mergedHabits });
        console.log(`✅ Merged ${mergedHabits.length} habits`);
      }
      // Merge server folders with local folders
      if (serverFolders.length > 0 || localFolders.length > 0) {
        const mergedFolders = mergeServerFoldersToLocal(
          serverFolders,
          localFolders,
          queue
        );
        useHabitStore.setState({ folders: mergedFolders });
        console.log(`✅ Merged ${mergedFolders.length} folders`);
      }
      // Merge server habit logs with local habit logs
      if (serverHabitLog.length > 0 || Object.keys(localHabitLog).length > 0) {
        const mergedHabitLog = mergeServerHabitLogToLocal(
          serverHabitLog,
          localHabitLog,
          queue
        );
        useHabitStore.setState({ habitLog: mergedHabitLog });
        console.log(`✅ Merged habit logs`);
      }

      // Merge server lists with local lists
      const localLists = useListsStore.getState().lists || [];
      if (serverLists.length > 0 || localLists.length > 0) {
        const mergedLists = mergeServerListsToLocal(
          serverLists,
          localLists,
          queue
        );
        useListsStore.setState({ lists: mergedLists });
        console.log(`✅ Merged ${mergedLists.length} lists`);
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

    const checkBackendReachability = async () => {
      const reachable = await pingBackend();
      const current = useHabitStore.getState();

      if (!reachable) {
        if (current.isOnline) console.log("Backend unreacheble");
        current.setOnline(false);
        wasOfflineRef.current = true;
        return;
      }
      //reachable
      if (!current.isOnline) console.log("Backend reacheble again");

      current.setOnline(true);
      // transition offline -> online
      if (wasOfflineRef.current) {
        await handleComeBackOnline();
      }
      wasOfflineRef.current = false;
    };

    const goOnline = () => {
      store.setOnline(true);
      // Trigger sync if we were previously offline
      checkBackendReachability();
    };

    const goOffline = () => {
      store.setOnline(false);
      wasOfflineRef.current = true;
      console.log("📴 Went offline");
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // check reachability on mount
    checkBackendReachability();
    // check every 30 sec
    const interval = setInterval(checkBackendReachability, 30_000);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      clearInterval(interval);
    };
  }, [handleComeBackOnline]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export const useOnlineStatus = () => useContext(OnlineStatusContext);
