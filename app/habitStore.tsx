import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Habit, HabitLog } from "@/lib/types";

// Helper: format date as YYYY-MM-DD
export const todayKey = () => new Date().toISOString().split("T")[0];

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
};
type HabitActions = {
  addHabit: (habit: Habit) => void;
  removeHabit: (id: string) => void;
  updateHabit: (habit: Habit) => void;
  //updateHabitLog: (habitId: string) => void;
};
type HabitStore = HabitState & HabitActions;

const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      habitLog: {},
      addHabit: (habit: Habit) =>
        set((state) => ({ habits: [...state.habits, habit] })),
      removeHabit: (id: string) =>
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        })),
      updateHabit: (habit: Habit) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
        })),
      // Update Habbit Log!
    }),
    { name: "habits-storage" }
  )
);
export default useHabitStore;
