import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Folder, Habit, HabitLog } from "@/lib/types";
import { QueuedOp } from "@/lib/queuedOps";
import { Timer } from "./types/timer";

// set up the gamification. maybe in a deifferent file so there is less info

// export type PointsSystem = {
//   award: string;
//   points: number;
// };

// export type UserExp = {
//   points: number;
//   level: number;
//   badges: [];
// };

type HabitState = {
  habits: Habit[];
  habitLog: HabitLog;
  queue: QueuedOp[];
  isOnline: boolean;
  folders: Folder[];
};
type HabitActions = {
  addHabit: (habit: Habit) => void;
  removeHabit: (id: string) => void;
  updateHabit: (habit: Habit) => void;
  updateHabitLog: (habitId: string, date: string, duration?: number) => void;
  updateHabitLogDuration: (
    habitId: string,
    date: string,
    duration: number
  ) => void;

  // sync actions
  pushQueue: (job: QueuedOp) => void;
  setOnline: (online: boolean) => void;
  syncWithDb: () => Promise<void>;

  // folders actions
  addFolder: (folder: Folder) => void;
  renameFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  addHabitToFolder: (habit: Habit, folderId: string) => void;
  removeHabitFromFolder: (habit: Habit, folderId: string) => void;
  // Helper to get habits for a folder
  getHabitsForFolder: (folderId: string) => Habit[];

  // timer action
  setTimer: (id: string, timer: Timer) => void;
  updateTimer: (id: string, partial: Partial<Timer>) => void;
  clearTimer: (id: string) => void;
};
type HabitStore = HabitState & HabitActions;

const useHabitStore = create<HabitStore>()(
  persist<HabitStore>(
    (set, get) => ({
      habits: [],
      habitLog: {},
      queue: [],
      isOnline: true,
      folders: [],

      setOnline: (online: boolean) => {
        set({ isOnline: online });
      },
      addHabit: (habit: Habit) =>
        set((state) => ({ habits: [...state.habits, habit] })),

      //  removing habit and removing in habitLog
      removeHabit: (id: string) =>
        set((state) => {
          const log = { ...state.habitLog };
          delete log[id];
          const habits = [...state.habits];
          const newHabits = habits.filter((habit) => habit.id !== id);
          const folders = state.folders.map((folder) =>
            folder.habitIds.includes(id)
              ? {
                  ...folder,
                  habitIds: folder.habitIds.filter((habitId) => habitId !== id),
                }
              : folder
          );
          return { habits: newHabits, habitLog: log, folders: folders };
        }),

      updateHabit: (habit: Habit) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habit.id ? { ...h, ...habit } : h
          ),
        })),

      // Update Habbit Log!
      updateHabitLog: (habitId: string, date: string, duration?: number) =>
        set((state) => {
          const log = { ...state.habitLog };
          const habitLog = log[habitId] ? [...log[habitId]] : [];

          const existDate = habitLog.find((entry) => entry.date === date);
          if (existDate) {
            existDate.count++;
            if (duration) existDate.duration += duration;
            console.log(existDate, duration);
          } else {
            habitLog.push({ date: date, count: 1, duration: duration || 0 });
          }
          log[habitId] = habitLog;
          return { habitLog: log };
        }),
      // Update only duration without incrementing count
      updateHabitLogDuration: (
        habitId: string,
        date: string,
        duration: number
      ) =>
        set((state) => {
          const log = { ...state.habitLog };
          const habitLog = log[habitId] ? [...log[habitId]] : [];

          const existDate = habitLog.find((entry) => entry.date === date);
          if (existDate) {
            existDate.duration += duration;
          } else {
            // If entry doesn't exist, create it with count 1 and the duration
            habitLog.push({ date: date, count: 1, duration: duration });
          }
          log[habitId] = habitLog;
          return { habitLog: log };
        }),

      pushQueue: (job: QueuedOp) =>
        set((state) => ({ queue: [...state.queue, job] })),

      syncWithDb: async () => {
        const { queue, isOnline } = get();
        if (!queue.length) return;
        if (!isOnline) return;
        try {
          const res = await fetch("/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(queue),
          });
          if (!res.ok) {
            throw new Error("Syn failed with status" + res.status);
          }
          set({ queue: [] });
          console.log("sync completed");
        } catch (err) {
          console.log("Sync failed.", err);
        }
      },
      // folders functions
      addFolder: (folder: Folder) =>
        set((state) => ({
          folders: [...state.folders, { ...folder }],
        })),
      renameFolder: (folder: Folder) =>
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folder.id
              ? {
                  ...folder,
                }
              : f
          ),
        })),
      deleteFolder: (id: string) =>
        set((state) => ({
          folders: state.folders.filter((folder: Folder) => folder.id != id),
        })),
      addHabitToFolder: (habit, folderId) =>
        set((state) => {
          const folder = state.folders.find((f) => f.id === folderId);
          if (!folder || folder.habitIds.includes(habit.id)) {
            return state; // Folder doesn't exist or habit already in folder
          }
          return {
            folders: state.folders.map((folder) =>
              folder.id === folderId
                ? {
                    ...folder,
                    habitIds: [...folder.habitIds, habit.id],
                    updatedAt: Date.now(),
                  }
                : folder
            ),
          };
        }),
      removeHabitFromFolder: (habit, folderId) =>
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === folderId
              ? {
                  ...folder,
                  habitIds: folder.habitIds.filter(
                    (habitId) => habitId !== habit.id
                  ),
                  updatedAt: Date.now(),
                }
              : folder
          ),
        })),
      // Helper function to get habits for a folder by matching IDs
      getHabitsForFolder: (folderId: string) => {
        const state = get();
        const folder = state.folders.find((f) => f.id === folderId);
        if (!folder) return [];
        return state.habits.filter((habit) =>
          folder.habitIds.includes(habit.id)
        );
      },
      // timer functions
      setTimer: (id: string, timer: Timer) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, timer } : h)),
        })),
      updateTimer: (id: string, partial) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id && h.timer
              ? { ...h, timer: { ...h.timer, ...partial } }
              : h
          ),
        })),
      clearTimer: (id: string) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, timer: undefined } : h
          ),
        })),
    }),
    {
      name: "habits-storage",
      // Migration: Convert old folder structure (habits array) to new structure (habitIds array)
      migrate: (persistedState: unknown) => {
        const state = persistedState as Partial<HabitStore>;
        if (state?.folders) {
          const migratedFolders = state.folders.map((folder) => {
            // Type guard: check if folder has old 'habits' array (legacy structure)
            const legacyFolder = folder as Folder & { habits?: Habit[] };
            if (legacyFolder.habits && Array.isArray(legacyFolder.habits)) {
              return {
                id: folder.id,
                name: folder.name,
                habitIds: legacyFolder.habits.map((habit) => habit.id),
              };
            }
            // Already migrated or new structure
            return folder;
          });
          return {
            ...state,
            folders: migratedFolders,
          } as HabitStore;
        }
        return persistedState as HabitStore;
      },
      version: 1, // Increment version to trigger migration
    }
  )
);
export default useHabitStore;
