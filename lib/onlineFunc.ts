import { Habit as dbHabit, Folder as dbFolder, HabitLog as dbHabitLog } from "@prisma/client";
import { Habit as uiHabit, Folder as uiFolder, HabitLog } from "@/lib/types";
import { QueuedOp } from "@/lib/queuedOps";
import { dbFolderToUi, dbHabitToUi } from "@/lib/dbformatting";
import { FolderOpPayloadMap } from "./queuedFolderOps";

export function mergeServerHabitsToLocal(
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
      if (op.type === "HABIT_DELETE") {
        const payload = op.payload as { id: string };
        return payload.id === localHabit.id;
      } else if (op.type === "HABIT_LOG") {
        const payload = op.payload as { habitId: string };
        return payload.habitId === localHabit.id;
      } else {
        // CREATE or UPDATE - payload is a Habit object
        const payload = op.payload as uiHabit;
        return payload.id === localHabit.id;
      }
    });

    // If queued for CREATE → keep
    if (queued.some((op) => op.type === "HABIT_CREATE")) continue;

    // If queued for DELETE → remove
    if (queued.some((op) => op.type === "HABIT_DELETE")) {
      byId.delete(localHabit.id);
      continue;
    }

    // Orphaned habit → keep or delete gracefully
    // You can choose depending on your app logic
    // For now: we keep it
  }

  return Array.from(byId.values());
}

export function mergeServerFoldersToLocal(serverFolders: dbFolder[], localFolders: uiFolder[], queue: QueuedOp[]): uiFolder[] {
  const byId = new Map<string, uiFolder>();

  for (const folder of localFolders) {
    byId.set(folder.id, folder);
  }

  for (const serverFolder of serverFolders) {
    const local = byId.get(serverFolder.id);
    const serverUI = dbFolderToUi(serverFolder);

    if (!local) {
      byId.set(serverUI.id, serverUI);
      continue;
    }
    if (serverUI.updatedAt > local.updatedAt) {
      byId.set(serverUI.id, serverUI);
    } else if (serverUI.updatedAt === local.updatedAt) {
      byId.set(serverUI.id, serverUI);
    }
  }
  for (const localFolder of localFolders) {
    if (serverFolders.find((f) => f.id === localFolder.id)) continue;

    // Check if this folder has any queued operations
    const queued = queue.filter((op) => {
      if (op.type === "FOLDER_DELETE") {
        const payload = op.payload as FolderOpPayloadMap["FOLDER_DELETE"];
        return payload.id === localFolder.id;
      } else if (op.type === "FOLDER_CREATE") {
        const payload = op.payload as FolderOpPayloadMap["FOLDER_CREATE"];
        return payload.id === localFolder.id;
      } else if (op.type === "FOLDER_UPDATE") {
        const payload = op.payload as FolderOpPayloadMap["FOLDER_UPDATE"];
        return payload.id === localFolder.id;
      }
      return false;
    });

    // If queued for CREATE → keep
    if (queued.some((op) => op.type === "FOLDER_CREATE")) continue;

    // If queued for DELETE → remove
    if (queued.some((op) => op.type === "FOLDER_DELETE")) {
      byId.delete(localFolder.id);
      continue;
    }

    // Orphaned folder → keep it (will sync later if needed)
  }
  return Array.from(byId.values());
}

export function mergeServerHabitLogToLocal(
  serverHabitLog: dbHabitLog[],
  localHabitLog: HabitLog,
  queue: QueuedOp[]
): HabitLog {
  // Convert server array to local format (group by habitId)
  const serverLogByHabitId: HabitLog = {};

  for (const serverEntry of serverHabitLog) {
    if (!serverLogByHabitId[serverEntry.habitId]) {
      serverLogByHabitId[serverEntry.habitId] = [];
    }
    serverLogByHabitId[serverEntry.habitId].push({
      date: serverEntry.date,
      count: serverEntry.count,
      duration: serverEntry.duration,
    });
  }

  // Start with a copy of local habitLog
  const merged: HabitLog = { ...localHabitLog };

  // Process each habitId that exists on the server
  for (const habitId in serverLogByHabitId) {
    const serverEntries = serverLogByHabitId[habitId];
    const localEntries = merged[habitId] || [];

    // Create a map of local entries by date for quick lookup
    const localByDate = new Map<string, { date: string; count: number; duration: number }>();
    for (const localEntry of localEntries) {
      localByDate.set(localEntry.date, localEntry);
    }

    // Check for queued HABIT_LOG operations for this habitId
    const queuedLogOps = queue.filter((op) => {
      if (op.type === "HABIT_LOG") {
        const payload = op.payload as { habitId: string; date: string, duration?: number };
        return payload.habitId === habitId;
      } else if (op.type === "HABIT_UPDATE_WITH_LOG") {
        const payload = op.payload as { habit: uiHabit; logCompletion: { date: string; count: number; duration?: number } };
        return payload.habit.id === habitId;
      }
      return false;
    });

    // Create a set of dates that are queued for sync
    const queuedDates = new Set<string>();
    for (const op of queuedLogOps) {
      if (op.type === "HABIT_LOG") {
        const payload = op.payload as { habitId: string; date: string };
        queuedDates.add(payload.date);
      } else if (op.type === "HABIT_UPDATE_WITH_LOG") {
        const payload = op.payload as { habit: uiHabit; logCompletion: { date: string; count: number; duration?: number } };
        queuedDates.add(payload.logCompletion.date);
      }
    }

    // Merge server entries with local entries
    const mergedEntries: Array<{ date: string; count: number; duration: number }> = [];
    const processedDates = new Set<string>();

    // First, process server entries (prefer server when conflict exists)
    for (const serverEntry of serverEntries) {
      processedDates.add(serverEntry.date);
      const localEntry = localByDate.get(serverEntry.date);

      if (localEntry) {
        // Both exist - prefer server version (database is source of truth)
        mergedEntries.push({
          date: serverEntry.date,
          count: serverEntry.count,
          duration: serverEntry.duration,
        });
      } else {
        // Only on server - add it
        mergedEntries.push({
          date: serverEntry.date,
          count: serverEntry.count,
          duration: serverEntry.duration,
        });
      }
    }

    // Then, add local-only entries that aren't queued (or are queued but we want to keep them)
    for (const localEntry of localEntries) {
      if (!processedDates.has(localEntry.date)) {
        // Local-only entry - keep it if it's not queued, or if it's queued we still keep it
        // (it will be synced, but we want to show it until sync completes)
        mergedEntries.push(localEntry);
      }
    }

    // Update merged log with the merged entries for this habitId
    if (mergedEntries.length > 0) {
      merged[habitId] = mergedEntries;
    } else if (merged[habitId]) {
      // If no entries after merge, remove the habitId key
      delete merged[habitId];
    }
  }

  // Process local-only habitIds (not present on server)
  for (const habitId in localHabitLog) {
    if (!serverLogByHabitId[habitId]) {
      // This habitId only exists locally
      // Check if there are queued operations for it
      const hasQueuedOps = queue.some((op) => {
        if (op.type === "HABIT_LOG" || op.type === "HABIT_UPDATE_WITH_LOG") {
          const payload = op.payload as { habitId: string };
          return payload.habitId === habitId;
        }
        return false;
      });

      // Keep local-only entries (they will sync later)
      if (localHabitLog[habitId].length > 0) {
        merged[habitId] = [...localHabitLog[habitId]];
      }
    }
  }

  return merged;
}
