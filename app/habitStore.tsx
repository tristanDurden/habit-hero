import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Habit, HabitLog } from "@/lib/types";
import { QueuedOp } from "@/lib/queueType";

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
};
type HabitActions = {
  addHabit: (habit: Habit) => void;
  removeHabit: (id: string) => void;
  updateHabit: (habit: Habit) => void;
  updateHabitLog: (habitId: string, date: string) => void;
  pushQueue: (job: QueuedOp) => void;
  setOnline: (online: boolean) => void;
  syncWithDb: () => Promise<void>;
};
type HabitStore = HabitState & HabitActions;

const useHabitStore = create<HabitStore>()(
  persist<HabitStore>(
    (set, get) => ({
      habits: [],
      habitLog: {},
      queue: [],
      isOnline: true,

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
          return { habits: newHabits, habitLog: log };
        }),

      updateHabit: (habit: Habit) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habit.id ? { ...h, ...habit } : h
          ),
        })),

      // Update Habbit Log!
      updateHabitLog: (habitId: string, date: string) =>
        set((state) => {
          const log = { ...state.habitLog };
          const habitLog = log[habitId] ? [...log[habitId]] : [];

          const existDate = habitLog.find((entry) => entry.date === date);
          if (existDate) {
            existDate.count++;
          } else {
            habitLog.push({ date: date, count: 1 });
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
    }),

    { name: "habits-storage" }
  )
);
export default useHabitStore;
