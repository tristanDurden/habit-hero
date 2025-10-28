import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Habit, HabitLog } from "@/lib/types";
import { da } from "date-fns/locale";

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
  updateHabitLog: (id: string, date: string) => void;
};
type HabitStore = HabitState & HabitActions;

const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [],
      habitLog: {},
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
      updateHabitLog: (id: string, date: string) =>
        set((state) => {
          const log = { ...state.habitLog };
          const habitLog = log[id] ? [...log[id]] : [];

          const existDate = habitLog.find((entry) => entry.date === date);
          if (existDate) {
            existDate.count++;
          } else {
            habitLog.push({ date: date, count: 1 });
          }
          log[id] = habitLog;
          return { habitLog: log };
        }),
    }),
    { name: "habits-storage" }
  )
);
export default useHabitStore;
